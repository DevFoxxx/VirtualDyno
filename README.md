# <img src="assets/images/icon.png" alt="icon" width="100" height="100" /> 
# VirtualDyno

![React Native](https://img.shields.io/badge/React%20Native-000000?style=for-the-badge&logo=react&logoColor=61DAFB) ![WIP](https://img.shields.io/badge/WIP%20-%20In%20progress-green) ![License: MIT](https://img.shields.io/badge/License-MIT-blue)

## Screenshot (development phase, light/dark theme)
 
![alt text](image-1.png) ![alt text](image-2.png) ![alt text](image-3.png)

# 🇬🇧 EN 
## Description
VirtualDyno is an advanced application designed to calculate and analyze vehicle performance using parameters such as power, weight, aerodynamic coefficient, and traction. With this data, it is possible to accurately estimate the 0-100 km/h acceleration time, specific power, average acceleration, and other key indicators to deeply understand a vehicle's dynamics. The primary goal of VirtualDyno is to provide a powerful yet easily accessible simulation tool for both hobbyists and professionals in the automotive sector, such as engineers and performance testers.

Being open-source, the software offers the possibility to be customized and improved by the community. Developers can contribute to the app's evolution, adding new features and tailoring it to specific needs. Users, therefore, benefit from an always-updated tool that meets various requirements. VirtualDyno is perfect for car enthusiasts, drivers, research and development teams, and automotive industry professionals who want to test and compare vehicles without the need for physical test benches. The interface is simple and intuitive, yet powerful, offering quick and accurate simulations.

The open-source approach and continuous evolution of the software make VirtualDyno an essential resource for anyone looking to explore vehicle performance in an economical, precise, and innovative way.

One of the most interesting aspects of VirtualDyno is its ability to find physical formulas that adapt to reality, without making the model too complex or unrealistic. The app stands out for its balance between precision and simplicity, offering reliable simulations without overwhelming the user with too many variables or mathematical complexities, making it a practical and accessible tool for everyone.

## Features
- Insert main vehicle data (CV, weight, efficiency, air density, Cd, Cr, frontal area, traction)
- Calculate vehicle performance
- Switch between Italian and English language
- Performance chart (under development)

## Technologies used
- **React Native** for mobile development
- **React Native Picker** for traction selection
- **react-i18next** for language management
- **react-native-chart-kit** for data visualization (in the future)

## Installation
1. Clone the repository:
```sh
git clone https://github.com/DevFoxxx/VirtualDyno.git
cd VirtualDyno
```
2. Install dependencies:
```sh
npm install
```
3. Run the app with Expo:
```sh
npx expo start
```
4. Choose to run the app on your Android emulator or a real device directly from the Expo developer tools.

## Available Translations
- Italian
- English

## Upcoming Developments
1. 0-200 Km/h time + graph
2. Estimated top speed
3. Torque calculation in Nm
4. Power distribution analysis across different speed ranges
5. Performance simulation on various terrain types (asphalt, snow, mud, etc.)
6. Aerodynamic parameter optimization based on customizable vehicle configurations
7. Support for advanced vehicle configurations, such as hybrid or electric models
8. Improvement of simulations under variable weather conditions (rain, wind, temperature)
9. Data storage for easy access and comparison over time
10. Data sharing with other users or platforms for collaboration and analysis

## Contributions
If you want to contribute, you can create a pull request with your changes or report issues in the "Issues" section of the repository. We're currently looking for people willing to help with the following:

1. Bug fixing  
2. Graphics improvement to make it more visually appealing  
3. Enhancement of physics functions to make them more realistic and simulation-based  
4. Assisting in the development of future updates

This project aims to remain free and available for everyone.

## Formulas Used

The function `calculateAccelerationTime(targetSpeed)` estimates the **acceleration time** required to reach a given speed (in km/h) from a standstill.

### Formula Breakdown:

1. **Unit Conversion:**
   - Convert speed from **km/h to m/s**:
     \[
     v_{final} = \frac{targetSpeed}{3.6}
     \]
   - If `targetSpeed` is **100 km/h**, `vFinal` is fixed at **27.78 m/s** for better accuracy.

2. **Power Conversion:**
   - Convert horsepower (CV) to watts (W):
     \[
     P_{W} = P_{CV} \times 735.5
     \]
   - Apply **transmission efficiency** (default `η = 0.85`):
     \[
     P_{eff} = P_{W} \times η
     \]

3. **Resistance Forces Calculation:**
   - **Aerodynamic Drag Force:**
     \[
     F_{aero} = \frac{1}{2} \times \rho \times C_d \times A \times v_{final}^2
     \]
     - `ρ`: Air density (kg/m³)
     - `C_d`: Drag coefficient
     - `A`: Frontal area (m²)

   - **Rolling Resistance Force:**
     \[
     F_{roll} = C_r \times M \times g
     \]
     - `C_r`: Rolling resistance coefficient
     - `M`: Vehicle mass (kg)
     - `g`: Gravity (9.81 m/s²)

4. **Net Force Available for Acceleration:**
   \[
   F_{net} = \frac{P_{eff}}{v_{final}} - (F_{aero} + F_{roll})
   \]

5. **Acceleration Calculation:**
   \[
   a = \frac{F_{net}}{M}
   \]

6. **Time to Reach Target Speed:**
   - Using the kinematic equation \( v = at \), we solve for time:
     \[
     t = \frac{v_{final}}{a}
     \]

7. **Traction Penalty Adjustments:**
   - If the vehicle is **Rear-Wheel Drive (RWD)**:
     \[
     penalty = (0.3 \times targetSpeed) / 100
     \]
   - If the vehicle is **All-Wheel Drive (AWD)**:
     \[
     penalty = (0.5 \times targetSpeed) / 100
     \]
   - The final acceleration time is reduced accordingly.

8. **Final Result:**
   - The function ensures `t ≥ 0` and rounds the result to **two decimal places**.

9. **Additional Outputs:**

   In addition to the acceleration time, the following additional performance calculations are displayed:

   - **Power per kg (CV/Kg):**
     \[
     \text{{Power per kg}} = \frac{{kg}}{{cv}} \, \text{{CV/Kg}}
     \]
   
   - **Power per ton (CV/t):**
     \[
     \text{{Power per ton}} = \frac{{cv}}{{kg/1000}} \, \text{{CV/t}}
     \]

   - **Acceleration (m/s²):**
     \[
     \text{{Acceleration}} = \frac{{27.78}}{{\text{{time to 100}}}} \, \text{{m/s²}}
     \]

   - **Distance covered (meters):**
     \[
     \text{{Distance}} = 0.5 \times \left( \frac{{27.78}}{{\text{{time to 100}}}} \right) \times \left( \text{{time to 100}}^2 \right) \, \text{{meters}}
     \]

### Final Formula:
\[
t = \frac{v_{final}}{\left( \frac{P_{eff}}{v_{final} M} - \left( \frac{1}{2} \rho C_d A v_{final}^2 + C_r M g \right) \right)}
\]
With **traction penalty subtracted at the end**.

This formula provides a realistic estimation of acceleration time by considering **vehicle power, aerodynamic drag, rolling resistance, and drivetrain traction effects**.

## License
This project is distributed under the [MIT license](https://github.com/DevFoxxx/VirtualDyno/blob/main/LICENSE).

---
# 🇮🇹 IT
## Descrizione
VirtualDyno è un'applicazione avanzata progettata per calcolare e analizzare le performance di un veicolo, utilizzando parametri come potenza, peso, coefficiente aerodinamico e trazione. Grazie a questi dati, è possibile stimare con precisione il tempo di accelerazione 0-100 km/h, la potenza specifica, l'accelerazione media e altri indicatori chiave per comprendere a fondo le dinamiche di un veicolo. L'obiettivo principale di VirtualDyno è fornire uno strumento di simulazione potente, ma facilmente accessibile, per hobbisti e professionisti del settore automobilistico, come ingegneri e tester di performance.

Essendo open-source, il software offre la possibilità di essere personalizzato e migliorato dalla comunità. Gli sviluppatori possono contribuire all'evoluzione dell'app, aggiungendo nuove funzionalità e adattandola alle diverse esigenze. Gli utenti, quindi, possono usufruire di uno strumento sempre aggiornato, in grado di rispondere alle necessità più specifiche. VirtualDyno è perfetto per appassionati di auto, automobilisti, team di ricerca e sviluppo e professionisti dell'industria automobilistica, che vogliono testare e confrontare veicoli senza la necessità di ricorrere a banchi prova fisici. L'interfaccia è semplice ed intuitiva, ma allo stesso tempo potente, offrendo simulazioni rapide e precise.

L'approccio open-source e l'evoluzione continua del software fanno di VirtualDyno una risorsa indispensabile per chi desidera esplorare le performance dei veicoli in modo economico, preciso e innovativo.

Uno degli aspetti più interessanti di VirtualDyno è la capacità di trovare formule fisiche in grado di adattarsi alla realtà, senza rendere il modello troppo complesso o irrealistico. L'app si distingue per il suo equilibrio tra precisione e semplicità, offrendo simulazioni affidabili senza sovraccaricare l'utente con troppe variabili o complessità matematiche, rendendola uno strumento pratico e accessibile per tutti.

## Funzionalità
- Inserimento dei dati principali del veicolo (CV, peso, efficienza, densità dell'aria, Cd, Cr, area frontale, trazione)
- Calcolo delle prestazioni del veicolo
- Cambio lingua tra Italiano e Inglese tramite uno switch
- Grafico delle prestazioni (in fase di sviluppo)

## Tecnologie utilizzate
- **React Native** per lo sviluppo mobile
- **React Native Picker** per la selezione della trazione
- **react-i18next** per la gestione delle lingue
- **react-native-chart-kit** per la visualizzazione dei dati (in futuro)

## Installazione
1. Clona il repository:
   ```sh
   git clone https://github.com/DevFoxxx/VirtualDyno.git
   cd VirtualDyno
   ```
2. Installa le dipendenze:
   ```sh
   npm install
   ```
3. Avvia l'app con Expo:
   ```sh
   npx expo start
   ```
4. Seleziona l'opzione per avviare l'app sul tuo emulatore Android o su un dispositivo reale direttamente dagli strumenti di sviluppo Expo.

## Traduzioni disponibili
- Italiano
- Inglese

## Prossimi Sviluppi
1. Tempo 0-200 Km/h + grafico
2. Stima velocità massima
3. Calcolo coppia in Nm
4. Analisi della distribuzione della potenza su diverse gamme di velocità
5. Simulazione delle performance su differenti tipologie di terreno (asfalto, neve, fango, ecc.)
6. Ottimizzazione dei parametri aerodinamici in base a configurazioni personalizzabili del veicolo
7. Supporto per configurazioni veicolari avanzate, come modelli ibridi o elettrici
8. Miglioramento delle simulazioni in condizioni climatiche variabili (pioggia, vento, temperatura)
9. Memorizzazione dei dati per un facile accesso e confronto nel tempo
10. Condivisione dei dati con altri utenti o piattaforme per collaborazioni e analisi

## Contributi
Se vuoi contribuire, puoi creare una pull request con le tue modifiche o segnalare problemi nella sezione "Issues" del repository. Siamo attualmente alla ricerca di persone disposte ad aiutare con i seguenti aspetti:

1. Correzione di bug
2. Miglioramento della grafica per renderla più attraente
3. Miglioramento della fisica delle funzioni rendendole più realistiche e simulative
4. Aiutare nello sviluppo dei prossimi sviluppi

Questo progetto mira a rimanere gratuito e disponibile per tutti.

## Formule Usate

La funzione `calculateAccelerationTime(targetSpeed)` stima il **tempo di accelerazione** necessario per raggiungere una velocità data (in km/h) da fermo.

### Dettaglio della Formula:

1. **Conversione dell'Unità:**
   - Convertire la velocità da **km/h a m/s**:
     \[
     v_{finale} = \frac{targetSpeed}{3.6}
     \]
   - Se `targetSpeed` è **100 km/h**, `vFinale` è fissato a **27.78 m/s** per una maggiore accuratezza.

2. **Conversione della Potenza:**
   - Convertire la potenza da cavalli (CV) a watt (W):
     \[
     P_{W} = P_{CV} \times 735.5
     \]
   - Applicare l'**efficienza di trasmissione** (default `η = 0.85`):
     \[
     P_{eff} = P_{W} \times η
     \]

3. **Calcolo delle Forze di Resistenza:**
   - **Forza di Resistenza Aerodinamica:**
     \[
     F_{aero} = \frac{1}{2} \times \rho \times C_d \times A \times v_{finale}^2
     \]
     - `ρ`: Densità dell'aria (kg/m³)
     - `C_d`: Coefficiente di resistenza aerodinamica
     - `A`: Area frontale (m²)

   - **Forza di Resistenza al Rotolamento:**
     \[
     F_{roll} = C_r \times M \times g
     \]
     - `C_r`: Coefficiente di resistenza al rotolamento
     - `M`: Massa del veicolo (kg)
     - `g`: Accelerazione di gravità (9.81 m/s²)

4. **Forza Netta Disponibile per l'Accelerazione:**
   \[
   F_{net} = \frac{P_{eff}}{v_{finale}} - (F_{aero} + F_{roll})
   \]

5. **Calcolo dell'Accelerazione:**
   \[
   a = \frac{F_{net}}{M}
   \]

6. **Tempo per Raggiungere la Velocità Target:**
   - Usando l'equazione cinematica \( v = at \), risolviamo per il tempo:
     \[
     t = \frac{v_{finale}}{a}
     \]

7. **Adeguamenti per il Penalizzamento della Trazione:**
   - Se il veicolo è a **trazione posteriore (RWD)**:
     \[
     penalty = (0.3 \times targetSpeed) / 100
     \]
   - Se il veicolo è a **trazione integrale (AWD)**:
     \[
     penalty = (0.5 \times targetSpeed) / 100
     \]
   - Il tempo finale di accelerazione viene ridotto di conseguenza.

8. **Risultato Finale:**
   - La funzione garantisce che `t ≥ 0` e arrotonda il risultato a **due decimali**.

9. **Uscite Aggiuntive:**

   Oltre al tempo di accelerazione, vengono visualizzati i seguenti calcoli aggiuntivi sulle performance:

   - **Potenza per kg (CV/Kg):**
     \[
     \text{{Potenza per kg}} = \frac{{kg}}{{cv}} \, \text{{CV/Kg}}
     \]
   
   - **Potenza per tonnellata (CV/t):**
     \[
     \text{{Potenza per tonnellata}} = \frac{{cv}}{{kg/1000}} \, \text{{CV/t}}
     \]

   - **Accelerazione (m/s²):**
     \[
     \text{{Accelerazione}} = \frac{{27.78}}{{\text{{tempo per 100}}}} \, \text{{m/s²}}
     \]

   - **Distanza percorsa (metri):**
     \[
     \text{{Distanza}} = 0.5 \times \left( \frac{{27.78}}{{\text{{tempo per 100}}}} \right) \times \left( \text{{tempo per 100}}^2 \right) \, \text{{metri}}
     \]

### Formula Finale:
\[
t = \frac{v_{finale}}{\left( \frac{P_{eff}}{v_{finale} M} - \left( \frac{1}{2} \rho C_d A v_{finale}^2 + C_r M g \right) \right)}
\]
Con il **penalizzamento della trazione sottratto alla fine**.

Questa formula fornisce una stima realistica del tempo di accelerazione considerando **potenza del veicolo, resistenza aerodinamica, resistenza al rotolamento e gli effetti della trazione del drivetrain**. 

## Licenza
Questo progetto è distribuito sotto la [licenza MIT](https://github.com/DevFoxxx/VirtualDyno/blob/main/LICENSE).
