import ExpoModulesCore
import Foundation
import FamilyControls
import DeviceActivity

final class SimulatorUnsupportedException: Exception {
  override var reason: String {
    "FamilyControls requires a real iPhone/iPad. Simulator cannot authorize Screen Time."
  }
}

final class AuthorizationFailedException: GenericException<String> {
  override var reason: String {
    "FamilyControls authorization failed: \(param)"
  }
}

final class NotAuthorizedException: Exception {
  override var reason: String {
    "Call requestPermission() before starting DeviceActivity monitoring."
  }
}

final class ScheduleException: Exception {
  override var reason: String {
    "Could not compute or start the DeviceActivity daily schedule."
  }
}

/**
 * Bridge for Apple FamilyControls authorization + DeviceActivity daily aggregates.
 *
 * Screen Time minutes / pickup proxies are written by the DeviceActivityMonitor
 * app extension into the shared App Group defaults. This module starts the
 * daily monitoring schedule and reads those aggregates back into JS.
 *
 * Simulator: FamilyControls authorization is unavailable — expect failures.
 * Real device + approved entitlement required.
 */
public class DeviceUsageModule: Module {
  static let appGroupId = "group.com.sampritchard.screentimescorer"
  static let activityName = DeviceActivityName("screentimescorer.daily")

  public func definition() -> ModuleDefinition {
    Name("DeviceUsage")

    AsyncFunction("requestPermission") { () -> [String: Any] in
      #if targetEnvironment(simulator)
      throw SimulatorUnsupportedException()
      #else
      do {
        try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
        let status = Self.statusString(AuthorizationCenter.shared.authorizationStatus)
        if status == "approved" {
          try Self.startDailyMonitoring()
        }
        return [
          "status": status,
          "platform": "ios",
        ]
      } catch let error as Exception {
        throw error
      } catch {
        throw AuthorizationFailedException(error.localizedDescription)
      }
      #endif
    }

    AsyncFunction("isAuthorized") { () -> Bool in
      #if targetEnvironment(simulator)
      return false
      #else
      return AuthorizationCenter.shared.authorizationStatus == .approved
      #endif
    }

    AsyncFunction("getAuthorizationStatus") { () -> String in
      #if targetEnvironment(simulator)
      return "notDetermined"
      #else
      return Self.statusString(AuthorizationCenter.shared.authorizationStatus)
      #endif
    }

    AsyncFunction("getTodayUsage") { () -> [String: Any] in
      let authorized: Bool
      #if targetEnvironment(simulator)
      authorized = false
      #else
      authorized = AuthorizationCenter.shared.authorizationStatus == .approved
      #endif

      let defaults = UserDefaults(suiteName: Self.appGroupId)
      let dateKey = Self.todayKey()

      let storedDate = defaults?.string(forKey: "usage.date")
      let minutes = defaults?.integer(forKey: "usage.screenTimeMinutes") ?? 0
      let pickupsValue = defaults?.object(forKey: "usage.pickups") as? Int

      let hasToday = storedDate == dateKey
      let screenTimeMinutes = hasToday ? minutes : 0
      let pickups: Any = hasToday ? (pickupsValue as Any? ?? NSNull()) : NSNull()

      if authorized {
        try? Self.startDailyMonitoring()
      }

      let hasSignal = hasToday && (screenTimeMinutes > 0 || pickupsValue != nil)
      return [
        "date": dateKey,
        "screenTimeMinutes": screenTimeMinutes,
        "pickups": pickups,
        "platform": "ios",
        "source": hasSignal ? "device" : "pending",
        "authorized": authorized,
        "appGroupId": Self.appGroupId,
      ]
    }

    AsyncFunction("startDailyMonitoring") { () -> Bool in
      #if targetEnvironment(simulator)
      throw SimulatorUnsupportedException()
      #else
      guard AuthorizationCenter.shared.authorizationStatus == .approved else {
        throw NotAuthorizedException()
      }
      try Self.startDailyMonitoring()
      return true
      #endif
    }
  }

  private static func statusString(_ status: AuthorizationStatus) -> String {
    switch status {
    case .approved:
      return "approved"
    case .denied:
      return "denied"
    case .notDetermined:
      return "notDetermined"
    @unknown default:
      return "unknown"
    }
  }

  private static func todayKey() -> String {
    let formatter = DateFormatter()
    formatter.calendar = Calendar.current
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = TimeZone.current
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: Date())
  }

  /// Schedule DeviceActivity monitoring for the local calendar day (00:00–23:59).
  private static func startDailyMonitoring() throws {
    var startComponents = DateComponents()
    startComponents.hour = 0
    startComponents.minute = 0
    startComponents.second = 0

    var endComponents = DateComponents()
    endComponents.hour = 23
    endComponents.minute = 59
    endComponents.second = 59

    let schedule = DeviceActivitySchedule(
      intervalStart: startComponents,
      intervalEnd: endComponents,
      repeats: true
    )

    let center = DeviceActivityCenter()
    center.stopMonitoring([activityName])
    do {
      try center.startMonitoring(activityName, during: schedule)
    } catch {
      throw ScheduleException()
    }
  }
}
