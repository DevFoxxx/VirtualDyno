
<div align="center">
<img src="assets/images/icon.png" alt="icon.png" width="80" style="vertical-align: middle; border-radius: 9999px">
<h1 style="display: inline-block; margin-left: 10px; vertical-align: middle;">VirtualDyno</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-000000?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/License-Source--Available-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Active%20Development-green?style=for-the-badge" />

<p align="center">
  <a href="/documentation/README_ES.md" style="padding: 10px; background-color: #F54927; border-radius: 10px; color: white">🇪🇸 Spanish</a>
  |
  <a href="/documentation/README_IT.md" style="padding: 10px; background-color: #5EA529; border-radius: 10px; color: white">🇮🇹 Italian</a>
</div>

> A physics-based vehicle performance simulator for mobile. No dyno required.

---
<center><h1>What is VirtualDyno?</h1></center>

**VirtualDyno** is an open-source mobile app that simulates vehicle performance from a set of physical parameters — power, weight, aerodynamics, engine type, aspiration mode, drivetrain type, terrain, and weather. It gives you 0–100 km/h and 0–200 km/h times, theoretical top speed, a torque curve, and a power distribution analysis across speed bands — all without needing access to a physical dynamometer.

The physics model is empirically calibrated against data from multiple reliable sources across a wide range of vehicles, from everyday hatchbacks to high-performance supercars. The formulas are documented in the source code and designed to stay interpretable without sacrificing accuracy.

## Screenshots

| Light            | Dark             |
|------------------|------------------|
| ![](/documentation/images/image.png)  | ![](/documentation/images/image-1.png) |
| ![](/documentation/images/image-2.png) | ![](/documentation/images/image-3.png) |
| ![](/documentation/images/image-4.png) | ![](/documentation/images/image-5.png) |
| ![](/documentation/images/image-6.png) | ![](/documentation/images/image-7.png) |
| ![](/documentation/images/image-8.png) | ![](/documentation/images/image-9.png) |

---

## Features

- **0–100 km/h (0–62 mph)** time with animated speed-time chart
- **0–200 km/h (0–124 mph)** time with monotonic curve interpolation — no dip artifacts
- **Theoretical top speed** via binary search with calibrated drivetrain loss factor
- **Torque curve** across the full RPM range, with engine-type-specific models
- **Power distribution chart** — surplus vs. required power across speed bands
- **Engine types** — Petrol, Diesel, Electric with dedicated physics defaults and torque curves
- **Aspiration modes** — Natural, Turbo (with lag model), Supercharger, Biturbo
- **Terrain & weather simulation** — asphalt, wet, snow, mud, sand; temperature, headwind, rain — collapsible panel with image-based terrain selector and active-state badge
- **Traction type** — FWD, RWD, AWD with calibrated grip penalties
- **Advanced parameters accordion** — efficiency, air density, Cd, Cr, frontal area
- **Metric / Imperial toggle** — full conversion across all inputs, outputs, and chart axes
- **English / Italian** language switch
- **Light / Dark theme**
- **Haptic feedback** — selection, impact, and error vibrations across all interactive elements
- **Garage** — save, browse, edit, and delete vehicle sets with full chart replay
- **Share & Import** — three sharing modes (Social, Code, JSON) and two import methods (code paste, file picker)

## Physics model

| Output | Method |
|--------|--------|
| 0–100 time | Empirical: `t = v/a` at v = 100 km/h, net force from `P·η/v − F_aero − F_roll` |
| 0–200 time | Calibrated scaler: `t200 = t100 × clamp(1.9516 + 0.2082/(cv/kg), 2.1, 3.8)` |
| 0–200 graph | Monotonic sqrt interpolation anchored on exact t100 / t200 values |
| Top speed | Binary search on `F_engine − F_drag − F_rolling = 0` |
| Torque (ICE) | Exponential rise + Gaussian decay, peak RPM scaled by power class |
| Torque (EV) | 3-phase: flat peak → linear drop → field weakening |
| Diesel penalty | ×1.06 on 0–100, ×1.09 on 0–200 |
| Turbo lag | Boost threshold 2200 RPM (biturbo: 2800), pre-boost torque at 28% / 22% of peak |
| Aspiration | Per-mode multipliers on t100 / t200 and torque peak |
| Traction | Calibrated time penalty per drivetrain type |
| Terrain / weather | Post-multiplier: grip factor, temperature/density correction, headwind, rain |

## Technologies

| Library | Purpose |
|---------|---------|
| React Native + Expo | Mobile framework |
| TypeScript | Type safety |
| react-i18next | Internationalisation (EN / IT) |
| react-native-gifted-charts | Line charts and bar charts |
| @react-native-community/slider | Terrain & weather sliders |
| react-native-reanimated | Animations |
| expo-haptics | Haptic feedback |
| @react-native-async-storage/async-storage | Garage local persistence |
| expo-sharing | JSON file export |
| expo-file-system | File read/write for import/export |
| expo-clipboard | Copy share code to clipboard |
| expo-document-picker | JSON file import picker |

## Installation

```sh
git clone https://github.com/DevFoxxx/VirtualDyno.git
cd VirtualDyno
npm install
npx expo install @react-native-community/slider
npx expo install @react-native-async-storage/async-storage
npx expo install expo-sharing expo-file-system expo-clipboard expo-document-picker
npx expo start
```

Scan the QR code with Expo Go on Android or iOS, or press `a` for an Android emulator.

## Project structure

```
|-- app/
|   |-- (tabs)/
|       |-- index.tsx                 # Main screen - all state, physics, layout
|
|-- components/
|   |-- AdditionalStats.tsx           # Derived stats (kW, kg/CV, CV/t, distance)
|   |-- EngineTypePicker.tsx          # Engine type + aspiration selector with i18n
|   |-- GarageCard.tsx                # Single saved-set card (list view)
|   |-- GarageDetailScreen.tsx        # Full detail view: summary + all charts + share
|   |-- GarageScreen.tsx              # Garage list screen with FAB import button
|   |-- ImportModal.tsx               # Import modal: code tab + JSON file tab
|   |-- MaxTorqueChart.tsx            # RPM vs torque line chart
|   |-- PowerDistributionChart.tsx    # Grouped bar chart by speed band
|   |-- SaveSetModal.tsx              # Bottom sheet to save or edit a set
|   |-- ShareModal.tsx                # Share bottom sheet: Social / Code / JSON
|   |-- TerrainWeatherPicker.tsx      # Collapsible terrain + weather panel
|   |-- TheoreticalTopSpeed.tsx       # Power available vs required chart
|   |-- TractionPicker.tsx            # FWD / RWD / AWD icon selector
|   |-- shareUtils.ts                 # Encode/decode share code, export/import JSON
|   |-- useGarage.ts                  # CRUD hook for AsyncStorage garage
|
|-- context/
|   |-- AppThemeContext.tsx           # Centralizes the theme in a global context. This way, 
|                                       when you switch to dark/light, the entire app updates consistently.
|
|-- i18n/
|   |-- en.json                       # English translations
|   |-- es.json                       # Spanish translations
|   |-- it.json                       # Italian translations
|
|-- assets/
    |-- images/
        |-- asphalt.png               # Terrain icons
        |-- wet.png
        |-- snow.png
        |-- mud.png
        |-- sand.png
        |-- petrol.png                # Engine type icons
        |-- diesel.png
        |-- electric.png
        |-- natural.png               # Aspiration icons
        |-- turbo.png
        |-- supercharger.png
        |-- biturbo.png
        |-- FWD.png                   # Traction icons
        |-- RWD.png
        |-- AWD.png
```

## Garage & sharing

### Garage

The Garage stores vehicle sets locally using AsyncStorage. Each set captures the full input configuration, weather conditions, and results. Saved sets can be browsed from the main screen via the **Garage** button in the header.

- Tap a card to open its full detail view with all charts replayed from saved data
- Edit icon (✏️) — rename title, manufacturer, or model; a grey *edited* label appears after any update
- Trash icon (🗑) — delete with confirmation alert
- FAB (⬇) — opens the Import modal

### Share & Import

From any set's detail screen, tap the **share icon** (↗) to open a bottom sheet with three options:

| Option | What it does |
|--------|-------------|
| **Social Share** | Formatted text with key results + import code — share via WhatsApp, Telegram, etc. |
| **Share Code** | Generates a `VD-XXXXXX-…` code, copies it to clipboard, and opens the system share sheet |
| **Export JSON** | Creates a lightweight `.json` file (~2 KB, inputs only) and shares it via the system share sheet |

To import a set, tap the **FAB (⬇)** in the Garage screen:

| Tab | How to use |
|-----|-----------|
| **Enter Code** | Paste the full `VD-XXXXXX-…` code received from another user |
| **Open File** | Pick a `.json` file exported from VirtualDyno |

> Imported sets store input parameters only. Charts are recalculated on the device at import time — no stale graph data is carried over.

## Unit system

All internal calculations use the metric system. When the **IMP** toggle is active, conversions are applied at display time across every input, output, and chart axis:

| Metric | Imperial |
|--------|----------|
| km/h | mph |
| kg | lbs |
| kW | hp |
| Nm | lb·ft |
| m² | ft² |
| kg/m³ | lb/ft³ |
| °C | °F |

## Contributing

Pull requests are welcome. The areas most open to contribution are:

1. **Physics improvements** — torque-curve-based numerical integration for more accurate intermediate times
2. **UI / UX** — layout polish, chart label alignment (see open issues)
3. **New vehicle profiles** — preset configurations for common cars
4. **Translations** — additional languages beyond EN / IT
5. **Bug fixes** — check the [Issues](https://github.com/DevFoxxx/VirtualDyno/issues) tab

Please open an issue before starting significant work so we can coordinate.

## License

The source code is available for review and contributions.  
Commercial use, redistribution, and derivative works are not permitted  
without the author's explicit written permission. See [LICENSE](https://github.com/DevFoxxx/VirtualDyno/blob/main/LICENSE).
