window.onload = function() {
    chrome.storage.sync.get('query', function(data) {
        if (data['query']) {
            document.getElementById('query').checked = true;
        }
    });
    chrome.storage.sync.get('cookie', function(data) {
        if (data['cookie']) {
            document.getElementById('cookie').checked = true;
        }
    });
    chrome.storage.sync.get('verify', function(data) {
        if (data['verify']) {
            document.getElementById('verify').checked = true;
        }
    });
    document.getElementById('save').onclick = save;
};

var save = function() {
    var data = {
        'query': document.getElementById('query').checked,
        'cookie': document.getElementById('cookie').checked,
        'verify': document.getElementById('verify').checked
    };
    chrome.storage.sync.set(data, function() {
        alert('設定を保存しました');
    });
};
