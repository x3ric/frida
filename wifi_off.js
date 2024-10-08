var WifiManager = Java.use("android.net.wifi.WifiManager");
Java.use("android.app.Activity").onCreate.overload("android.os.Bundle").implementation = function(bundle) {
    var wManager = Java.cast(this.getSystemService("wifi"), WifiManager);
    console.log('isWifiEnabled ?', wManager.isWifiEnabled());
    wManager.setWifiEnabled(false);
    this.$init(bundle);
}