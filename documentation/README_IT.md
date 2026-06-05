<div align="center">
<img src="../assets/images/icon.png" alt="icon.png" width="80" style="vertical-align: middle; border-radius: 9999px">
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
  <a href="../README.md" style="padding: 10px; background-color: #2B7FFF; border-radius: 10px; color: white">🇺🇸 English</a>
</div>

> Un simulatore di prestazioni veicolari basato sulla fisica per dispositivi mobili. Nessun banco prova necessario.

---

<center><h1>Cos'è VirtualDyno?</h1></center>

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
- **Simulazione fondo & meteo** — asfalto, bagnato, neve, fango, sabbia; temperatura, vento, pioggia — pannello collassabile con selettore fondo basato su icone e badge di stato attivo
- **Tipo di trazione** — FWD, RWD, AWD con penalità di aderenza calibrate
- **Accordion parametri avanzati** — efficienza, densità aria, Cd, Cr, area frontale
- **Toggle Metrico / Imperiale** — conversione completa su input, output e assi dei grafici
- **Lingua inglese / italiana**
- **Tema chiaro / scuro**
- **Feedback aptico** — vibrazione di selezione, impatto ed errore su tutti gli elementi interattivi
- **Garage** — salva, sfoglia, modifica ed elimina set con riesecuzione completa dei grafici
- **Condivisione & Import** — tre modalità di condivisione (Social, Codice, JSON) e due metodi di import (codice, file)

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
| expo-haptics | Feedback aptico |
| @react-native-async-storage/async-storage | Persistenza locale Garage |
| expo-sharing | Export file JSON |
| expo-file-system | Lettura/scrittura file per import/export |
| expo-clipboard | Copia codice di condivisione negli appunti |
| expo-document-picker | Selettore file per import JSON |

## Installazione

```sh
git clone https://github.com/DevFoxxx/VirtualDyno.git
cd VirtualDyno
npm install
npx expo install @react-native-community/slider
npx expo install @react-native-async-storage/async-storage
npx expo install expo-sharing expo-file-system expo-clipboard expo-document-picker
npx expo start
```

Scansiona il QR code con Expo Go su Android o iOS, oppure premi `a` per un emulatore Android.

## Garage e condivisione

### Garage

Il Garage salva i set localmente tramite AsyncStorage. Ogni set contiene la configurazione completa degli input, le condizioni meteo e i risultati. I set salvati sono accessibili dalla schermata principale tramite il bottone **Garage** nell'header.

- Tocca una card per aprire la vista dettaglio completa con tutti i grafici ricostruiti dai dati salvati
- Icona ✏️ — rinomina titolo, casa automobilistica o modello; dopo ogni modifica compare la scritta *edited* in grigio
- Icona 🗑 — elimina con alert di conferma
- FAB ⬇ — apre il modal di import

### Condivisione & Import

Dalla vista dettaglio di un set, tocca l'**icona di condivisione** (↗) per aprire un bottom sheet con tre opzioni:

| Opzione | Cosa fa |
|---------|---------|
| **Social Share** | Testo formattato con i risultati chiave + codice di import — condivisibile via WhatsApp, Telegram, ecc. |
| **Share Code** | Genera un codice `VD-XXXXXX-…`, lo copia negli appunti e apre il sistema di condivisione nativo |
| **Export JSON** | Crea un file `.json` leggero (~2 KB, solo input) e lo condivide tramite il sistema nativo |

Per importare un set, tocca il **FAB (⬇)** nella schermata Garage:

| Tab | Come si usa |
|-----|-------------|
| **Enter Code** | Incolla il codice completo `VD-XXXXXX-…` ricevuto da un altro utente |
| **Open File** | Seleziona un file `.json` esportato da VirtualDyno |

> I set importati contengono solo i parametri di input. I grafici vengono ricalcolati sul dispositivo al momento dell'import.

## Sistema di unità

Tutti i calcoli interni usano il sistema metrico. Quando il toggle **IMP** è attivo, le conversioni vengono applicate al momento della visualizzazione su ogni input, output e asse dei grafici.

## Contributi

Le pull request sono benvenute. Le aree più aperte ai contributi sono:

1. **Miglioramenti fisici** — integrazione numerica basata sulla curva di coppia per tempi più precisi
2. **UI / UX** — rifinitura del layout, allineamento etichette grafici (vedi issues aperti)
3. **Profili veicolo preimpostati** — configurazioni per auto comuni
4. **Traduzioni** — lingue aggiuntive oltre a EN / IT
5. **Bug fix** — controlla la sezione [Issues](https://github.com/DevFoxxx/VirtualDyno/issues)

Apri un issue prima di iniziare un lavoro significativo, così possiamo coordinarci.

## Licenza

Il codice sorgente è disponibile per consultazione e contribuzione.  
Uso commerciale, ridistribuzione e opere derivate non sono permessi  
senza autorizzazione scritta esplicita dell'autore. Vedi [LICENSE](https://github.com/DevFoxxx/VirtualDyno/blob/main/LICENSE).
