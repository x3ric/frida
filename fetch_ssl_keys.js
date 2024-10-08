var keylog_callback = new NativeCallback((ssl, line) => {
    send(Memory.readCString(line));
  }, 'void', ['pointer', 'pointer']);
  
  if (ObjC.available) {
    var CALLBACK_OFFSET = 0x2A8
    if (Memory.readDouble(Module.findExportByName('CoreFoundation', 'kCFCoreFoundationVersionNumber')) >= 1751.108) {
      CALLBACK_OFFSET = 0x2B8
    }
    Interceptor.attach(Module.findExportByName('libboringssl.dylib', 'SSL_CTX_set_info_callback'), {
      onEnter(args) {
        ptr(args[0]).add(CALLBACK_OFFSET).writePointer(keylog_callback)
      }
    })
  } else if (Java.available) {
    var set_keylog_callback = new NativeFunction(Module.findExportByName('libssl.so', 'SSL_CTX_set_keylog_callback'), 'void', ['pointer', 'pointer']);
    Interceptor.attach(Module.findExportByName('libssl.so', 'SSL_CTX_new'), {
      onLeave(retval) {
        set_keylog_callback(retval, keylog_callback)
      }
    })
  }