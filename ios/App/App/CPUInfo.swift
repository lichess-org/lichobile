import Capacitor

@objc(CPUInfo)
public class CPUInfo: CAPPlugin {
  @objc func nbCores(_ call: CAPPluginCall) {
    call.resolve([
      "value": ProcessInfo.processInfo.activeProcessorCount
    ])
  }
}
