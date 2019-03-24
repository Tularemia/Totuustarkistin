function isTrustworthy(url){
    var googleRegexp = /^https?:\/\/(www\.)?google\.[a-z]{2,6}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?$/i;
    if (googleRegexp.test(url))
	return 3;
    var domainRegexp = /^https?:\/\/[-a-zA-Z0-9@:%._\+~#=]+\.[a-z]{2,6}\//i;
    var match = url.match(domainRegexp);
    if (match == null)
	return 3;
    var s=0;
    for (var i=0;i<match[0].length;i++){
 	s = s+match[0].charCodeAt(i);
    }
    return s % 3;
}
function receiveURL(message, sender, sendResponse){
    sendResponse({trust:isTrustworthy(message.url)});
}
function changeIcon(trust){
    var imgurl = ["images/bad.png", "images/dubious.png", "images/good.png", "images/unknown.png"][trust];
    chrome.browserAction.setIcon({path: chrome.extension.getURL(imgurl)});
}

function monitorChangeTabs(activeInfo){
    chrome.tabs.get(activeInfo.tabId, function(tab){changeIcon(isTrustworthy(tab.url));});
}
function monitorUpdateTabs(tabid, changeInfo, tab){
    if (changeInfo.status == "complete" && tab.active){
	var trust = isTrustworthy(tab.url);
	if (trust == 0){
     	    chrome.notifications.create(
     		{type:"basic", iconUrl:"images/bad.png", title:"Varoitus", message:"Tällä sivulla oleva tieto ei ole luotettavaa"}
	    );
	}
	changeIcon(trust);
    }
}
chrome.tabs.onActivated.addListener(monitorChangeTabs);
chrome.tabs.onUpdated.addListener(monitorUpdateTabs);
chrome.runtime.onMessage.addListener(receiveURL);
