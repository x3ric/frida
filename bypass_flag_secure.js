Java.perform(function() {
    Java.use('android.view.SurfaceView').setSecure.overload('boolean').implementation = function(flag){
        console.log('[1] flag:', flag);
        this.call(false);
    };
    var LayoutParams = Java.use('android.view.WindowManager$LayoutParams');
    Java.use('android.view.ViewWindow').setFlags.overload('int', 'int').implementation = function(flags, mask){
        console.log('flag secure: ', LayoutParams.FLAG_SECURE.value);
        console.log('before:', flags);
        flags = (flags.value & ~LayoutParams.FLAG_SECURE.value);
        console.log('after:', flags);
        this.call(this, flags, mask);
    };
});