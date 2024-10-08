var ActivityThread      = Java.use('android.app.ActivityThread');
var ConnectivityManager = Java.use('android.net.ConnectivityManager');
var ProxyInfo           = Java.use('android.net.ProxyInfo');

var proxyInfo           = ProxyInfo.$new('192.168.1.10', 8080, ''); // change to null in order to disable the proxy.
var context = ActivityThread.currentApplication().getApplicationContext();
var connectivityManager = Java.cast(context.getSystemService('connectivity'), ConnectivityManager);
connectivityManager.setGlobalProxy(proxyInfo);