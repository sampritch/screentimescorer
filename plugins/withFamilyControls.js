/**
 * Expo config plugin for Apple FamilyControls + DeviceActivity scaffolding.
 *
 * - Writes Family Controls entitlement on the main app
 * - Adds App Group for DeviceActivityMonitor ↔ main app shared aggregates
 * - Leaves NSFamilyControlsUsageDescription via app.json infoPlist
 *
 * Extension target sources live in:
 *   modules/device-usage/ios/DeviceActivityMonitorExtension/
 * Add that target in Xcode after prebuild (see docs/FAMILYCONTROLS.md).
 */
const {
  withEntitlementsPlist,
  withInfoPlist,
  createRunOncePlugin,
} = require('expo/config-plugins');

const PACKAGE_NAME = 'withFamilyControls';
const PACKAGE_VERSION = '2.0.0';

const APP_GROUP = 'group.com.sampritchard.screentimescorer';
const USAGE_DESCRIPTION =
  'Screen Time Scorer uses Screen Time data to calculate your Phone Health Score and suggest healthier habits on this device.';

function ensureAppGroups(entitlements) {
  const existing = entitlements['com.apple.security.application-groups'];
  const list = Array.isArray(existing) ? [...existing] : [];
  if (!list.includes(APP_GROUP)) {
    list.push(APP_GROUP);
  }
  entitlements['com.apple.security.application-groups'] = list;
  return entitlements;
}

function withFamilyControlsEntitlements(config) {
  return withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.family-controls'] = true;
    ensureAppGroups(config.modResults);
    return config;
  });
}

function withFamilyControlsInfo(config) {
  return withInfoPlist(config, (config) => {
    if (!config.modResults.NSFamilyControlsUsageDescription) {
      config.modResults.NSFamilyControlsUsageDescription = USAGE_DESCRIPTION;
    }
    return config;
  });
}

function withFamilyControls(config) {
  config = withFamilyControlsEntitlements(config);
  config = withFamilyControlsInfo(config);
  return config;
}

module.exports = createRunOncePlugin(
  withFamilyControls,
  PACKAGE_NAME,
  PACKAGE_VERSION
);

module.exports.APP_GROUP = APP_GROUP;
