var awaitForCondition = function(callback) {
    var int = setInterval(function() {
        if (Module.findExportByName(null, "mono_get_root_domain")) {
            clearInterval(int);
            callback();
            return;
        }
    }, 0);
}

function hook() {
    Interceptor.attach(Module.findExportByName(null, "mono_assembly_load_from_full"), {
        onEnter: function(args) {
            this._dll = Memory.readUtf8String(ptr(args[1]));
            console.log('[*]', this._dll);
        },
        onLeave: function(retval) {          
            if (this._dll.endsWith("Assembly-CSharp.dll")) {
                console.log(JSON.stringify({
                    retval: retval,
                    name: this._dll
                }, null, 2));
            }
        }
    });
}
Java.perform(awaitForCondition(hook));