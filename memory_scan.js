function memscan(str) {
	Process.enumerateModulesSync().filter(m => m.path.startsWith('/data')).forEach(m => {
		var pattern = str.split('').map(letter => letter.charCodeAt(0).toString(16)).join(' ');
		try {
			var res = Memory.scanSync(m.base, m.size, pattern);
			if (res.length > 0)
				console.log(JSON.stringify({m, res}));
		} catch (e) {
			console.warn(e);
		}
	});
}
var memscn = function (str) {
	Process.enumerateModulesSync().forEach(function (m) {
		var pattern = str.split('').map(function (l) { return l.charCodeAt(0).toString(16) }).join(' ');
		try {
			var res = Memory.scanSync(m.base, m.size, pattern);
			if (res.length > 0)
				console.log(JSON.stringify({m, res}, null , 2));
		} catch (e) {
			console.warn(e);
		}
	});
}