# <img src="assets/images/icon.png" alt="icon" width="50" height="50" /> VirtualDyno

![React Native](https://img.shields.io/badge/React%20Native-000000?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![WIP](https://img.shields.io/badge/Status-WIP-orange?style=for-the-badge)

> A mobile vehicle performance simulator — no dyno required.

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

VirtualDyno is an open-source mobile app that simulates vehicle performance from a set of physical parameters — power, weight, aerodynamics, drivetrain type, terrain, and weather. It gives you 0-100 km/h and 0-200 km/h times, theoretical top speed, a torque curve, and a power distribution analysis across speed bands, all without needing access to a physical dynamometer.

The physics model is deliberately calibrated to stay close to real-world data while remaining interpretable. Results are validated against reference vehicles (Ferrari 488, Lamborghini Huracán, BMW M3, Porsche 911 GT3, VW Golf GTI, Toyota GR86) using published zperfs data, and the formulas are documented in the source code.

## Features

- **0-100 km/h** time with animated speed-time chart
- **0-200 km/h** time with animated speed-time chart (monotonic interpolation — no dip artifacts)
- **Theoretical top speed** via binary search with calibrated drivetrain loss factor
- **Torque curve** across the full RPM range, with peak and decline highlighted
- **Power distribution chart** — surplus vs. required power across 0-50 / 50-100 / 100-150 / 150-200 km/h bands
- **Terrain & weather simulation** — asphalt, wet, snow, mud, sand; temperature, headwind, rain toggle
- **Traction type** — FWD, RWD, AWD with calibrated grip penalties
- **Light / Dark theme**
- **English / Italian** language switch

## Physics model

| Output | Method |
|--------|--------|
| 0-100 km/h | Empirical formula: `t = v/a` at v=100 km/h, net force from `P·η/v − F_aero − F_roll` |
| 0-200 km/h | Calibrated scaler on t100: `t200 = t100 × clamp(1.9516 + 0.2082/(cv/kg), 2.1, 3.8)` |
| Top speed | Binary search with `tsFactor = clamp(0.95 − 0.52·(cv/kg), 0.65, 0.90)` |
| Torque curve | Exponential rise + Gaussian decay around peak RPM |
| Terrain/weather | Post-multiplier on time: grip factor, temperature correction, headwind, rain |

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
npx expo start
```

Scan the QR code with Expo Go on Android or iOS, or press `a` for an Android emulator.

> **Note:** The `@react-native-community/slider` package requires `npx expo install @react-native-community/slider` if not already in your dependencies.

## Project structure

```
app/
  index.tsx                  # Main screen — all calculation logic
components/
  AdditionalStats.tsx        # Derived stats (kW, CV/t, distance…)
  MaxTorqueChart.tsx         # RPM vs torque line chart
  PowerDistributionChart.tsx # Grouped bar chart by speed band
  TerrainWeatherPicker.tsx   # Terrain buttons + sliders
  TheoreticalTopSpeed.tsx    # Power available vs required chart
  TractionPicker.tsx         # FWD / RWD / AWD icon selector
  ZeroTo100Chart.tsx         # 0-100 speed-time line chart
  ZeroTo200Chart.tsx         # 0-200 speed-time line chart
locales/
  en.json                    # English translations
  it.json                    # Italian translations
```

## Contributing

Pull requests are welcome. The areas most open to contribution are:

1. **Physics improvements** — torque-curve-based numerical integration for more accurate intermediate times
2. **UI / UX** — layout polish, icon update, chart label alignment (see open issues)
3. **New vehicle profiles** — preset configurations for common cars
4. **Electric / hybrid support** — different torque delivery model
5. **Bug fixes** — check the [Issues](https://github.com/DevFoxxx/VirtualDyno/issues) tab

Please open an issue before starting significant work so we can coordinate.

## License

The source code is available for review and contributions.
Commercial use, redistribution, and derivative works are not permitted
without the author's explicit written permission. See[LICENSE](https://github.com/DevFoxxx/VirtualDyno/blob/main/LICENSE).

---

# 🇮🇹 Italiano

## Cos'è VirtualDyno?

VirtualDyno è un'app mobile open-source che simula le prestazioni di un veicolo a partire da parametri fisici — potenza, peso, aerodinamica, tipo di trazione, fondo stradale e condizioni meteo. Fornisce i tempi 0-100 km/h e 0-200 km/h, la velocità massima teorica, la curva di coppia e un'analisi della distribuzione della potenza per fasce di velocità, senza bisogno di un banco prova fisico.

Il modello fisico è calibrato per avvicinarsi ai dati reali mantenendo la leggibilità delle formule. I risultati sono validati su veicoli di riferimento (Ferrari 488, Lamborghini Huracán, BMW M3, Porsche 911 GT3, VW Golf GTI, Toyota GR86) tramite dati zperfs, e le formule sono documentate nel codice sorgente.

## Funzionalità

- **0-100 km/h** con grafico velocità-tempo animato
- **0-200 km/h** con grafico velocità-tempo animato (interpolazione monotonica — nessun artefatto di discesa)
- **Velocità massima teorica** tramite ricerca binaria con fattore di perdita calibrato
- **Curva di coppia** sull'intero range RPM, con picco e declino evidenziati
- **Grafico distribuzione potenza** — potenza residua vs. potenza richiesta per fasce 0-50 / 50-100 / 100-150 / 150-200 km/h
- **Simulazione fondo & meteo** — asfalto, bagnato, neve, fango, sabbia; temperatura, vento frontale, pioggia
- **Tipo di trazione** — FWD, RWD, AWD con penalità di aderenza calibrate
- **Tema chiaro / scuro**
- **Lingua inglese / italiana**

## Modello fisico

| Output | Metodo |
|--------|--------|
| 0-100 km/h | Formula empirica: `t = v/a` a v=100 km/h, forza netta da `P·η/v − F_aero − F_roll` |
| 0-200 km/h | Scaler calibrato su t100: `t200 = t100 × clamp(1.9516 + 0.2082/(cv/kg), 2.1, 3.8)` |
| Velocità max | Ricerca binaria con `tsFactor = clamp(0.95 − 0.52·(cv/kg), 0.65, 0.90)` |
| Curva coppia | Salita esponenziale + decadimento gaussiano attorno al picco RPM |
| Fondo/meteo | Post-moltiplicatore sul tempo: fattore grip, correzione temperatura, vento, pioggia |

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
npx expo start
```

Scansiona il QR code con Expo Go su Android o iOS, oppure premi `a` per un emulatore Android.

## Contributi

Le pull request sono benvenute. Le aree più aperte ai contributi sono:

1. **Miglioramenti fisici** — integrazione numerica basata sulla curva di coppia per tempi intermedi più precisi
2. **UI / UX** — rifinitura del layout, aggiornamento icone, allineamento etichette grafici (vedi issues aperti)
3. **Profili veicolo preimpostati** — configurazioni per auto comuni
4. **Supporto elettrico / ibrido** — modello di erogazione coppia differente
5. **Bug fix** — controlla la sezione [Issues](https://github.com/DevFoxxx/VirtualDyno/issues)

Apri un issue prima di iniziare un lavoro significativo, così possiamo coordinarci.

## Licenza

Il codice sorgente è disponibile per consultazione e contribuzione. 
Uso commerciale, ridistribuzione e opere derivate non sono permessi 
senza autorizzazione scritta esplicita dell'autore. Vedi [LICENSE](https://github.com/DevFoxxx/VirtualDyno/blob/main/LICENSE).

