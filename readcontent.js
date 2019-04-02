function receiveMessage(message, sender, sendResponse){
    if (message.is_about == "vaccines"){
	var text = document.body.innerText;
	var regexp = /rokot[etu]|vaccin/i;
	if (regexp.test(text)){
	    sendResponse({is_positive:true});
	} else {
	    sendResponse({is_positive:false});
	}
    }
}
chrome.runtime.onMessage.addListener(receiveMessage);


