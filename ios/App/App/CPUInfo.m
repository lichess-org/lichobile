#import <Capacitor/Capacitor.h>

CAP_PLUGIN(CPUInfo, "CPUInfo",
  CAP_PLUGIN_METHOD(nbCores, CAPPluginReturnPromise);
)
