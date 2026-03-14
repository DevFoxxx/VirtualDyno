# <img src="assets/images/icon.png" alt="icon" width="80" height="80" /> VirtualDyno

![React Native](https://img.shields.io/badge/React%20Native-000000?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-Source--Available-orange?style=for-the-badge)
![WIP](https://img.shields.io/badge/Status-Active%20Development-green?style=for-the-badge)

> A physics-based vehicle performance simulator for mobile. No dyno required.

---

## 📸 Screenshots (development phase — light / dark theme)

![screenshot 1](image.png) ![screenshot 2](image-1.png) ![screenshot 3](image-2.png) ![screenshot 4](image-3.png) ![screenshot 5](image-4.png) ![screenshot 6](image-5.png)

---

# 🇬🇧 English

## Description

VirtualDyno is an advanced mobile application designed to simulate and analyze vehicle performance using real physical parameters: power, weight, aerodynamic drag, rolling resistance, engine type, aspiration mode, terrain, and weather conditions.

The physics model is empirically calibrated against real-world dyno data (zperfs, manufacturer specs) and validated on known vehicles (BMW 320d vs 320i, Golf GTI EA888, Tesla Model 3). The goal is to stay as close as possible to real-world behavior without overcomplicating the model — balancing accuracy with accessibility.

VirtualDyno is open-source and built for car enthusiasts, engineers, performance testers, and developers who want a fast, portable simulation tool without physical test equipment.

## Features

- **0–100 km/h (0–62 mph)** acceleration simulation with terrain and weather modifiers
- **0–200 km/h (0–124 mph)** acceleration with monotonic curve interpolation
- **Top speed** estimation via binary search on force equilibrium
- **Torque curve** simulation — petrol, diesel, and electric-specific models
- **Power distribution** chart across speed bands
- **Engine types**: Petrol, Diesel, Electric — each with dedicated physics defaults and torque curves
- **Aspiration modes**: Natural, Turbo (with lag model), Supercharger, Biturbo — calibrated multipliers
- **Traction types**: FWD, RWD, AWD
- **Terrain modifiers**: Asphalt, Wet, Snow, Mud, Sand
- **Weather conditions**: Temperature, headwind, rain intensity
- **Advanced parameters accordion**: efficiency, air density, Cd, Cr, frontal area
- **Metric / Imperial toggle**: full conversion across all inputs, outputs, and charts
- **Language toggle**: 🇮🇹 Italian / 🇬🇧 English
- **Light / Dark theme** support

## Physics Model

| Quantity | Formula / Method |
|---|---|
| 0–100 time | Empirical: `t = v/a` at v = 100 km/h, calibrated scalar |
| 0–200 time | `t200 = t100 × clamp(1.9516 + 0.2082/(cv/kg), 2.1, 3.8)` |
| 0–200 graph | Monotonic sqrt interpolation between t100/t200 anchors |
| Top speed | Binary search on `F_engine - F_drag - F_rolling = 0` |
| Torque (ICE) | Exponential rise + Gaussian decay, peak RPM by power class |
| Torque (EV) | 3-phase: flat peak → mild linear drop → field weakening |
| Diesel penalty | ×1.06 on 0–100, ×1.09 on 0–200 (validated BMW 320d vs 320i) |
| Turbo lag | Boost threshold 2200 RPM (biturbo: 2800), pre-boost at 28%/22% of peak |
| Aspiration | Per-mode multipliers on t100/t200 and torque peak |
| Traction | Penalty coefficient on time per traction type |
| Terrain | Multiplier on resistance and grip |
| Weather | Temperature/density, headwind, rain drag corrections |

## Tech Stack

| Package | Purpose |
|---|---|
| `expo` + `expo-router` | App shell and navigation |
| `react-native` | UI framework |
| `typescript` | Type safety |
| `react-i18next` | EN / IT localisation |
| `react-native-gifted-charts` | Line, bar, and area charts |
| `@react-native-community/slider` | Weather condition sliders |

## Project Structure

```
VirtualDyno/
├── app/
│   └── index.tsx                  # Main screen — all state, physics, layout
├── components/
│   ├── EngineTypePicker.tsx        # Engine type + aspiration selector
│   ├── TractionPicker.tsx          # FWD / RWD / AWD selector
│   ├── TerrainWeatherPicker.tsx    # Terrain + weather conditions
│   ├── ZeroTo100Chart.tsx          # 0–100 speed/time chart
│   ├── ZeroTo200Chart.tsx          # 0–200 speed/time chart
│   ├── TheoreticalTopSpeed.tsx     # Top speed vs power chart
│   ├── PowerDistributionChart.tsx  # Power bands bar chart
│   ├── MaxTorqueChart.tsx          # Torque curve chart
│   └── AdditionalStats.tsx         # Derived stats card
├── i18n/
│   ├── en.json                     # English translations
│   └── it.json                     # Italian translations
└── assets/images/                  # Icons and screenshots
```

## Installation

```sh
git clone https://github.com/DevFoxxx/VirtualDyno.git
cd VirtualDyno
npm install
npx expo install @react-native-community/slider
npx expo start
```

Run on Android emulator or physical device via Expo Dev Tools.
For iOS testing without a paid Apple Developer account, use **Expo Go** (some native modules may have limited support).

## Unit System

All internal calculations use the metric system (km/h, kg, kW, Nm, m²). When the **IMP** toggle is active, conversions are applied at display time across every input, output, and chart axis:

| Metric | Imperial |
|---|---|
| km/h | mph |
| kg | lbs |
| kW | hp |
| Nm | lb·ft |
| m² | ft² |
| kg/m³ | lb/ft³ |
| °C | °F |

## Available Translations

| Language | Status |
|---|---|
| 🇬🇧 English | ✅ Complete |
| 🇮🇹 Italian | ✅ Complete |

## Roadmap

- [ ] Preset vehicle database (10–15 real cars as starting points)
- [ ] Share results as image / export
- [ ] Vehicle comparison mode (side-by-side)
- [ ] Third language (e.g. Spanish or German)
- [ ] "About" screen with physics model explanation
- [ ] Numerical torque integration for more precise acceleration model
- [ ] Play Store release

## Contributing

Pull requests and issues are welcome. Areas where help is most appreciated:

- Bug reports and edge-case physics validation
- UI/UX improvements
- Additional language translations
- Verified real-world data for physics calibration

## License

This project is **source-available** for viewing and non-commercial contribution.  
Commercial use, redistribution, and derivative products require explicit written permission from the author.  
See [LICENSE](./LICENSE) for full terms.

---

# 🇮🇹 Italiano

## Descrizione

VirtualDyno è un'applicazione mobile avanzata per simulare e analizzare le prestazioni di un veicolo tramite parametri fisici reali: potenza, peso, resistenza aerodinamica, resistenza al rotolamento, tipo di motore, tipo di aspirazione, terreno e condizioni meteo.

Il modello fisico è calibrato empiricamente su dati reali (zperfs, schede tecniche dei costruttori) e validato su veicoli noti (BMW 320d vs 320i, Golf GTI EA888, Tesla Model 3). L'obiettivo è restare il più vicino possibile al comportamento reale senza complicare eccessivamente il modello — bilanciando precisione e accessibilità.

VirtualDyno è open-source e pensato per appassionati di auto, ingegneri, tester di prestazioni e sviluppatori che cercano uno strumento di simulazione rapido e portatile, senza bisogno di attrezzature fisiche.

## Funzionalità

- Simulazione accelerazione **0–100 km/h** con modificatori terreno e meteo
- Accelerazione **0–200 km/h** con interpolazione monotona della curva
- Stima della **velocità massima** tramite ricerca binaria sull'equilibrio delle forze
- Simulazione della **curva di coppia** — modelli specifici per benzina, diesel ed elettrico
- Grafico **distribuzione della potenza** per fasce di velocità
- **Tipo motore**: Benzina, Diesel, Elettrico — con defaults fisici e curve di coppia dedicate
- **Modalità di aspirazione**: Naturale, Turbo (con modello lag), Compressore, Biturbo — moltiplicatori calibrati
- **Tipo di trazione**: FWD, RWD, AWD
- **Modificatori terreno**: Asfalto, Bagnato, Neve, Fango, Sabbia
- **Condizioni meteo**: Temperatura, vento frontale, intensità pioggia
- **Accordion parametri avanzati**: efficienza, densità aria, Cd, Cr, area frontale
- **Toggle Metrico / Imperiale**: conversione completa su tutti gli input, output e assi dei grafici
- **Toggle lingua**: 🇮🇹 Italiano / 🇬🇧 Inglese
- Supporto **tema chiaro / scuro**

## Installazione

```sh
git clone https://github.com/DevFoxxx/VirtualDyno.git
cd VirtualDyno
npm install
npx expo install @react-native-community/slider
npx expo start
```

Avvia su emulatore Android o dispositivo fisico tramite Expo Dev Tools.  
Per test su iOS senza Apple Developer Account, usa **Expo Go**.

## Sistema di unità

Tutti i calcoli interni usano il sistema metrico (km/h, kg, kW, Nm, m²). Quando il toggle **IMP** è attivo, le conversioni vengono applicate al momento della visualizzazione su ogni input, output e asse dei grafici.

## Licenza

Questo progetto è **source-available** per consultazione e contribuzione non commerciale.  
L'uso commerciale, la ridistribuzione e i prodotti derivati richiedono autorizzazione scritta esplicita dell'autore.  
Consulta [LICENSE](./LICENSE) per i termini completi.