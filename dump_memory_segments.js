Process.enumerateRanges('rw-', {
	onMatch: function (range) {
		var fname = `/sdcard/${range.base}_dump`;
		var f = new File(fname, 'wb');
		f.write(instance.base.readByteArray(instance.size));
		f.flush();
		f.close();
		console.log(`base=${range.base} size=${range.size} prot=${range.protection} fname=${fname}`);
	},
	onComplete: function () {}
});