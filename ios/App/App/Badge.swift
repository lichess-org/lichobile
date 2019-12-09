import UIKit
import Capacitor

@objc(Badge)
public class Badge: CAPPlugin {
    
    @objc func setNumber(_ call: CAPPluginCall) {
        guard let number = call.options["badge"] as? Int else {
            call.reject("Must provide a badge number")
            return
        }
        UNUserNotificationCenter.current().requestAuthorization(options: [.badge]) { (granted, error) in
            if (granted && error == nil) {
                DispatchQueue.main.async {
                    UIApplication.shared.applicationIconBadgeNumber = number
                    call.resolve()
                }
            } else {
                call.error(error?.localizedDescription ?? "Not authorized to set badge")
            }
        }
    }
}
