# <img src="assets/images/icon.png" alt="icon" width="50" height="50" /> VirtualDyno

![React Native](https://img.shields.io/badge/React%20Native-000000?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-Source--Available-orange?style=for-the-badge)
![WIP](https://img.shields.io/badge/Status-Active%20Development-green?style=for-the-badge)

> A physics-based vehicle performance simulator for mobile. No dyno required.

---

## Screenshots

| Light            | Dark             |
|------------------|------------------|
| ![](image.png)  | ![](image-1.png) |
| ![](image-2.png) | ![](image-3.png) |
| ![](image-4.png) | ![](image-5.png) |
| ![](image-6.png) | ![](image-7.png) |

---

# 🇬🇧 English

## What is VirtualDyno?

VirtualDyno is an open-source mobile app that simulates vehicle performance from a set of physical parameters — power, weight, aerodynamics, engine type, aspiration mode, drivetrain type, terrain, and weather. It gives you 0–100 km/h and 0–200 km/h times, theoretical top speed, a torque curve, and a power distribution analysis across speed bands — all without needing access to a physical dynamometer.

The physics model is empirically calibrated against data from multiple reliable sources across a wide range of vehicles, from everyday hatchbacks to high-performance supercars. The formulas are documented in the source code and designed to stay interpretable without sacrificing accuracy.

## Features

- **0–100 km/h (0–62 mph)** time with animated speed-time chart
- **0–200 km/h (0–124 mph)** time with monotonic curve interpolation — no dip artifacts
- **Theoretical top speed** via binary search with calibrated drivetrain loss factor
- **Torque curve** across the full RPM range, with engine-type-specific models
- **Power distribution chart** — surplus vs. required power across speed bands
- **Engine types** — Petrol, Diesel, Electric with dedicated physics defaults and torque curves
- **Aspiration modes** — Natural, Turbo (with lag model), Supercharger, Biturbo
- **Terrain & weather simulation** — asphalt, wet, snow, mud, sand; temperature, headwind, rain
- **Traction type** — FWD, RWD, AWD with calibrated grip penalties
- **Advanced parameters accordion** — efficiency, air density, Cd, Cr, frontal area
- **Metric / Imperial toggle** — full conversion across all inputs, outputs, and chart axes
- **English / Italian** language switch
- **Light / Dark theme**

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

## Installation

```sh
git clone https://github.com/DevFoxxx/VirtualDyno.git
cd VirtualDyno
npm install
npx expo install @react-native-community/slider
npx expo start
```

Scan the QR code with Expo Go on Android or iOS, or press `a` for an Android emulator.

## Project structure

```
app/
  index.tsx                  # Main screen — all state, physics, layout
components/
  AdditionalStats.tsx        # Derived stats (kW, hp, CV/t, distance…)
  EngineTypePicker.tsx       # Engine type + aspiration selector
  MaxTorqueChart.tsx         # RPM vs torque line chart
  PowerDistributionChart.tsx # Grouped bar chart by speed band
  TerrainWeatherPicker.tsx   # Terrain buttons + weather sliders
  TheoreticalTopSpeed.tsx    # Power available vs required chart
  TractionPicker.tsx         # FWD / RWD / AWD icon selector
  ZeroTo100Chart.tsx         # 0–100 speed-time line chart
  ZeroTo200Chart.tsx         # 0–200 speed-time line chart
i18n/
  en.json                    # English translations
  it.json                    # Italian translations
```

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
4. **Bug fixes** — check the [Issues](https://github.com/DevFoxxx/VirtualDyno/issues) tab

Please open an issue before starting significant work so we can coordinate.

## License

The source code is available for review and contributions.  
Commercial use, redistribution, and derivative works are not permitted  
without the author's explicit written permission. See [LICENSE](https://github.com/DevFoxxx/VirtualDyno/blob/main/LICENSE).

---

# 🇮🇹 Italiano

## Cos'è VirtualDyno?

VirtualDyno è un'app mobile open-source che simula le prestazioni di un veicolo a partire da parametri fisici — potenza, peso, aerodinamica, tipo di motore, modalità di aspirazione, tipo di trazione, fondo stradale e condizioni meteo. Fornisce i tempi 0–100 km/h e 0–200 km/h, la velocità massima teorica, la curva di coppia e un'analisi della distribuzione della potenza per fasce di velocità, senza bisogno di un banco prova fisico.

Il modello fisico è calibrato empiricamente su dati provenienti da diverse fonti affidabili, su un ampio numero di vetture che spaziano dalle citycar alle supercar ad alte prestazioni. Le formule sono documentate nel codice sorgente e progettate per restare leggibili senza sacrificare la precisione.

## Funzionalità

- **0–100 km/h** con grafico velocità-tempo animato
- **0–200 km/h** con interpolazione monotona della curva — nessun artefatto di discesa
- **Velocità massima teorica** tramite ricerca binaria con fattore di perdita calibrato
- **Curva di coppia** sull'intero range RPM, con modelli specifici per tipo di motore
- **Grafico distribuzione potenza** — potenza residua vs. richiesta per fasce di velocità
- **Tipo di motore** — Benzina, Diesel, Elettrico con defaults fisici e curve di coppia dedicate
- **Modalità di aspirazione** — Naturale, Turbo (con modello lag), Compressore, Biturbo
- **Simulazione fondo & meteo** — asfalto, bagnato, neve, fango, sabbia; temperatura, vento, pioggia
- **Tipo di trazione** — FWD, RWD, AWD con penalità di aderenza calibrate
- **Accordion parametri avanzati** — efficienza, densità aria, Cd, Cr, area frontale
- **Toggle Metrico / Imperiale** — conversione completa su input, output e assi dei grafici
- **Lingua inglese / italiana**
- **Tema chiaro / scuro**

## Modello fisico

| Output | Metodo |
|--------|--------|
| 0–100 km/h | Empirica: `t = v/a` a v = 100 km/h, forza netta da `P·η/v − F_aero − F_roll` |
| 0–200 km/h | Scaler calibrato: `t200 = t100 × clamp(1.9516 + 0.2082/(cv/kg), 2.1, 3.8)` |
| Grafico 0–200 | Interpolazione sqrt monotona ancorata su t100 / t200 esatti |
| Velocità max | Ricerca binaria su `F_motore − F_drag − F_rolling = 0` |
| Coppia (ICE) | Salita esponenziale + decadimento gaussiano, picco scalato per classe di potenza |
| Coppia (EV) | 3 fasi: picco piatto → calo lineare → indebolimento di campo |
| Penalità diesel | ×1.06 su 0–100, ×1.09 su 0–200 |
| Turbo lag | Soglia boost 2200 RPM (biturbo: 2800), pre-boost al 28% / 22% del picco |
| Aspirazione | Moltiplicatori per modalità su t100 / t200 e picco di coppia |
| Trazione | Penalità sul tempo calibrata per tipo di trazione |
| Fondo / meteo | Post-moltiplicatore: grip, correzione temperatura/densità, vento, pioggia |

## Tecnologie

| Libreria | Scopo |
|---------|-------|
| React Native + Expo | Framework mobile |
| TypeScript | Tipizzazione |
| react-i18next | Internazionalizzazione (EN / IT) |
| react-native-gifted-charts | Grafici a linee e a barre |
| @react-native-community/slider | Slider per fondo e meteo |
| react-native-reanimated | Animazioni |

## Installazione

```sh
git clone https://github.com/DevFoxxx/VirtualDyno.git
cd VirtualDyno
npm install
npx expo install @react-native-community/slider
npx expo start
```

Scansiona il QR code con Expo Go su Android o iOS, oppure premi `a` per un emulatore Android.

## Sistema di unità

Tutti i calcoli interni usano il sistema metrico. Quando il toggle **IMP** è attivo, le conversioni vengono applicate al momento della visualizzazione su ogni input, output e asse dei grafici.

## Contributi

Le pull request sono benvenute. Le aree più aperte ai contributi sono:

1. **Miglioramenti fisici** — integrazione numerica basata sulla curva di coppia per tempi più precisi
2. **UI / UX** — rifinitura del layout, allineamento etichette grafici (vedi issues aperti)
3. **Profili veicolo preimpostati** — configurazioni per auto comuni
4. **Bug fix** — controlla la sezione [Issues](https://github.com/DevFoxxx/VirtualDyno/issues)

Apri un issue prima di iniziare un lavoro significativo, così possiamo coordinarci.

## Licenza

Il codice sorgente è disponibile per consultazione e contribuzione.  
Uso commerciale, ridistribuzione e opere derivate non sono permessi  
senza autorizzazione scritta esplicita dell'autore. Vedi [LICENSE](https://github.com/DevFoxxx/VirtualDyno/blob/main/LICENSE).