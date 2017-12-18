window.onload = function() {
    browser.storage.local.get('query', function(data) {
        if (data['query']) {
            document.getElementById('query').checked = true;
        }
    });
    browser.storage.local.get('cookie', function(data) {
        if (data['cookie']) {
            document.getElementById('cookie').checked = true;
        }
    });
    document.getElementById('save').onclick = save;
};

var save = function() {
    var data = {
        'query': document.getElementById('query').checked,
        'cookie': document.getElementById('cookie').checked
    };
    browser.storage.local.set(data, function() {
        alert('設定を保存しました');
    });
};
