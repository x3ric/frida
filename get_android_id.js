function getContext() {
    return Java.use('android.app.ActivityThread').currentApplication().getApplicationContext().getContentResolver();
  }
  
  function logAndroidId() {
    console.log('[-]', Java.use('android.provider.Settings$Secure').getString(getContext(), 'android_id'));
  }