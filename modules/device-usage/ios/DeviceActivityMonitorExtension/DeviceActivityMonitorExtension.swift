import DeviceActivity
import Foundation
import ManagedSettings
import FamilyControls

/**
 * Scaffold: DeviceActivityMonitor app extension.
 *
 * Add this target in Xcode (or via an apple-targets config plugin) with:
 * - Bundle ID: com.sampritchard.screentimescorer.DeviceActivityMonitor
 * - Entitlement: com.apple.developer.family-controls = true
 * - App Group: group.com.sampritchard.screentimescorer
 *
 * The OS wakes this process at schedule boundaries. We persist rough daily
 * aggregates into the shared App Group for the main app's getTodayUsage().
 *
 * Notes:
 * - Apple does not expose Settings-level Screen Time graphs or a public
 *   "pickups" integer. This scaffold approximates "active intervals" and
 *   optional event-threshold firings as pickup proxies when configured.
 * - FamilyControls distribution entitlement must also cover this extension's App ID.
 */
final class ScreenTimeScorerMonitor: DeviceActivityMonitor {
  static let appGroupId = "group.com.sampritchard.screentimescorer"

  private var defaults: UserDefaults? {
    UserDefaults(suiteName: Self.appGroupId)
  }

  private func todayKey() -> String {
    let formatter = DateFormatter()
    formatter.calendar = Calendar.current
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = TimeZone.current
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: Date())
  }

  private func ensureTodayBucket() {
    let key = todayKey()
    if defaults?.string(forKey: "usage.date") != key {
      defaults?.set(key, forKey: "usage.date")
      defaults?.set(0, forKey: "usage.screenTimeMinutes")
      defaults?.set(0, forKey: "usage.pickups")
      defaults?.set(Date().timeIntervalSince1970, forKey: "usage.intervalStartedAt")
    }
  }

  override func intervalDidStart(for activity: DeviceActivityName) {
    super.intervalDidStart(for: activity)
    ensureTodayBucket()
    defaults?.set(Date().timeIntervalSince1970, forKey: "usage.intervalStartedAt")
  }

  override func intervalDidEnd(for activity: DeviceActivityName) {
    super.intervalDidEnd(for: activity)
    ensureTodayBucket()
    let startedAt = defaults?.double(forKey: "usage.intervalStartedAt") ?? 0
    if startedAt > 0 {
      let elapsedMinutes = max(0, Int((Date().timeIntervalSince1970 - startedAt) / 60.0))
      let existing = defaults?.integer(forKey: "usage.screenTimeMinutes") ?? 0
      defaults?.set(existing + elapsedMinutes, forKey: "usage.screenTimeMinutes")
    }
    defaults?.removeObject(forKey: "usage.intervalStartedAt")
  }

  override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
    super.eventDidReachThreshold(event, activity: activity)
    ensureTodayBucket()
    // Optional pickup proxy when threshold events are registered by the host app.
    let existing = defaults?.integer(forKey: "usage.pickups") ?? 0
    defaults?.set(existing + 1, forKey: "usage.pickups")
  }

  override func intervalWillStartWarning(for activity: DeviceActivityName) {
    super.intervalWillStartWarning(for: activity)
  }

  override func intervalWillEndWarning(for activity: DeviceActivityName) {
    super.intervalWillEndWarning(for: activity)
  }
}
