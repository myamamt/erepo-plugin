console.log('Error Repository Plugin starts monitoring');

// URLのクエリ部分を隠すfunction
var hideQuery = function(str) {
    var index = str.indexOf('?');
    if (index === -1) {
        return str;
    } else {
        return str.substring(0, index) + '?[query]';
    }
};

// content scriptからスタックトレース(e.error.stack)を取得できないため
// pageで起きたイベントをCustomEventを利用して送信
var codeToInject = function() {
    window.addEventListener('error', function(e) {
        var error = {
            filename: e.filename,
		    lineno: e.lineno,
		    colno: e.colno,
		    message: e.message,
		    stackTrace: e.error.stack
        };
       
		// content scriptにイベント送信
        document.dispatchEvent(new CustomEvent('ReportError', {detail: error}));
    });
};

// pageでイベントを送信させるfunctionを即時実行
var script = document.createElement('script');
script.textContent = '(' + codeToInject + '())';
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

// pageからイベント受信
document.addEventListener('ReportError', function(e) {
    var info = {
        fileName: e.detail.filename,
		lineNumber: e.detail.lineno,
		columnNumber: e.detail.colno,
		message: e.detail.message,
		stackTrace: e.detail.stackTrace,
		userAgent: navigator.userAgent,
		date: new Date()
    };
    
    chrome.storage.sync.get(['query', 'cookie', 'verify'], function(setting) {
        if (setting['query']) {
            info.url = window.location.href;
        } else {
            info.url = hideQuery(window.location.href);
        }

        if (setting['cookie']) {
            info.cookie = document.cookie;
        } else if (document.cookie !== '') {
            info.cookie = '[cookie]'
        } else {
            info.cookie = '';
        }

        saveInfo(info);

        console.log(JSON.stringify(info));
	    // // 収集サーバにエラー情報を送信
	    // var xhr = new XMLHttpRequest();
	    // xhr.open('POST', 'https://tyr.ics.es.osaka-u.ac.jp/erepo/api/info/');
	    // xhr.setRequestHeader("Content-Type", "application/json");
	    // xhr.send(JSON.stringify(info));
    });
});

var saveInfo = function(info) {
    chrome.storage.local.get('list', function(data) {
        var list;
        if (data['list']) {
            list = data['list'];
        } else {
            list = [];
        }
        list.push(info);
        chrome.storage.local.set({list: list});
    });
};
