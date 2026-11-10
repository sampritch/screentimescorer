/**
 * Expo config plugin placeholder for Apple FamilyControls.
 *
 * Status: FamilyControls distribution entitlement APPROVED for this App ID.
 * This plugin documents the entitlement and ensures prebuild writes the
 * expected iOS entitlement key. Wire a real DeviceActivity / FamilyControls
 * native module in a later slice once the usage bridge lands.
 *
 * Related files:
 * - ios-placeholders/ScreenTimeScorer.entitlements
 * - docs/FAMILYCONTROLS.md
 */
const {
  withEntitlementsPlist,
  createRunOncePlugin,
} = require('expo/config-plugins');

const PACKAGE_NAME = 'withFamilyControls';
const PACKAGE_VERSION = '1.0.0';

function withFamilyControls(config) {
  return withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.family-controls'] = true;
    return config;
  });
}

module.exports = createRunOncePlugin(
  withFamilyControls,
  PACKAGE_NAME,
  PACKAGE_VERSION
);
