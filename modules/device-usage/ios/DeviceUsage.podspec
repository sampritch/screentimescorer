require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'DeviceUsage'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = 'Samuel Pritchard'
  s.homepage       = 'https://github.com/sampritch/screentimescorer'
  s.platforms      = { :ios => '16.0' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.frameworks = 'FamilyControls', 'DeviceActivity', 'ManagedSettings'

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
  # Extension sources ship in-repo for Xcode; do not compile into the main app target.
  s.exclude_files = 'DeviceActivityMonitorExtension/**/*'
end
