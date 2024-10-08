function screenshot() {
ObjC.schedule(ObjC.mainQueue, function() {
    var getNativeFunction = function (ex, retVal, args) {
    return new NativeFunction(Module.findExportByName('UIKit', ex), retVal, args);
    };
    var api = {
    UIWindow: ObjC.classes.UIWindow,
    UIGraphicsBeginImageContextWithOptions: getNativeFunction('UIGraphicsBeginImageContextWithOptions', 'void', [['double', 'double'], 'bool', 'double']),
    UIGraphicsBeginImageContextWithOptions: getNativeFunction('UIGraphicsBeginImageContextWithOptions', 'void', [['double', 'double'], 'bool', 'double']),
    UIGraphicsEndImageContext: getNativeFunction('UIGraphicsEndImageContext', 'void', []),
    UIGraphicsGetImageFromCurrentImageContext: getNativeFunction('UIGraphicsGetImageFromCurrentImageContext', 'pointer', []),
    UIImagePNGRepresentation: getNativeFunction('UIImagePNGRepresentation', 'pointer', ['pointer'])
    };
    var view = api.UIWindow.keyWindow();
    var bounds = view.bounds();
    var size = bounds[1];
    api.UIGraphicsBeginImageContextWithOptions(size, 0, 0);
    view.drawViewHierarchyInRect_afterScreenUpdates_(bounds, true);

    var image = api.UIGraphicsGetImageFromCurrentImageContext();
    api.UIGraphicsEndImageContext();

    var png = new ObjC.Object(api.UIImagePNGRepresentation(image));
    send('screenshot', Memory.readByteArray(png.bytes(), png.length()));
});
}

rpc.exports = {
takescreenshot: screenshot
}