function showVaccine(response){
    if (response.is_positive){
	document.querySelector("#vaccinerec").classList.remove("hidden");
    }
}

function writeText (tabs){
    chrome.runtime.sendMessage({url:tabs[0].url},
			       function(response){
				   var txts = document.querySelectorAll("div")
				   txts.forEach(function (txt){
				       txt.classList.add("hidden");
				   });
				   var shown = 
				       ["#badtxt", "#dubioustxt", "#goodtxt", "#unknowntxt"][response.trust];
				   document.querySelector(shown).classList.remove("hidden");
				   if (response.trust != 3){
				       var srcs = document.querySelector("#sourcesnum");
				       srcs.querySelector("p").innerHTML += response.sources;
				       srcs.classList.remove("hidden");
				       document.querySelector("#recommend").classList.remove("hidden");
				       chrome.tabs.sendMessage(tabs[0].id, {is_about:"vaccines"}, showVaccine);
				   }
			       }
			      );

}

chrome.tabs.query({active:true}, writeText);
