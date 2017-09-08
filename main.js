// app name: No Facebook
// author: Paul Sweeney Jr.

var c = {
  BLACK: [0,0,0,255],
  GREEN: [34,139,3,255]
};

var app = {
  active: true,

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
    chrome.tabs.onCreated.addListener( (id, changeInfo, tab) => {
        // app.blockFacebook(tab);      
    });

    chrome.tabs.onUpdated.addListener( (id, changeInfo, tab) => {
        app.blockFacebook(tab);     
    });

    chrome.idle.setDetectionInterval(60*10);
    chrome.idle.onStateChanged.addListener(state => { 
      if (state !== "active") {
        app.toggleBadge(true);
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
    var tabID = tab.id

    if (reFacebook.test(tab.url)) {
      var code = app.active ? 
      `
      var style = document.createElement('style');
      style.setAttribute('id', 'nofacebookfeed'); 
      style.innerHTML = 'div[role="feed"] { display:none; }';
      document.querySelector('body').appendChild(style);
      `
      :
      `
      var style = document.querySelectorAll('#nofacebookfeed');
      style.forEach(function(item) {
        item.remove();
      });
      `;

      chrome.tabs.executeScript(tabID, {code: code}, (result) => {
        if (chrome.runtime.lastError) {  
        }
      });
    }
  },
};

app.setup();  // launch point for Chrome Extension to load.

