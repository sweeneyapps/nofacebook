var app = chrome.extension.getBackgroundPage().app;
var activeButton = document.querySelector('#active');

activeButton.onclick = function() {   
  app.setActive( !app.active );
  updateUI();
};

function updateUI() {
  var classname = app.active ? "active" : "inactive";
  var active = app.active ? "ON" : "OFF"; 
  
  activeButton.className = classname;
  activeButton.innerHTML = active;
}

updateUI();

