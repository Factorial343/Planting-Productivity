This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

---

# Project-specific rules: Planting Productivity (INFS 611, Group 2)

Android-only Expo (development build) app in TypeScript. A focus-session app
that grows a plant avatar as the user stays off their phone. Uses the
accelerometer (face-down and pickup detection), GPS (user-configurable campus
geofence), and local SQLite storage. No backend.

## Rules
- Do not add dependencies without asking. Prefer Expo packages that work in a
  development build. Avoid Reanimated, gesture handler, and navigation
  libraries for now.
- Detection logic lives in `src/detection/` as PURE functions (no React, no
  sensor or device APIs) so it can be tested with recorded data.
- Sensor access lives in `src/sensors/`; database code in `src/db/`; session
  state in `src/session/`; screens in `src/screens/`.
- Keep files small and typed. No `any`.
- Windows dev environment: keep paths short; do not run commands that
  regenerate the `android/` folder unless asked.
- After each change, list the files changed and how to test it on a phone.

## Defaults
- Face-down: accelerometer z < -8 (m/s^2). Pickup: |magnitude - 9.81| > 2.5
  sustained for 400 ms. Both thresholds are configurable constants.

  ## Overrides (these take precedence over the general Expo guidance above)
- Target Android only. Do not add iOS-specific code.
- Do NOT use Expo Router or any navigation library for now. Switch screens
  with simple React state. Screens live in `src/screens/`, not `src/app/`.
  UI wireframes are in docs/design/; match them when implementing screens.
- Do not use or configure EAS. Builds are local: `npx expo run:android --device`.
- Do not add Reanimated, gesture handler, or other native C++ libraries
  without asking. Use `npx expo install` for any approved package.
- If `npx expo lint` requires installing ESLint, ask first.