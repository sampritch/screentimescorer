/**
 * App-facing device usage bridge.
 * iOS → FamilyControls / DeviceActivity local Expo module.
 * Android → stub ("not implemented") until UsageStats (PT-10).
 */
export {
  requestPermission,
  isAuthorized,
  getAuthorizationStatus,
  getTodayUsage,
  startDailyMonitoring,
} from '../../modules/device-usage/src';
export type {
  PermissionResult,
  TodayUsage,
  UsagePermissionStatus,
} from '../../modules/device-usage/src';
