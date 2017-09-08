// app name: No Facebook
// author name: Paul Sweeney Jr.

var app = {
  active: true,

  setActive: (onActive) => {
    app.active = onActive;
    app.updateTabs();
  },

  setup: () => {
    app.setupEvents(); 
    app.updateTabs();
  },

  // setup Chrome Events
  setupEvents: () => {   
    chrome.tabs.onUpdated.addListener( (id, changeInfo, tab) => {
        app.blockFacebook(tab);     
    });

    chrome.idle.setDetectionInterval(60*10);
    chrome.idle.onStateChanged.addListener(state => { 
      if (state !== "active") {
        app.active = true;
        app.updateTabs();
      }
    });
  },

  updateTabs: () => {
    chrome.tabs.query({url:"*://*.facebook.com/*"}, (tabs) => {
      tabs.forEach(tab => {
        app.blockFacebook(tab);
      });
    });
  },

  blockFacebook: (tab) => {
    const reFacebook = /facebook\.com/; 
    var tabID = tab.id;

    if (reFacebook.test(tab.url)) { 
      chrome.pageAction.show(tab.id);  
      var code = app.active ? 
      `
      var check = document.querySelector("#nofacebookfeed");
      if (!check) {
        var style = document.createElement('style');
        style.setAttribute('id', 'nofacebookfeed'); 
        style.innerHTML = 'div[role="feed"] { display:none; } .nofacebookquotes { padding:20px; font-size:20px; }';
        document.querySelector('body').appendChild(style);
        
        fetch("https://talaikis.com/api/quotes/random/").then(result => {
          if (result.ok) {
            result.json().then(data => {
              var quotediv = document.createElement("div");
              quotediv.className = "nofacebookquotes";
              quotediv.innerHTML = "" + data.quote + "<p style='margin-left:10px;'>-" + data.author + "</p>";
              var contentArea = document.querySelector("#contentArea");
              contentArea.appendChild(quotediv);
            });
          } 
        });  
      }
      `
      :
      `
      var style = document.querySelectorAll('#nofacebookfeed, .nofacebookquotes');
      style.forEach(function(item) {
        item.remove();
      });
      `;

      chrome.tabs.executeScript(tabID, {code: code, runAt: "document_start"}, (result) => {
        if (chrome.runtime.lastError) {  
        }
      });
    }
  },
};

app.setup();  // launch point for Chrome Extension to load.
 

