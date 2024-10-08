// Android Root bypass
Java.perform(function () {
    var RootPackages = ["com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
        "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager",
        "com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
        "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
        "de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot",
        "com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser",
        "eu.chainfire.supersu.pro", "com.kingouser.com", "com.topjohnwu.magisk"
    ];
    var RootBinaries = ["su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk", "magisk"];
    var RootProperties = {
        "ro.build.selinux": "1",
        "ro.debuggable": "0",
        "service.adb.root": "0",
        "ro.secure": "1"
    };
    var RootPropertiesKeys = [];
    for (var k in RootProperties) RootPropertiesKeys.push(k);
    var PackageManager = Java.use("android.app.ApplicationPackageManager");
    var Runtime = Java.use('java.lang.Runtime');
    var NativeFile = Java.use('java.io.File');
    var String = Java.use('java.lang.String');
    var SystemProperties = Java.use('android.os.SystemProperties');
    var BufferedReader = Java.use('java.io.BufferedReader');
    var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
    var StringBuffer = Java.use('java.lang.StringBuffer');
    var loaded_classes = Java.enumerateLoadedClassesSync();
    send("Loaded " + loaded_classes.length + " classes!");
    var useKeyInfo = false;
    var useProcessManager = false;
    send("loaded: " + loaded_classes.indexOf('java.lang.ProcessManager'));
    if (loaded_classes.indexOf('java.lang.ProcessManager') != -1) {
        try {
            //useProcessManager = true;
            //var ProcessManager = Java.use('java.lang.ProcessManager');
        } catch (err) {
            send("ProcessManager Hook failed: " + err);
        }
    } else {
        send("ProcessManager hook not loaded");
    }
    var KeyInfo = null;
    if (loaded_classes.indexOf('android.security.keystore.KeyInfo') != -1) {
        try {
            //useKeyInfo = true;
            //var KeyInfo = Java.use('android.security.keystore.KeyInfo');
        } catch (err) {
            send("KeyInfo Hook failed: " + err);
        }
    } else {
        send("KeyInfo hook not loaded");
    }
    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function (pname, flags) {
        var shouldFakePackage = (RootPackages.indexOf(pname) > -1);
        if (shouldFakePackage) {
            send("Bypass root check for package: " + pname);
            pname = "set.package.name.to.a.fake.one.so.we.can.bypass.it";
        }
        return this.getPackageInfo.overload('java.lang.String', 'int').call(this, pname, flags);
    };
    NativeFile.exists.implementation = function () {
        var name = NativeFile.getName.call(this);
        var shouldFakeReturn = (RootBinaries.indexOf(name) > -1);
        if (shouldFakeReturn) {
            send("Bypass return value for binary: " + name);
            return false;
        } else {
            return this.exists.call(this);
        }
    };
    var exec = Runtime.exec.overload('[Ljava.lang.String;');
    var exec1 = Runtime.exec.overload('java.lang.String');
    var exec2 = Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;');
    var exec3 = Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;');
    var exec4 = Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File');
    var exec5 = Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;', 'java.io.File');
    exec5.implementation = function (cmd, env, dir) {
        if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
            var fakeCmd = "grep";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        if (cmd == "su") {
            var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        return exec5.call(this, cmd, env, dir);
    };
    exec4.implementation = function (cmdarr, env, file) {
        for (var i = 0; i < cmdarr.length; i = i + 1) {
            var tmp_cmd = cmdarr[i];
            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                var fakeCmd = "grep";
                send("Bypass " + cmdarr + " command");
                return exec1.call(this, fakeCmd);
            }
            if (tmp_cmd == "su") {
                var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                send("Bypass " + cmdarr + " command");
                return exec1.call(this, fakeCmd);
            }
        }
        return exec4.call(this, cmdarr, env, file);
    };
    exec3.implementation = function (cmdarr, envp) {
        for (var i = 0; i < cmdarr.length; i = i + 1) {
            var tmp_cmd = cmdarr[i];
            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                var fakeCmd = "grep";
                send("Bypass " + cmdarr + " command");
                return exec1.call(this, fakeCmd);
            }
            if (tmp_cmd == "su") {
                var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                send("Bypass " + cmdarr + " command");
                return exec1.call(this, fakeCmd);
            }
        }
        return exec3.call(this, cmdarr, envp);
    };
    exec2.implementation = function (cmd, env) {
        if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
            var fakeCmd = "grep";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        if (cmd == "su") {
            var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        return exec2.call(this, cmd, env);
    };
    exec.implementation = function (cmd) {
        for (var i = 0; i < cmd.length; i = i + 1) {
            var tmp_cmd = cmd[i];
            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                var fakeCmd = "grep";
                send("Bypass " + cmd + " command");
                return exec1.call(this, fakeCmd);
            }
            if (tmp_cmd == "su") {
                var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                send("Bypass " + cmd + " command");
                return exec1.call(this, fakeCmd);
            }
        }
        return exec.call(this, cmd);
    };
    exec1.implementation = function (cmd) {
        if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
            var fakeCmd = "grep";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        if (cmd == "su") {
            var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        return exec1.call(this, cmd);
    };
    SystemProperties.get.overload('java.lang.String').implementation = function (name) {
        if (RootPropertiesKeys.indexOf(name) != -1) {
            send("Bypass " + name + " property");
            return RootProperties[name];
        }
        return this.get.call(this, name);
    };
    SystemProperties.get.overload('java.lang.String', 'java.lang.String').implementation = function (name, def) {
        if (RootPropertiesKeys.indexOf(name) != -1) {
            send("Bypass " + name + " property");
            return RootProperties[name];
        }
        return this.get.call(this, name, def);
    };
    BufferedReader.readLine.overload().implementation = function () {
        var text = this.readLine.call(this);
        if (text === null) {
            return text;
        }
        var shouldFakeReturn = (text.indexOf("ro.build.selinux") > -1 || text.indexOf("ro.debuggable") > -1 ||
            text.indexOf("ro.secure") > -1 || text.indexOf("ro.build.type") > -1);
        if (shouldFakeReturn) {
            send("Bypass build.prop file: " + text);
            return null;
        }
        return text;
    };
    ProcessBuilder.start.overload().implementation = function () {
        var cmd = arguments[0];
        for (var i = 0; i < cmd.length; i = i + 1) {
            var tmp_cmd = cmd[i];
            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id") {
                var fakeCmd = "grep";
                send("Bypass " + cmd + " command");
                arguments[0][0] = fakeCmd;
                break;
            }
            if (tmp_cmd == "su") {
                var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                send("Bypass " + cmd + " command");
                arguments[0][0] = fakeCmd;
                break;
            }
        }
        return this.start.apply(this, arguments);
    };
    send("Root bypass script successfully loaded");
});
// Android Debug mode bypass
setTimeout(function() {
    Java.perform(function() {
        console.log("");
        console.log("[.] Starting Debug and Developer Mode checks bypass");
        // Bypass Debugger check
        var Debug = Java.use('android.os.Debug');
        Debug.isDebuggerConnected.implementation = function() {
            console.log("[+] Debug.isDebuggerConnected() Bypassed");
            return false;
        };
        // Bypass Developer Mode check
        var settingSecure = Java.use('android.provider.Settings$Secure');
        var settingGlobal = Java.use('android.provider.Settings$Global');
        function bypassSettingsGetInt(settingsClass, method) {
            settingsClass.getInt.overload('android.content.ContentResolver', 'java.lang.String', 'int').implementation = function(cr, name, flag) {
                console.log("[!] " + method + ".getInt(cr, name, flag): " + name + " Bypassed");
                return 0;
            };
            settingsClass.getInt.overload('android.content.ContentResolver', 'java.lang.String').implementation = function(cr, name) {
                console.log("[!] " + method + ".getInt(cr, name): " + name + " Bypassed");
                return 0;
            };
        }
        bypassSettingsGetInt(settingSecure, "Secure");
        bypassSettingsGetInt(settingGlobal, "Global");
        console.log("[.] Bypass completed");
    });
}, 0);
// Android piracy checker bypass
Java.perform(function() {
    var PackageManager = Java.use("android.app.ApplicationPackageManager");
    var loaded_classes = Java.enumerateLoadedClassesSync();
    send("Loaded " + loaded_classes.length + " classes!");
    PackageManager.getInstallerPackageName.implementation = function(pname) {
        var original = this.getInstallerPackageName.call(this, pname);
        send("Bypass INSTALLER check for package: " + original + " " + pname);
        return 'com.android.vending';
    };
});
