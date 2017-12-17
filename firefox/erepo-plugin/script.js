console.log('ErrorCollector starts monitoring')

window.addEventListener('error', function(e) {
	var data = {
		url: window.location.href,
		filename: e.filename,
		lineno: e.lineno,
		colno: e.colno,
		message: e.message,
		stack_trace: stackTrace,
		user_agent: navigator.userAgent,
		date: new Date()
	};

    //Firefoxはエラーの呼び出し関係が階層的でない時，stackプロパティを持たない
	if (e.error.stack) {
	    data.stack_trace = e.error.stack;
    }

	//収集サーバにエラー情報を送信
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://tyr.ics.es.osaka-u.ac.jp/error-collect');
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(JSON.stringify(data));
});
