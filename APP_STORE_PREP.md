# BaloWaci App Store Prep

## Current App Setup

- App name: BaloWaci
- App ID: `com.balowaci.app`
- Web source: current site files in the project root
- Native wrapper: Capacitor
- Support email: `balowaci.ottofnn@gmail.com`
- Website: `https://balowaci.com`

## Android Next Steps

1. Install Android Studio.
2. Make sure Java/JDK is installed and `JAVA_HOME` is set. Android Studio usually helps install this.
3. Run `npm install`.
4. Run `npm run cap:sync`.
5. Run `npm run cap:android`.
6. In Android Studio, generate a signed release build.
7. Upload the release to Google Play Console.

Current local build note:
The Android project has been generated and synced. A debug APK build succeeded after pointing `JAVA_HOME` to Android Studio's bundled JDK.

Debug APK path:
`android\app\build\outputs\apk\debug\app-debug.apk`

Local debug build command:
```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:Path="$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
cd android
.\gradlew.bat assembleDebug
```

## iOS Next Steps

1. Use a Mac with Xcode installed.
2. Run `npm install`.
3. Run `npx cap add ios`.
4. Run `npm run cap:sync`.
5. Run `npm run cap:ios`.
6. Archive the app in Xcode.
7. Upload through App Store Connect.

## Store Listing Draft

Short description:
BaloWaci is a live cultural time interpretation system built around an interactive watch, global time, sun, moon, and regional navigation.

Full description:
BaloWaci transforms time into an interactive experience. Explore a live watch interface that connects modern time, cultural time, regional time zones, a real-time globe, sun and moon behavior, and the founder's product journey into one unified system.

Keywords:
time, watch, globe, culture, timezone, moon, sun, design, education, BaloWaci

## Required Before Store Submission

- Privacy policy URL
- Final app screenshots
- App Store and Play Store developer accounts
- Signed production builds
- Store review approval
