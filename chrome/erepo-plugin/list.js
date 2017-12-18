var removeInfo = function (url, date, userAgent, dateString) {
    chrome.storage.local.get('list', function(data) {
        var listLength = data.list[dateString].length;
        for (var index = 0; index < listLength; index++) {
            var info = data.list[dateString][index];
            if (url === info.url && date === info.date && userAgent === info.userAgent) {
                data.list[dateString].splice(index, 1);
                break;
            }
        }
        if (data.list[dateString].length === 0) {
            data.list[dateString] = undefined;
        }
        chrome.storage.local.set(data);
    });
};

var del = function(url, date, userAgent, dateString) {
    var info = {
        url: url,
        date: date,
        userAgent: userAgent
    };

    var xhr = new XMLHttpRequest();
    // xhr.open('POST', 'http://localhost:8443/erepo/api/info/remove');
    xhr.open('POST', 'https://tyr.ics.es.osaka-u.ac.jp/erepo/api/info/');
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.response) {
            removeInfo(url, date, userAgent, dateString);
            location.reload();
        }
    };
    xhr.send(JSON.stringify(info));
};

var getListElements = function(data, dateString) {
    var h3 = document.createElement('h3');
    h3.innerText = dateString + 'に送信したエラー情報';

    var table = document.createElement('table');
    data.list[dateString].forEach(function (info) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.classList.add('w85p');
        var smallTable = document.createElement('table');
        smallTable.classList.add('small-table');

        var urlTr = document.createElement('tr');
        var urlKeyTd = document.createElement('td');
        urlKeyTd.innerText = 'URL';
        urlKeyTd.classList.add('w100');
        var urlValueTd = document.createElement('td');
        urlValueTd.innerText = info.url;
        urlTr.appendChild(urlKeyTd);
        urlTr.appendChild(urlValueTd);
        smallTable.appendChild(urlTr);

        var dateTr = document.createElement('tr');
        var dateKeyTd = document.createElement('td');
        dateKeyTd.innerText = '日時';
        dateKeyTd.classList.add('w100');
        var dateValueTd = document.createElement('td');
        dateValueTd.innerText = new Date(info.date).toLocaleString();
        dateTr.appendChild(dateKeyTd);
        dateTr.appendChild(dateValueTd);
        smallTable.appendChild(dateTr);

        var userAgentTr = document.createElement('tr');
        var userAgentKeyTd = document.createElement('td');
        userAgentKeyTd.innerText = 'ブラウザ環境';
        userAgentKeyTd.classList.add('w100');
        var userAgentValueTd = document.createElement('td');
        userAgentValueTd.innerText = info.userAgent;
        userAgentTr.appendChild(userAgentKeyTd);
        userAgentTr.appendChild(userAgentValueTd);
        smallTable.appendChild(userAgentTr);

        var messageTr = document.createElement('tr');
        var messageKeyTd = document.createElement('td');
        messageKeyTd.innerText = 'エラーメッセージ';
        messageKeyTd.classList.add('w100');
        var messageValueTd = document.createElement('td');
        messageValueTd.innerText = info.message;
        messageTr.appendChild(messageKeyTd);
        messageTr.appendChild(messageValueTd);
        smallTable.appendChild(messageTr);

        if (info.stackTrace) {
            var stackTraceTr = document.createElement('tr');
            var stackTraceKeyTd = document.createElement('td');
            stackTraceKeyTd.innerText = 'スタックトレース';
            stackTraceKeyTd.classList.add('w100');
            var stackTraceValueTd = document.createElement('td');
            stackTraceValueTd.innerText = info.stackTrace;
            stackTraceTr.appendChild(stackTraceKeyTd);
            stackTraceTr.appendChild(stackTraceValueTd);
            smallTable.appendChild(stackTraceTr);
        }

        var fileNameTr = document.createElement('tr');
        var fileNameKeyTd = document.createElement('td');
        fileNameKeyTd.innerText = 'ファイル名';
        fileNameKeyTd.classList.add('w100');
        var fileNameValueTd = document.createElement('td');
        fileNameValueTd.innerText = info.fileName;
        fileNameTr.appendChild(fileNameKeyTd);
        fileNameTr.appendChild(fileNameValueTd);
        smallTable.appendChild(fileNameTr);

        var numberTr = document.createElement('tr');
        var numberKeyTd = document.createElement('td');
        numberKeyTd.innerText = '行番号，列番号';
        numberKeyTd.classList.add('w100');
        var numberValueTd = document.createElement('td');
        numberValueTd.innerText = info.lineNumber + ', ' + info.columnNumber;
        numberTr.appendChild(numberKeyTd);
        numberTr.appendChild(numberValueTd);
        smallTable.appendChild(numberTr);

        if (info.cookie) {
            var cookieTr = document.createElement('tr');
            var cookieKeyTd = document.createElement('td');
            cookieKeyTd.innerText = 'Cookie';
            cookieKeyTd.classList.add('w100');
            var cookieValueTd = document.createElement('td');
            cookieValueTd.innerText = info.cookie;
            cookieTr.appendChild(cookieKeyTd);
            cookieTr.appendChild(cookieValueTd);
            smallTable.appendChild(cookieTr);
        }

        td.appendChild(smallTable);
        var buttonTd = document.createElement('td');
        buttonTd.classList.add('w15', 'buttonTd');
        var button = document.createElement('button');
        button.innerText = '削除申請';
        button.addEventListener('click', function () {
            del(info.url, info.date, info.userAgent, dateString);
        });
        buttonTd.appendChild(button);
        tr.appendChild(td);
        tr.appendChild(buttonTd);
        table.appendChild(tr);
    });
    return {h3: h3, table: table};
};

window.onload = function() {
    chrome.storage.local.get('list', function(data) {
        if (data.list) {
            var contents = document.getElementById('contents');
            for (var date in data.list) {
                if (data.list.hasOwnProperty(date)) {
                    var hr = document.createElement('hr');
                    contents.appendChild(hr);
                    var elements = getListElements(data, date);
                    contents.appendChild(elements.h3);
                    contents.appendChild(elements.table);
                }
            }
        }
    });

    document.getElementById('clear').addEventListener('click', function (e) {
        chrome.storage.local.clear();
        location.reload();
    });
};