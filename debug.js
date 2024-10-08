// Utility Functions
function logJavaLog(level, a, b, c) {
    console.log(`Log.${level}(${a}, ${b}, ${c})`);
    return this[level](a, b, c);
}
function formatHex(array) {
    return array.map(byte => byte.toString(16).padStart(2, '0')).join('');
}
function formatBase64(array) {
    Java.perform(() => {
        const byteBuffer = Java.array('byte', array);
        const base64Data = Java.use('java.util.Base64').getEncoder().encodeToString(byteBuffer);
        console.log(`Base64: ${base64Data}`);
    });
}
function printMemory(address, index, color) {
    if (CONFIG.DEBUG) print(JSON.stringify({...Process.findRangeByAddress(address), address}, null, 2));
    try {
        const stringData = Memory.readCString(address);
        if (stringData) {
            console.log(`  --> [${index}] String: ${stringData}`);
            const byteArray = new Uint8Array(Memory.readByteArray(address, stringData.length));
            const intValue = byteArray.reduce((sum, byte) => sum * 10 + (byte >= 48 && byte <= 57 ? byte - 48 : NaN), 0);
            if (!isNaN(intValue)) console.log(`  --> [${index}] Integer: ${intValue}`);
            const hexData = Array.from(byteArray, byte => byte.toString(16).padStart(2, "0")).join("");
            if (hexData.length === 10) console.log(`  --> [${index}] Pointer: 0x${hexData}`);
            if (Java.available) {
                formatBase64(byteArray);
                console.log(`  --> [${index}] Hex: ${hexData}`);
            } else {
                console.log(`  --> [${index}] Hex: ${hexData}`);
            }
        } else {
            console.log(`  --> [${index}] Integer: ${parseInt(address, 16)}`);
        }
    } catch (e) {
        console.log(`Error reading memory: ${e.message}`, "red");
    }
}
function print(data, color) {
    const COLORS = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
    };
    console.log(color && CONFIG.COLOR ? `${COLORS[color]}${data}${COLORS.reset}` : data);
}
function attachFunction(module) {
    const color = Color();
    const address = module.address;
    const params = {};
    Interceptor.attach(address, {
        onEnter: function(args) {
            print(`[+] onEnter: ${module.name}`, color);
            params[address] = [];
            for (let i = 0; i < args.length; i++) {
                printMemory(args[i], i, color);
                params[address].push(args[i]);
            }
        },
        onLeave: function(retval) {
            print(`[-] onLeave: ${module.name}`, color);
            if (CONFIG.RECURSIVE) params[address].forEach((arg, i) => printMemory(arg, i, color));
            printMemory(retval, CONFIG.RECURSIVE ? params[address].length : 0, color);
            delete params[address];
        }
    });
}
function attachVariable(module) {
    const color = Color();
    print(`[+] VarEnter: ${module.name}`, color);
    printMemory(module.address, 0, color);
    print(`[-] VarLeave: ${module.name}`, color);
}
function searchLibraries() {
    return Process.enumerateModules().filter(l => 
        (!CONFIG.PACKAGE || l.path.toLowerCase().includes(CONFIG.PACKAGE.toLowerCase())) &&
        CONFIG.EXTENSIONS.some(e => e instanceof RegExp ? l.path.match(e) : l.path.toLowerCase().endsWith(e.toLowerCase())) &&
        LIBRARIES.some(L => L instanceof Object ? l.name.toLowerCase().includes(L.name.toLowerCase()) : l.name.toLowerCase().includes(L.toLowerCase()))
    );
}
function filterModules(modules, filters) {
    return modules.filter(m => 
        filters.some(f => f instanceof RegExp ? m.name.match(f) : m.name.toLowerCase().includes(f.toLowerCase()))
    );
}
function searchModules(library) {
    let modules = library.enumerateExports();
    LIBRARIES.forEach(L => {
        if (L instanceof Object && library.name.toLowerCase().includes(L.name.toLowerCase())) {
            L.modules.forEach(m => {
                if (!modules.some(obj => JSON.stringify(obj) === JSON.stringify(m))) modules.push(m);
            });
        }
    });
    modules = modules.map(m => ({...m, address: ptr(m.address)}));
    if (CONFIG.INCLUDES.length) modules = filterModules(modules, CONFIG.INCLUDES);
    if (CONFIG.EXCLUDES.length) {
        const excludes = filterModules(modules, CONFIG.EXCLUDES);
        modules = modules.filter(m => !excludes.some(e => e.name === m.name));
    }
    return modules;
}
// Enhanced Logs
Java.perform(function() {
    // Android Log Override
    const Log = Java.use("android.util.Log");
    ['d', 'v', 'i', 'e', 'w'].forEach(level => {
        Log[level].overload('java.lang.String', 'java.lang.String', 'java.lang.Throwable').implementation = function(a, b, c) {
            logJavaLog.call(this, level, a, b, c);
        };
        Log[level].overload('java.lang.String', 'java.lang.String').implementation = function(a, b) {
            console.log(`Log.${level}(${a}, ${b})`);
            return this[level](a, b);
        };
    });
    // AES Cryptography Logs
    const bin2ascii = array => array.map(byte => String.fromCharCode(byte)).join('');
    const bin2hex = (array, length = array.length) => array.slice(0, length).map(byte => byte.toString(16).padStart(2, '0')).join('');
    Java.use('javax.crypto.spec.SecretKeySpec').$init.overload('[B', 'java.lang.String').implementation = function(key, spec) {
        console.log(`KEY: ${bin2hex(key)} | ${bin2ascii(key)}`);
        return this.$init(key, spec);
    };
    Java.use('javax.crypto.Cipher').getInstance.overload('java.lang.String').implementation = function(spec) {
        console.log(`CIPHER: ${spec}`);
        return this.getInstance(spec);
    };
    Java.use('javax.crypto.Cipher').doFinal.overload('[B').implementation = function(data) {
        console.log("Cipher Operation:");
        console.log(bin2ascii(data));
        return this.doFinal(data);
    };
    // Process native libraries and functions
    const LIBRARIES = [
        "libnative.so",
        "libcrypto.so",
        {
            "name": "Software.exe",
            "modules": [
                {"type": "function", "name": "sub_14000BC30", "address": "0x14000BC30"},
                {"type": "function", "name": "sub_14000BCA0", "address": "0x14000BCA0"},
                {"type": "function", "name": "sub_14000DF50", "address": "0x14000DF50"}
            ]
        }
    ];
    const CONFIG = {
        PACKAGE: "PACKAGE",
        INCLUDES: ["selectedFunction", /^md5$/, "anotherNativeFunction"],
        EXCLUDES: [/create.*token$/],
        EXTENSIONS: [".so", ".dll", /\.exe$/],
        COLOR: true,
        TIMEOUT: 0,
        VARIABLE: true,
        FUNCTION: true,
        RECURSIVE: false,
        DEBUG: false
    };
    const COLORS = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
    };
    let current = 0;
    function Color() {
        const keys = Object.keys(COLORS).filter(key => key !== "reset" && key !== "red");
        return keys[(current++) % keys.length];
    }
    function searchLibraries() {
        return Process.enumerateModules().filter(l => 
            (!CONFIG.PACKAGE || l.path.toLowerCase().includes(CONFIG.PACKAGE.toLowerCase())) &&
            CONFIG.EXTENSIONS.some(e => e instanceof RegExp ? l.path.match(e) : l.path.toLowerCase().endsWith(e.toLowerCase())) &&
            LIBRARIES.some(L => L instanceof Object ? l.name.toLowerCase().includes(L.name.toLowerCase()) : l.name.toLowerCase().includes(L.toLowerCase()))
        );
    }
    function searchModules(library) {
        let modules = library.enumerateExports();
        LIBRARIES.forEach(L => {
            if (L instanceof Object && library.name.toLowerCase().includes(L.name.toLowerCase())) {
                L.modules.forEach(m => {
                    if (!modules.some(obj => JSON.stringify(obj) === JSON.stringify(m))) modules.push(m);
                });
            }
        });
        modules = modules.map(m => ({...m, address: ptr(m.address)}));
        if (CONFIG.INCLUDES.length) modules = filterModules(modules, CONFIG.INCLUDES);
        if (CONFIG.EXCLUDES.length) {
            const excludes = filterModules(modules, CONFIG.EXCLUDES);
            modules = modules.filter(m => !excludes.some(e => e.name === m.name));
        }
        return modules;
    }
    function filterModules(modules, filters) {
        return modules.filter(m => 
            filters.some(f => f instanceof RegExp ? m.name.match(f) : m.name.toLowerCase().includes(f.toLowerCase()))
        );
    }
    // Start capturing native process
    setTimeout(() => {
        print("Capturing Native process...\n---");
        const libraries = searchLibraries();
        if (libraries.length) {
            print(`[*] Native libraries found (${libraries.length})`);
            let variableCount = 0, functionCount = 0;
            libraries.forEach(library => {
                if (CONFIG.DEBUG) print(JSON.stringify(library, null, 2));
                const modules = searchModules(library);
                if (modules.length) {
                    print(`[*] Modules found in ${library.path} (${modules.length})`);
                    modules.forEach(module => {
                        if (module.type === "variable" && CONFIG.VARIABLE) attachVariable(module), variableCount++;
                        else if (module.type === "function" && CONFIG.FUNCTION) attachFunction(module), functionCount++;
                    });
                }
            });
            print(`\n---\nNative process successfully captured:\n  - Variables (${variableCount})\n  - Functions (${functionCount})`);
        } else {
            print("[*] No native libraries found");
        }
    }, CONFIG.TIMEOUT);
});
