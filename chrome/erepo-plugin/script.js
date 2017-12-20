console.log('Error Repository Plugin starts monitoring');

// URLのクエリ部分を隠すfunction
var hideQuery = function(str) {
    return str.replace(/(https?:.*?\?).*/g, '$1[query]');
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
		date: new Date().toJSON()
    };
    
    chrome.storage.sync.get(['query', 'cookie'], function(setting) {
        if (setting['query']) {
            info.url = window.location.href;
        } else {
            info.url = hideQuery(window.location.href);
            info.fileName = hideQuery(info.fileName);
            if (info.stackTrace) {
                info.stackTrace = hideQuery(info.stackTrace);
            }
        }

        if (setting['cookie']) {
            info.cookie = document.cookie;
        } else if (document.cookie !== '') {
            info.cookie = '[cookie]'
        } else {
            info.cookie = '';
        }

        saveInfo(info);
    });
});

var saveInfo = function(info) {
    chrome.storage.local.get('list', function(data) {
        var localDateString = new Date().toLocaleDateString();
        if (!data.list) {
            data.list = {};
        }
        if (!data.list[localDateString]) {
            data.list[localDateString] = [];
        }

        // 同日の同エラーがあるかチェック
        var conflictFlg = false;
        data.list[localDateString].forEach(function (savedInfo) {
            if (savedInfo.url === info.url && savedInfo.message === info.message) {
                conflictFlg = true;
            }
        });

        // 重複していなければエラー情報を送信
        if (conflictFlg === false) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://tyr.ics.es.osaka-u.ac.jp/erepo/api/info');
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.response) {
                    var res = JSON.parse(xhr.response);
                    if (res.infoId) {
                        data.list[localDateString].push(info);
                        chrome.storage.local.set(data);
                    }
                }
            };
            xhr.send(JSON.stringify(info));
        }
    });
};
