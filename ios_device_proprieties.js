var UIDevice = ObjC.classes.UIDevice.currentDevice();
UIDevice.$ownMethods
  .filter(function(method) { 
    return method.indexOf(':') == -1 /* filter out methods with parameters */
       && method.indexOf('+') == -1 /* filter out public methods */
  })
  .forEach(function(method) { 
    console.log(method, ':', UIDevice[method]())
  })
console.log('executablePath =', ObjC.classes.NSBundle.mainBundle().executablePath().toString());
if (ObjC.available) { 
	var processInfo = ObjC.classes.NSProcessInfo.processInfo();
	var versionString = processInfo.operatingSystemVersionString().toString();
	// E.g. "Version 13.5 (Build 17F75)"
	var ver = versionString.split(' ');
	var version = ver[1];
	// E.g. 13.5
	console.log("iOS version: " + version);  
}
