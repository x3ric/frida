Process.setExceptionHandler(function(exp) {
    console.warn(JSON.stringify(Object.assign(exp, { _lr: DebugSymbol.fromAddress(exp.context.lr), _pc: DebugSymbol.fromAddress(exp.context.pc) }), null, 2));
    Memory.protect(exp.memory.address, Process.pointerSize, 'rw-');
    // can also use `new NativeFunction(Module.findExportByName(null, 'mprotect'), 'int', ['pointer', 'uint', 'int'])(parseInt(this.context.x2), 2, 0)`
    return true; // goto PC 
  });
  
  Interceptor.attach(funcPtr, {
    onEnter: function (args) {
      console.log('onEnter', JSON.stringify({
        x2: this.context.x2,
        mprotect_ret: Memory.protect(this.context.x2, 2, '---'),
        errno: this.errno
      }, null, 2));
    },
    onLeave: function (retval) {
      console.log('onLeave');
    }
  });