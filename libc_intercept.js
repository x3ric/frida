Interceptor.attach(Module.findExportByName("/system/lib/libc.so", "open"), {
    onEnter: function(args) {
      this.flag = false;
      var filename = Memory.readCString(ptr(args[0]));
      console.log('filename =', filename)
      if (filename.endsWith(".xml")) {
        this.flag = true;
        var backtrace = Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n\t");
        console.log("file name [ " + Memory.readCString(ptr(args[0])) + " ]\nBacktrace:" + backtrace);
      }
    },
    onLeave: function(retval) {
      if (this.flag) // passed from onEnter
        console.warn("\nretval: " + retval);
    }
  });

var fds = {}; // for f in /proc/`pidof $APP`/fd/*; do echo $f': 'readlink $f; done
Interceptor.attach(Module.findExportByName(null, 'open'), {
    onEnter: function (args) {
    var fname = args[0].readCString();
    if (fname.endsWith('.jar')) {
        this.flag = true;
        this.fname = fname;
    }
    },
    onLeave: function (retval) {
    if (this.flag) {
        fds[retval] = this.fname;
    }
    }
});
['read', 'pread', 'readv'].forEach(fnc => {
    Interceptor.attach(Module.findExportByName(null, fnc), {
    onEnter: function (args) {
        var fd = args[0];
        if (fd in fds)
        console.log(`${fnc}: ${fds[fd]}
    \t${Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n\t')}`);
    }
    });
});