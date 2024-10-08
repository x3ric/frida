Java.perform(() => {
    const MyBroadcastReceiver = Java.registerClass({
        name: 'MyBroadcastReceiver',
        superClass: Java.use('android.content.BroadcastReceiver'),
        methods: {
            onReceive: [{
                returnType: 'void',
                argumentTypes: ['android.content.Context', 'android.content.Intent'],
                implementation: function(context, intent) {
                    // ..
                }
            }]
        },
    });
    let ctx = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();
    ctx.registerReceiver(MyBroadcastReceiver.$new(), Java.use('android.content.IntentFilter').$new('com.example.JAVA_TO_AGENT'));
});