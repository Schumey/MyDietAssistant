# Builds the signed Android release APK and hands it to Home Assistant for the in-app update.
# Result: app\build\release\hafs-<version>.apk (version from app\pubspec.yaml).
#
# With -Deploy the file is copied to the Home Assistant share (default \\homeassistant\share\hafs\app, the Samba share
# of /share); the HA app serves the newest hafs-<version>.apk there (GET api/training/app) and the app offers it in
# Settings / at start. The copy is checked with SHA-256 before it gets its final name; a broken copy is deleted, because
# the server would otherwise offer it (the share breaks off on mobile networks: copy over Wi-Fi).
# The APK must be signed with the release key from the private folder HAFS-local\android
# (release.properties + release.keystore); without it the script stops, because a debug-signed APK could
# not update an installed release app.
#
# Bump `version:` in app\pubspec.yaml before a release (the number after the + is the Android version code and must grow).
param([switch]$Deploy, [string]$Share = '\\homeassistant\share\hafs\app')
$ErrorActionPreference = 'Stop'
$root = Resolve-Path "$PSScriptRoot\.."
$appDir = "$root\app"

$companion = @("$root\..\HAFS-local\android") | Where-Object { Test-Path "$_\release.properties" } | Select-Object -First 1
if (-not $companion) { throw 'release.properties not found (HAFS-local\android); the APK would not be signed with the release key' }

$line = Select-String -Path "$appDir\pubspec.yaml" -Pattern '^version:\s*([0-9.]+)' | Select-Object -First 1
$version = $line.Matches[0].Groups[1].Value
$out = "$appDir\build\release"
New-Item -ItemType Directory -Force $out | Out-Null
Get-ChildItem $out -File | Remove-Item

Push-Location $appDir
try {
    flutter build apk --release
    if ($LASTEXITCODE -ne 0) { throw 'flutter build apk failed' }
} finally {
    Pop-Location
}
Copy-Item "$appDir\build\app\outputs\flutter-apk\app-release.apk" "$out\hafs-$version.apk"

Get-ChildItem $out -File | ForEach-Object {
    '{0}  {1:N1} MB  sha256 {2}' -f $_.Name, ($_.Length / 1MB), (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLower()
}

if ($Deploy) {
    if (-not (Test-Path (Split-Path $Share))) { throw "Share $(Split-Path $Share) not reachable" }
    New-Item -ItemType Directory -Force $Share | Out-Null
    # copy under a temporary name first so the server never offers a half-written file
    $part = "$Share\hafs-$version.apk.part"
    try {
        Copy-Item "$out\hafs-$version.apk" $part -Force
        $want = (Get-FileHash "$out\hafs-$version.apk" -Algorithm SHA256).Hash
        $got = (Get-FileHash $part -Algorithm SHA256).Hash
        if ($want -ne $got) { throw "checksum of the copy differs ($got instead of $want)" }
        Move-Item $part "$Share\hafs-$version.apk" -Force
    } catch {
        Remove-Item $part -Force -ErrorAction SilentlyContinue
        throw "Deploy failed, nothing new is offered: $_"
    }
    "Deployed to $Share\hafs-$version.apk (sha256 $($want.ToLower()))"
}
