function modifyResult(r){
    var y = r.getElementsByTagName("a");
    if (!y.length)
	return;
    chrome.runtime.sendMessage({url: y[0].href}, function(response){
	var trust=response.trust;
	var color = ["rgba(0,0,0,0.4)","rgba(128,128,128,0.4)","rgba(255,255,255,1)","rgba(255,255,255,1)"][trust];
	var text = "";
	if (trust == 3){
	    text = "Tämän sivun luotettavuutta ei voitu määrittää";
	} else {
	    var end = "tieteellisesti tutkittua lähdettä";
	    if (response.sources == 1)
		end = "tieteellisesti tutkittu lähde";
	    text = "Tällä sivulla on " + response.sources + " " + end;
	}

	p = r.parentNode;
	p.style.backgroundColor = color;
	var elem = imgElem(trust);
	var info = document.createElement("div")
	info.className = "tooltip";
	var subinfo = document.createElement("span")
	subinfo.className = "tooltiptext";
	subinfo.innerText = text;
	info.appendChild(elem);
	info.appendChild(subinfo);
	r.appendChild(info);
    }
			      );
}

function modify(resultList){
    for (var i=0; i<resultList.length; i++){
	var r = resultList.item(i);
	modifyResult(r);
    }
}

function imgElem (trust){
    var elem = document.createElement("img");
    var url = ["images/bad.png","images/dubious.png","images/good.png","images/unknown.png"][trust];
    elem.src=chrome.extension.getURL(url);
    return elem;
}

modify(document.getElementsByClassName("r"));
