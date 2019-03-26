function isTrustworthy(url, lists){
    var googleRegexp = /^https?:\/\/(www\.)?google\.[a-z]{2,6}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?$/i;
    if (googleRegexp.test(url))
	return 3;
    var domainRegexp = /^https?:\/\/(www\.)?([-a-zA-Z0-9@:%._\+~#=]+\.[a-z]{2,6})\//i;
    var match = url.match(domainRegexp);
    if (match == null)
	return 3;
    if (lists.whitelist != null && lists.whitelist.indexOf(match[2]) != -1)
	return 2;
    if (lists.blacklist != null && lists.blacklist.indexOf(match[2]) != -1)
	return 0;
    var s=0;
    for (var i=0;i<match[2].length;i++){
 	s = s+match[2].charCodeAt(i);
    }
    return s % 3;
}

function getTrust(url, f){
    chrome.storage.sync.get(["whitelist", "blacklist"], function(lists){f(isTrustworthy(url, lists))});
}

function receiveURL(message, sender, sendResponse){
    if(message.url != null){
	getTrust(message.url, function(trust){sendResponse({trust: trust})});
	return true;
    }
}
function changeIcon(trust){
    var imgurl = ["images/bad.png", "images/dubious.png", "images/good.png", "images/unknown.png"][trust];
    chrome.browserAction.setIcon({path: chrome.extension.getURL(imgurl)});
}

function monitorChangeTabs(activeInfo){
    chrome.tabs.get(activeInfo.tabId, function(tab){
	getTrust(tab.url, function(trust){
	    changeIcon(trust);
	});
    });
}

function monitorUpdateTabs(tabid, changeInfo, tab){
    if (changeInfo.status == "complete" && tab.active){
	getTrust(tab.url, function (trust){
	    if (trust == 0){
     		chrome.notifications.create(
     		    {type:"basic", iconUrl:"images/bad.png", title:"Varoitus", message:"Tällä sivulla oleva tieto ei ole luotettavaa"}
		);
	    }
	    changeIcon(trust);
	});
    }
}
function setLists(){
    chrome.storage.sync.set({whitelist: ["thl.fi","fimea.fi"],
			     blacklist: ["vauva.fi"]});
}
chrome.tabs.onActivated.addListener(monitorChangeTabs);
chrome.tabs.onUpdated.addListener(monitorUpdateTabs);
chrome.runtime.onMessage.addListener(receiveURL);
chrome.runtime.onInstalled.addListener(setLists);
