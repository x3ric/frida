Interceptor.attach(ObjC.classes.NMSSHChannel['- execute:error:timeout:'].implementation, {  
    onEnter: function(args) {  
      this.cmd = ObjC.Object(args[2]).toString();
      this.timeout = args[4];
    }, 
    onLeave: function(retv) {  
      console.log(`CMD: ${ObjC.Object(args[2]).toString()} Timeout: ${args[4]} Ret: ${retv}`);
    }  
  }); 