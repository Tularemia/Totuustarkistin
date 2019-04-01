function isTrustworthy(url, lists){
    var googleRegexp = /^https?:\/\/(www\.)?google\.[a-z]{2,6}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?$/i;
    if (googleRegexp.test(url))
	return sourceNumber(url, 3);
    var domainRegexp = /^https?:\/\/(www\.)?([-a-zA-Z0-9@:%._\+~#=]+\.[a-z]{2,6})\//i;
    var match = url.match(domainRegexp);
    if (match == null)
	return sourceNumber(url, 3);
    if (lists.whitelist != null && lists.whitelist.indexOf(match[2]) != -1)
	return sourceNumber(url, 2);
    if (lists.blacklist != null && lists.blacklist.indexOf(match[2]) != -1)
	return sourceNumber(url, 0);
    var s=0;
    for (var i=0;i<match[2].length;i++){
 	s = s+match[2].charCodeAt(i);
    }
    var t = s % 3;
    return sourceNumber(url, t);
}
function hashUrl(url){
    var hash = 0;
    for (var i=0; i<url.length; i++){
	hash = (hash << 5) - hash + url.charCodeAt(i);
	hash |= 0;
    }
    hash = hash / (2**32) + 0.5;
    return hash;
}

function sourceNumber(url, trust){
    var nsrc = -1;
    var hash = 0;
    var hash = hashUrl(url);
    switch (trust){
    case 0: // Bernoulli
	nsrc = 0;	
	if(hash < 0.25)
	    nsrc = 1;
	break;
    case 1: // Tasajakauma
	nsrc = Math.ceil(hash*5);
	break;
    case 2: // Geometrinen
	var p = 0.3;
	var k = Math.log(1-hash)/Math.log(1-p);
	nsrc = Math.floor(k) + 4;
	break;
    }
    return {trust:trust, sources:nsrc};
}


function getTrust(url, f){
    chrome.storage.sync.get(["whitelist", "blacklist"], function(lists){f(isTrustworthy(url, lists))});
}

function receiveURL(message, sender, sendResponse){
    if(message.url != null){
	getTrust(message.url, function(trustobj){sendResponse(trustobj);});
	return true;
    }
}
function changeIcon(trust){
    var imgurl = ["images/bad.png", "images/dubious.png", "images/good.png", "images/unknown.png"][trust];
    chrome.browserAction.setIcon({path: chrome.extension.getURL(imgurl)});
}

function monitorChangeTabs(activeInfo){
    chrome.tabs.get(activeInfo.tabId, function(tab){
	getTrust(tab.url, function(trustobj){
	    changeIcon(trustobj.trust);
	});
    });
}

function monitorUpdateTabs(tabid, changeInfo, tab){
    if (changeInfo.status == "complete" && tab.active){
	getTrust(tab.url, function (trustobj){
	    if (trustobj.trust == 0){
     		chrome.notifications.create(
     		    {type:"basic", iconUrl:"images/bad.png", title:"Varoitus", message:"Tällä sivulla oleva tieto ei ole luotettavaa"}
		);
	    }
	    changeIcon(trustobj.trust);
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
