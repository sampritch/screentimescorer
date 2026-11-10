package expo.modules.deviceusage

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.exception.CodedException

/**
 * Android stub. UsageStatsManager lands in a later slice (PT-10).
 * JS callers should treat platform === "android" as not implemented.
 */
class DeviceUsageModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DeviceUsage")

    AsyncFunction("requestPermission") { promise: Promise ->
      promise.reject(
        CodedException(
          "NotImplemented",
          "Android UsageStats device linking is not implemented yet. Use iOS for FamilyControls.",
          null
        )
      )
    }

    AsyncFunction("isAuthorized") {
      false
    }

    AsyncFunction("getAuthorizationStatus") {
      "notImplemented"
    }

    AsyncFunction("getTodayUsage") { promise: Promise ->
      promise.reject(
        CodedException(
          "NotImplemented",
          "Android UsageStats getTodayUsage is not implemented yet.",
          null
        )
      )
    }

    AsyncFunction("startDailyMonitoring") { promise: Promise ->
      promise.reject(
        CodedException(
          "NotImplemented",
          "Android UsageStats monitoring is not implemented yet.",
          null
        )
      )
    }
  }
}
