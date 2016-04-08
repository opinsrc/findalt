(function() {
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message == "addEventHandlers") {
      document.body.removeEventListener('dblclick', searchSelection);
      document.body.removeEventListener('click', removeResults);
      document.body.removeEventListener('keyup', keyHandler);

      document.body.addEventListener('dblclick', searchSelection);
      document.body.addEventListener('click', removeResults);
      document.body.addEventListener('keyup', keyHandler);
    }
    else if (request.message == "_setQuery") {
      var qSent = setQuery(request.query)
      if (qSent) {
        parseResults(qSent);        
      }
    }
    else if (request.message == "_showResults") {
        showResults(request.results);
    }
});

var removeResults = function(e) {
    var el = document.getElementById('find-alternates-265358979');
    if (el && (!el.contains(e.target))) {
        el.remove();
    }
};

var keyHandler = function(e){
    if ( (e.ctrlKey) && (!e.shiftKey) && (!e.altKey) && (!e.metaKey) ) { 
        if (e.which == 73){ 
            searchSelection();
            return false; 
        }
    }
};

var searchSelection = function(){
    removeResults(); 
    chrome.runtime.sendMessage({"message":"_selectedTxt", 'query':window.getSelection().toString()});
};

var showLoadingImg = function(){
    var div = document.createElement('div');
    var img = new Image();

    img.onload = function() {
      div.appendChild(img);
    };
        
    div.innerHTML = '<br><span>FindAlt background process - Do not close !</span>';
    div.style.textAlign = 'center';
    div.style.color = '#888';
    div.style.position = 'fixed';
    div.style.width  = '100%';
    div.style.height = '100%';
    div.style.zIndex = '100000';
    div.style.backgroundColor = '#fff';
    document.body.insertBefore(div, document.body.firstChild);

    img.style.position = 'absolute';
    img.style.left = '50%';
    img.style.top  = '40px';
    img.src = chrome.extension.getURL('loading.gif');;
};

var setQuery = function(query){
    document.title = "FindAlt background process - Do not close !";
    showLoadingImg();

    query = query.trim();
    if (query === '') {
        return;
    }

    var qSent = query + ' vs ';

    var search = document.getElementsByClassName('gsfi')[0];
    search.value = qSent; 
    search.dispatchEvent(new Event('mousedown'));

    return qSent
}

var parseResults = function(qSent){
    var tries    = 0;
    var maxTries = 10;
    var delay    = 100;

    var timer = window.setInterval(function(){
        var resEl = document.getElementsByClassName('sbqs_c');
        if (resEl.length > 0) {
            window.clearInterval(timer);

            var res = [];
            for (var i=0; i<resEl.length; i++){
              res[i] = resEl[i].innerText.toLowerCase().replace(qSent.toLowerCase(),'');
            };
            var search = document.getElementsByClassName('gsfi')[0];
            search.value = '';
            search.dispatchEvent(new Event('mousedown'));
            chrome.runtime.sendMessage({"message":"_resultsParsed", 'results':res});
        }
        tries++;
        if (tries >= maxTries) {
            window.clearInterval(timer);            
            chrome.runtime.sendMessage({"message":"_resultsParsed", 'results':[]});            
        }
    }, delay);
};

var showResults = function(results) {
    removeResults();

    var html = '<div style="font-family:\'Roboto\', sans-serif;"><div style="background-color:#E91E63; text-align:center; color:#fff; padding:10px 2px;">Alternatives</div><table style="width:100%;">';
    
    if (results.length > 0) {
        for (var i=0; i<results.length; i++){
            html += '<tr class="hasdata"><td align="center" width="50%" style="font-size:0.9em; background-color:#fff; border-bottom:1px solid #eee;"><span style="display:inline-block; width:100%; padding:6px 0px;"><a target="_blank" style="color:#1A237E; text-decoration: none;" href="https://www.google.com/search?q='+results[i]+'">'+results[i]+'</a><span></td></tr>';
        }
    } else {
        html += '<tr><td align="center" width="50%" style="font-size:0.9em;"><span style="display:inline-block; width:100%; padding:6px 0px; color:#666;">No match found<span></td></tr>';        
    }
    
    html += '</table></div>';

    var cord = window.getSelection().getRangeAt(0).getBoundingClientRect();

    var frame = document.createElement('iframe');
    frame.id = "find-alternates-265358979";
    frame.onload="resizeiFrame(this);";
    frame.style.position = 'absolute';
    frame.style.top  = cord['bottom'] + window.scrollY + 'px';
    frame.style.left = cord['right'] + window.scrollX + 'px';
    frame.style.zIndex = '100000';
    frame.style.backgroundColor = 'rgba(255,255,255,.8)';
    frame.style.border = '1px solid rgba(128,128,128,0.3)';
    frame.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'    
    frame.style.webkitBoxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
    document.body.insertBefore(frame, document.body.firstChild);
    frame.contentDocument.body.innerHTML = html;

    var link  = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css?family=Roboto";
    link.rel  = "stylesheet"; 
    frame.contentDocument.head.appendChild(link);

    var link  = document.createElement("style");
    link.innerHTML = "body { margin:2px; margin-bottom:0px; background-color:rgba(255,255,255,0); } \
                      tr.hasdata:hover td { background-color: #2962FF !important;} \
                      tr.hasdata:hover td a { color: #fff !important;} \
                      ";
    frame.contentDocument.head.appendChild(link);

    frame.style.width  = frame.contentWindow.document.body.scrollWidth + 'px';
    frame.style.height = 2 + frame.contentWindow.document.body.scrollHeight + 'px';
}

})();
