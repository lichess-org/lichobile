import Capacitor

@objc(CPUInfo)
public class CPUInfo: CAPPlugin {
  @objc func nbCores(_ call: CAPPluginCall) {
    call.success([
      "value": ProcessInfo.processInfo.activeProcessorCount
    ])
  }
}
