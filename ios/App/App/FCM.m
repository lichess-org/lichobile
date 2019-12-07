#import <Capacitor/Capacitor.h>

CAP_PLUGIN(FCM, "FCM",
  CAP_PLUGIN_METHOD(getToken, CAPPluginReturnPromise);
)
