import Capacitor
import Firebase

@objc(FCM)
public class FCM: CAPPlugin {
  @objc func getToken(_ call: CAPPluginCall) {

    InstanceID.instanceID().instanceID { (result, error) in
        if (error != nil) {
            call.error("No FCM instanceID available")
        } else {
            guard let token = result?.token else {
                call.error("No FCM instanceID available")
                return
            }
            call.resolve([
                "value": token
            ])
        }
    }
  }
}
