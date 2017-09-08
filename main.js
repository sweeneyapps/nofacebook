// app name: No Facebook
// author name: Paul Sweeney Jr.

var c = {
  BLACK: [0,0,0,255],
  GREEN: [34,139,3,255]
};

var app = {
  active: true,
  quoteShown: [],

  toggleBadge: (on) => {
    var text  = on ? "ON" : "OFF";
    var color = on ? c.GREEN : c.BLACK;
 
    chrome.browserAction.setBadgeBackgroundColor({color: color});
    chrome.browserAction.setBadgeText({text: text});  
  },

  setup: () => {
    app.setupEvents(); 
    app.toggleBadge(true);
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
        app.toggleBadge(app.active);
        app.updateTabs();
      }
    });

    chrome.browserAction.onClicked.addListener( () => {
      app.active = !app.active;
      app.toggleBadge(app.active);
      app.updateTabs();
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
 
