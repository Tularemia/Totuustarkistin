function writeText (tabs){
    chrome.runtime.sendMessage({url:tabs[0].url},
			       function(response){
				   var trust = response.trust;
				   var txts = document.querySelectorAll("div")
				   txts.forEach(function (txt){
				       txt.classList.add("hidden");
				   });
				   var shown = ["#badtxt", "#dubioustxt", "#goodtxt", "#unknowntxt"][trust];
				   document.querySelector(shown).classList.remove("hidden");
			       }
			      );

}

chrome.tabs.query({active:true}, writeText);
