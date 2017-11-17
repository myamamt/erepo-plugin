console.log('Error Repository Plugin starts monitoring')

// pageで即時実行させるfunction
var codeToInject = function() {
    window.addEventListener('error', function(e) {
		var data = {
			url: window.location.href,
			filename: e.filename,
			lineno: e.lineno,
			colno: e.colno,
			message: e.message,
			stack_trace: e.error.stack,
			user_agent: navigator.userAgent,
			date: new Date()
		};

		// content scriptにイベント送信
        document.dispatchEvent(new CustomEvent('ReportError', {detail: data}));
    });
}

// pageでイベントを送信させるfunctionを即時実行
var script = document.createElement('script');
script.textContent = '(' + codeToInject + '())';
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

// pageからイベント受信
document.addEventListener('ReportError', function(e) {
	//収集サーバにエラー情報を送信
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://tyr.ics.es.osaka-u.ac.jp/error-collect');
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(JSON.stringify(e.detail));
});
