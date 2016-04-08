
(function() {

var activeWin;  
var activeTab;  
var bgWin;      

chrome.browserAction.onClicked.addListener(function(){
    activate();
});

var activate = function() {
  removeBGWindow();
  chrome.windows.getCurrent({}, function(win){
    activeWin = win;
  })
  chrome.windows.create({"url":"https://google.com/", "focused":true, "type":"panel", "width":500, "height":150}, function(win){
      bgWin = win;
      chrome.windows.update(activeWin.id, {"focused":true}, function(){
        chrome.tabs.query({active: true, windowId: activeWin.id}, function(tabs) {
          activeTab = tabs[0];    
          chrome.tabs.sendMessage(activeTab.id, {"message":"addEventHandlers"});
          chrome.browserAction.setIcon({path: 'icon_active.png', tabId: activeTab.id});
        });
      });
  });
};

chrome.tabs.onRemoved.addListener(function(tabId){
  if ( activeTab && (tabId == activeTab.id)) {
    removeBGWindow();
  }
});
chrome.tabs.onUpdated.addListener(function(tabId, info){
  if ( activeTab && (tabId == activeTab.id) && (info.status == 'complete')) {
    removeBGWindow();
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message == "_selectedTxt") {
      chrome.tabs.sendMessage(bgWin.tabs[0].id, {"message": "_setQuery", 'query':request.query});
    }
    else if (request.message == "_resultsParsed") {
      chrome.tabs.sendMessage(activeTab.id, {"message": "_showResults", "results":request.results});
    }
});

var removeBGWindow = function(){
    try {
      chrome.windows.remove(bgWin.id, function(){
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
        }        
      });
      chrome.browserAction.setIcon({path: 'icon_default.png', tabId: activeTab.id});
    } catch(err) {}
    bgWin = null;
};

})();
