console.log('Error Repository Plugin starts monitoring');

// URLのクエリ部分を隠すfunction
var hideQuery = function(str) {
    return str.replace(/(https?:.*?\?).*/g, '$1[query]');
};

window.addEventListener('error', function(e) {
    var info = {
        fileName: e.filename,
        lineNumber: e.lineno,
        columnNumber: e.colno,
        message: e.message,
        userAgent: navigator.userAgent,
        date: new Date().toJSON()
    };

    //Firefoxはエラーの呼び出し関係が階層的でない時，stackプロパティを持たない
    if (e.error.stack) {
        info.stack_trace = e.error.stack;
    }

    browser.storage.local.get(['query', 'cookie'], function(setting) {
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
    browser.storage.local.get('list', function(data) {
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
                        browser.storage.local.set(data);
                    }
                }
            };
            xhr.send(JSON.stringify(info));
        }
    });
};
