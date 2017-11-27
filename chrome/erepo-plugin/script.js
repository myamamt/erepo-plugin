console.log('Error Repository Plugin starts monitoring');

// URLのクエリ部分を隠すfunction
var hideQuery = function(str) {
    var index = str.indexOf('?');
    if (index == -1) {
        return str;
    } else {
        return str.substring(0, index) + '?[query]';
    }
}

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
        }
       
		// content scriptにイベント送信
        document.dispatchEvent(new CustomEvent('ReportError', {detail: error}));
    });
}

// pageでイベントを送信させるfunctionを即時実行
var script = document.createElement('script');
script.textContent = '(' + codeToInject + '())';
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

// pageからイベント受信
document.addEventListener('ReportError', function(e) {
    var data = {
        fileName: e.detail.filename,
		lineNumber: e.detail.lineno,
		columnNumber: e.detail.colno,
		message: e.detail.message,
		stackTrace: e.detail.stackTrace,
		userAgent: navigator.userAgent,
		date: new Date()
    }
    
    chrome.storage.sync.get(['query', 'cookie', 'verify'], function(setting) {
        if (setting['query']) {
            data.url = window.location.href;
        } else {
            data.url = hideQuery(window.location.href);
        }

        if (setting['cookie']) {
            data.cookie = document.cookie;
        } else if (document.cookie != '') {
            data.cookie = '[cookie]'
        } else {
            data.cookie = '';
        }

        console.log(JSON.stringify(data));
	    // 収集サーバにエラー情報を送信
	    var xhr = new XMLHttpRequest();
	    xhr.open('POST', 'http://localhost:8080/api/info/');
	    xhr.setRequestHeader("Content-Type", "application/json");
	    xhr.send(JSON.stringify(data));
    });
});
