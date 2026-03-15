import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import GarageScreen from '@/components/GarageScreen';
import { SaveSetModal } from '@/components/SaveSetModal';
import { useGarage } from '@/components/useGarage';
import TractionPicker from '@/components/TractionPicker';
import TheoreticalTopSpeed from '@/components/TheoreticalTopSpeed';
import MaxTorqueChart from '@/components/MaxTorqueChart';
import AdditionalStats from '@/components/AdditionalStats';
import ZeroTo100Chart from '@/components/ZeroTo100Chart';
import ZeroTo200Chart from '@/components/ZeroTo200Chart';
import PowerDistributionChart, { PowerBand } from '@/components/PowerDistributionChart';
import TerrainWeatherPicker, { WeatherConditions, TerrainType } from '@/components/TerrainWeatherPicker';
import EngineTypePicker, {
  EngineConfig,
  EngineType,
  AspirationMode,
  ENGINE_DEFAULTS,
  ASPIRATION_MODIFIERS,
} from '@/components/EngineTypePicker';

// ---------------------------------------------------------------------------
// Terrain modifiers: how each surface affects Cr and grip
// ---------------------------------------------------------------------------
const TERRAIN_MODIFIERS: Record<TerrainType, { crMultiplier: number; gripFactor: number }> = {
  asphalt: { crMultiplier: 1.0,  gripFactor: 1.0  },
  wet:     { crMultiplier: 1.2,  gripFactor: 0.85 },
  snow:    { crMultiplier: 2.0,  gripFactor: 0.5  },
  mud:     { crMultiplier: 3.5,  gripFactor: 0.4  },
  sand:    { crMultiplier: 2.8,  gripFactor: 0.45 },
};


// ---------------------------------------------------------------------------
// Inline accordion for advanced parameters
// ---------------------------------------------------------------------------
function AdvancedParamsAccordion({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();
  return (
    <View style={{ marginBottom: 15 }}>
      <TouchableOpacity
        style={advStyles.header}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={advStyles.headerText}>{t('advanced_params')}</Text>
        <Text style={advStyles.chevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && <View style={advStyles.body}>{children}</View>}
    </View>
  );
}

const advStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#004aad',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerText: { color: '#004aad', fontWeight: '600', fontSize: 15 },
  chevron:    { color: '#004aad', fontSize: 13 },
  body:       { marginTop: 8, paddingLeft: 4 },
});

const ACCENT = '#004aad';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const [showError, setShowError] = useState(false);
  const [selectedHelp, setSelectedHelp] = useState<HelpKey | null>(null);

  // --- Vehicle inputs ---
  const [cv, setCv] = useState('');
  const [kg, setKg] = useState('');
  const [efficienza, setEfficienza] = useState('0.85');
  const [densitaAria, setDensitaAria] = useState('1.225');
  const [cd, setCd] = useState('0.30');
  const [cr, setCr] = useState('0.015');
  const [areaFrontale, setAreaFrontale] = useState('2');
  const [trazione, setTrazione] = useState('');
  const [engineConfig, setEngineConfig] = useState<EngineConfig>({
    engineType: 'petrol',
    aspiration: 'natural',
  });
  const [minRPM, setMinRPM] = useState('500');
  const [maxRPM, setMaxRPM] = useState('');

  // --- Weather & terrain ---
  const [weatherConditions, setWeatherConditions] = useState<WeatherConditions>({
    terrain: 'asphalt',
    temperature: 20,
    windSpeed: 0,
    rain: false,
  });

  // --- Results ---
  const [result, setResult] = useState({ time0to100: '', time0to200: '', topSpeed: '' });
  const [graphData100, setGraphData100] = useState<{ speed: number; time: number }[]>([]);
  const [graphData200, setGraphData200] = useState<{ speed: number; time: number }[]>([]);
  const [powerBands, setPowerBands] = useState<PowerBand[]>([]);
  const [coppiaMassima, setCoppiaMassima] = useState<number | null>(null);
  const [coppiaGraphData, setCoppiaGraphData] = useState<{ rpm: number; coppia: number }[]>([]);
  const [topSpeedGraphData, setTopSpeedGraphData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  }>({ labels: [], datasets: [] });
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [isEnglish, setIsEnglish] = useState(true); // EN default
  const [isImperial, setIsImperial] = useState(false); // metric default

  // Force EN language on first mount
  useEffect(() => {
    i18n.changeLanguage('en');
  }, []);

  // Auto-update physical defaults when engine type changes
  useEffect(() => {
    const d = ENGINE_DEFAULTS[engineConfig.engineType];
    setEfficienza(d.efficienza);
    setCd(d.cd);
    setCr(d.cr);
    setAreaFrontale(d.areaFrontale);
    setMinRPM(d.minRPM);
  }, [engineConfig.engineType]);

  const { saveSet } = useGarage();
  const [showGarage, setShowGarage]       = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const ref = useRef<ScrollView>(null);
  const firstChartRef = useRef<View>(null);
  const firstChartY = useRef<number>(0);

  const isElectric = engineConfig.engineType === 'electric';

  const requiredFieldsFilled =
    cv && kg && areaFrontale && trazione &&
    efficienza && densitaAria && cd && cr &&
    (isElectric || (minRPM && maxRPM));

  const { colorScheme, toggleTheme } = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  type HelpKey = keyof typeof helpMessages;
  const helpMessages = {
    cv: t('help_cv'),
    kg: t('help_kg'),
    efficienza: t('help_efficienza'),
    densitaAria: t('help_densitaAria'),
    cd: t('help_cd'),
    cr: t('help_cr'),
    areaFrontale: t('help_areaFrontale'),
    trazione: t('help_trazione'),
    minRPM: t('help_minrpm'),
    maxRPM: t('help_maxrpm'),
  };

  const dynamicStyles = {
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: currentTheme.background,
    } as ViewStyle,
    text:  { color: currentTheme.text } as TextStyle,
    label: {
      paddingBottom: 10,
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.text,
    } as TextStyle,
    input: {
      fontSize: 16,
      height: 45,
      borderColor: '#004aad',
      borderWidth: 1,
      borderRadius: 6,
      paddingLeft: 10,
      color: currentTheme.text,
    },
    expoIcon:  { color: currentTheme.tabIconSelected },
    outputText: { fontSize: 16, marginBottom: 5, color: currentTheme.text },
    resultText: { fontSize: 16, color: currentTheme.text },
    languageText: { color: currentTheme.text },
  };

  const handleLanguageToggle = () => {
    const newLang = isEnglish ? 'it' : 'en';
    i18n.changeLanguage(newLang);
    setIsEnglish(!isEnglish);
  };


  // ---------------------------------------------------------------------------
  // Unit conversion helpers
  // All internal calculations stay metric. Conversions are display/input only.
  // ---------------------------------------------------------------------------
  const toDisplayWeight  = (kg: number)   => isImperial ? +(kg * 2.20462).toFixed(1)  : kg;
  const fromDisplayWeight= (val: number)  => isImperial ? +(val / 2.20462).toFixed(1) : val;
  const toDisplayArea    = (m2: number)   => isImperial ? +(m2 * 10.7639).toFixed(2)  : m2;
  const fromDisplayArea  = (val: number)  => isImperial ? +(val / 10.7639).toFixed(2) : val;
  const toDisplayDensity = (kgm3: number) => isImperial ? +(kgm3 * 0.0624).toFixed(4) : kgm3;
  const fromDisplayDensity=(val: number)  => isImperial ? +(val / 0.0624).toFixed(4)  : val;
  const toDisplaySpeed   = (kmh: number)  => isImperial ? +(kmh * 0.621371).toFixed(1): kmh;
  const toDisplayDist    = (m: number)    => isImperial ? +(m * 3.28084).toFixed(1)   : m;
  const toDisplayAccel   = (ms2: number)  => isImperial ? +(ms2 * 3.28084).toFixed(2) : ms2;
  const toDisplayPower   = (kw: number)   => isImperial ? +(kw * 1.341).toFixed(1)    : kw;

  const weightUnit   = isImperial ? 'lbs'   : 'kg';
  const areaUnit     = isImperial ? 'ft²'   : 'm²';
  const densityUnit  = isImperial ? 'lb/ft³': 'kg/m³';
  const speedUnit    = isImperial ? 'mph'   : 'km/h';
  const distUnit     = isImperial ? 'ft'    : 'm';
  const accelUnit    = isImperial ? 'ft/s²' : 'm/s²';
  const powerUnit    = isImperial ? 'hp'    : 'kW';
  const speed100Label= isImperial ? '0-62'  : '0-100';
  const speed200Label= isImperial ? '0-124' : '0-200';

  // ---------------------------------------------------------------------------
  // Core physics helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns weather/terrain-adjusted multiplier for the time result.
   * Applied as a post-multiplier on the base empirical time.
   */
  const getWeatherMultiplier = useCallback((): number => {
    const { terrain, temperature, windSpeed, rain } = weatherConditions;
    const mod = TERRAIN_MODIFIERS[terrain];

    // Terrain grip penalty: lower grip = longer time (inverse)
    let multiplier = 1.0 / mod.gripFactor; // e.g. snow 0.5 grip → ×2.0

    // Temperature: cold air is denser (more drag) and cold tyres = less grip
    // Below 10°C, add ~1% per degree; above 30°C, add ~0.3% per degree (tyre overheating)
    const tempC = temperature;
    if (tempC < 10) multiplier += (10 - tempC) * 0.01;
    else if (tempC > 30) multiplier += (tempC - 30) * 0.003;

    // Headwind: each 10 km/h adds ~0.5% to time (empirical)
    multiplier += (windSpeed / 10) * 0.005;

    // Rain: combined effect of wet road + reduced visibility / driver caution
    if (rain) multiplier *= 1.08;

    return multiplier;
  }, [weatherConditions]);

  /**
   * Empirical formula calibrated on real-world data (zperfs + multiple reference cars).
   *
   * 0-100: original formula (t = v / a at v=100 km/h) with traction penalty.
   * 0-200: t100_base × scaler, where scaler = 1.9516 + 0.2082 × (kg/cv)
   *        calibrated on Ferrari 488, Porsche GT3, Lamborghini Huracan,
   *        BMW M3, Golf GTI, Toyota GR86.
   */
  const calculateAccelerationTime = useCallback(
    (targetSpeed: number): string => {
      const powerCV  = parseFloat(cv);
      const mass     = parseFloat(kg);
      const eta      = parseFloat(efficienza);
      const rho      = parseFloat(densitaAria);
      const cdValue  = parseFloat(cd);
      const crValue  = parseFloat(cr);
      const area     = parseFloat(areaFrontale);

      const v100     = 27.78; // m/s
      const powerEff = powerCV * 735.5 * eta;

      const fAero100 = 0.5 * rho * cdValue * area * v100 * v100;
      const fRoll    = crValue * mass * 9.81;
      const fNet100  = powerEff / v100 - (fAero100 + fRoll);
      const a100     = fNet100 / mass;
      const t100base = v100 / a100; // base 0-100 without traction penalty

      let time: number;

      if (targetSpeed <= 100) {
        // Original empirical formula — scales linearly with speed ratio
        const vFinal = targetSpeed / 3.6;
        const fAero  = 0.5 * rho * cdValue * area * vFinal * vFinal;
        const fNet   = powerEff / vFinal - (fAero + fRoll);
        const accel  = fNet / mass;
        time = vFinal / accel;
      } else {
        // 0-200: power-to-weight based scaler calibrated on real data
        // scaler = 1.9516 + 0.2082 / pw  where pw = cv/kg
        const pw     = powerCV / mass;
        const scaler = Math.min(Math.max(1.9516 + 0.2082 / pw, 2.1), 3.8);
        time = t100base * scaler;

        // Scale for intermediate targets (e.g. 150 km/h) by linear interp
        if (targetSpeed < 200) {
          const ratio = (targetSpeed - 100) / 100; // 0..1
          const vFinal = targetSpeed / 3.6;
          const fAero  = 0.5 * rho * cdValue * area * vFinal * vFinal;
          const fNet   = powerEff / vFinal - (fAero + fRoll);
          const accel  = fNet / mass;
          const tLinear = vFinal / accel;
          // blend between linear formula and scaled model
          time = tLinear * (1 - ratio) + time * ratio;
        }
      }

      // Traction penalty — original empirical values (unchanged)
      let trazionePenalty = 0;
      if (trazione === 'RWD') trazionePenalty = (0.3 * targetSpeed) / 100;
      else if (trazione === 'AWD') trazionePenalty = (0.5 * targetSpeed) / 100;
      time = Math.max(time - trazionePenalty, 0);

      // Aspiration multiplier — calibrated on zperfs dyno data
      const aspMod = ASPIRATION_MODIFIERS[engineConfig.aspiration];
      const aspMult = targetSpeed <= 100 ? aspMod.t100Mult : aspMod.t200Mult;
      time = time * aspMult;

      // Diesel penalty: heavier, narrower powerband (~6% slower 0-100, ~9% 0-200)
      // Validated: BMW 320d 190cv 7.1s vs BMW 320i 184cv 7.5s
      if (engineConfig.engineType === 'diesel') {
        time = time * (targetSpeed <= 100 ? 1.06 : 1.09);
      }

      // Weather/terrain multiplier (applied as delta above baseline)
      const weatherMult  = getWeatherMultiplier();
      const weatherDelta = weatherMult - 1.0;
      time = time * (1 + weatherDelta);

      return time.toFixed(2);
    },
    [cv, kg, efficienza, densitaAria, cd, cr, areaFrontale, trazione, engineConfig, getWeatherMultiplier]
  );

  /**
   * Build speed-time graph data with a given step (km/h).
   */
  const buildGraphData = useCallback(
    (maxSpeed: number, step: number): { speed: number; time: number }[] => {
      const data: { speed: number; time: number }[] = [{ speed: 0, time: 0 }];

      if (maxSpeed <= 100) {
        // 0-100: direct formula, always monotone in this range
        for (let speed = step; speed <= maxSpeed; speed += step) {
          const time = parseFloat(calculateAccelerationTime(speed));
          if (!isNaN(time) && time > 0) data.push({ speed, time });
        }
        return data;
      }

      // 0-200: build in two segments anchored on exact t100 and t200
      // to guarantee monotonicity and match the displayed results exactly.
      const t100 = parseFloat(calculateAccelerationTime(100));
      const t200 = parseFloat(calculateAccelerationTime(200));
      if (isNaN(t100) || isNaN(t200) || t100 <= 0 || t200 <= t100) return data;

      // Segment 1: 0 → 100  (direct formula, capped to t100 anchor)
      for (let speed = step; speed < 100; speed += step) {
        const raw = parseFloat(calculateAccelerationTime(speed));
        const tCapped = Math.min(raw, t100 * (speed / 100));
        if (!isNaN(tCapped) && tCapped > 0) data.push({ speed, time: tCapped });
      }
      data.push({ speed: 100, time: t100 });

      // Segment 2: 100 → 200  (sqrt interpolation — physically realistic, strictly monotone)
      // t(v) = t100 + (t200 - t100) * sqrt((v - 100) / 100)
      // sqrt gives faster rise at start (high drag / limited surplus) and flattening near 200
      for (let speed = 100 + step; speed <= 200; speed += step) {
        const frac = (speed - 100) / 100; // 0..1
        const time = t100 + (t200 - t100) * Math.sqrt(frac);
        data.push({ speed, time: parseFloat(time.toFixed(3)) });
      }
      // Ensure last point is exactly t200
      if (data[data.length - 1].speed < 200) {
        data.push({ speed: 200, time: t200 });
      } else {
        data[data.length - 1] = { speed: 200, time: t200 };
      }

      return data;
    },
    [calculateAccelerationTime]
  );

  /** Binary-search for top speed with empirical high-speed loss factor.
   *  Factor calibrated: Ferrari 488 → 331 km/h (real 330),
   *  Golf GTI → 239 km/h (real 240), Huracan → 323 km/h (real 325).
   *  factor = clamp(0.95 - 0.52 × pw, 0.65, 0.90)  where pw = cv/kg
   */
  const calculateTopSpeed = useCallback((): string => {
    const powerCV  = parseFloat(cv);
    const mass     = parseFloat(kg);
    const eta      = parseFloat(efficienza);
    const rho      = parseFloat(densitaAria);
    const cdValue  = parseFloat(cd);
    const crValue  = parseFloat(cr);
    const area     = parseFloat(areaFrontale);
    const windMs   = weatherConditions.windSpeed / 3.6;

    // Empirical factor: high-speed drivetrain/thermal losses
    const pw       = powerCV / mass;
    const tsFactor = Math.min(Math.max(0.95 - 0.52 * pw, 0.65), 0.90);
    const powerEff = powerCV * 735.5 * eta * tsFactor;

    let vMin = 10, vMax = 500;
    while (vMax - vMin > 0.1) {
      const vMid = (vMin + vMax) / 2;
      const vMs  = vMid / 3.6;
      const vAir = vMs + windMs;
      const pReq =
        0.5 * rho * cdValue * area * vAir * vAir * vMs +
        crValue * mass * 9.81 * vMs;
      pReq < powerEff ? (vMin = vMid) : (vMax = vMid);
    }
    const vTopKmh = vMin;

    const labels: string[] = [];
    const pReqData: number[] = [];
    const pAvailData: number[] = [];
    for (let spd = 0; spd <= vTopKmh; spd += 5) {
      const vMs  = spd / 3.6;
      const vAir = vMs + windMs;
      const pReq =
        0.5 * rho * cdValue * area * vAir * vAir * vMs +
        crValue * mass * 9.81 * vMs;
      pReqData.push(pReq);
      pAvailData.push(powerEff);
      if (spd % 50 === 0) labels.push(spd.toFixed(0));
    }

    setTopSpeedGraphData({
      labels,
      datasets: [
        { data: pReqData.map((w) => w / 1000) },
        { data: pAvailData.map((w) => w / 1000) },
      ],
    });

    return vTopKmh.toFixed(2);
  }, [cv, kg, efficienza, densitaAria, cd, cr, areaFrontale, weatherConditions.windSpeed]);

  /** Power distribution across speed bands (0-50, 50-100, 100-150, 150-200) */
  const calculatePowerBands = useCallback((): PowerBand[] => {
    const powerCV  = parseFloat(cv);
    const mass     = parseFloat(kg);
    const eta      = parseFloat(efficienza);
    const rho      = parseFloat(densitaAria);
    const cdValue  = parseFloat(cd);
    const crValue  = parseFloat(cr);
    const area     = parseFloat(areaFrontale);
    const powerEff = powerCV * 735.5 * eta;
    const windMs   = weatherConditions.windSpeed / 3.6;

    // Bands always in km/h internally — label conversion happens in the chart via isImperial
    const bands: [number, number][] = [[0, 50], [50, 100], [100, 150], [150, 200]];
    return bands.map(([lo, hi]) => {
      const vMid  = ((lo + hi) / 2) / 3.6;
      const vAir  = vMid + windMs;
      const pAero = 0.5 * rho * cdValue * area * vAir * vAir * vMid;
      const pRoll = crValue * mass * 9.81 * vMid;
      const pReq  = pAero + pRoll;
      return {
        label:     `${lo}-${hi}`,   // raw km/h — chart converts to mph if isImperial
        loKmh:     lo,
        hiKmh:     hi,
        available: parseFloat((powerEff / 1000).toFixed(1)),
        required:  parseFloat((pReq     / 1000).toFixed(1)),
        surplus:   parseFloat(((powerEff - pReq) / 1000).toFixed(1)),
      };
    });
  }, [cv, kg, efficienza, densitaAria, cd, cr, areaFrontale, weatherConditions.windSpeed]);

  /** Torque curve — engine type + aspiration aware */
  const calculateCoppia = useCallback(() => {
    const powerCV   = parseFloat(cv);
    const powerWatt = powerCV * 735.5;
    const pesoKg    = parseFloat(kg);
    const { engineType, aspiration } = engineConfig;

    const maxRPMVal = engineType === 'electric' ? 20000 : parseFloat(maxRPM);
    const minRPMVal = engineType === 'electric' ? 0     : (parseFloat(minRPM) || 800);
    if (!powerWatt || !pesoKg || !maxRPMVal || minRPMVal >= maxRPMVal) return;

    const aspMod = ASPIRATION_MODIFIERS[aspiration];

    if (engineType === 'electric') {
      // EV curve: flat peak → mild drop → field weakening
      // Empirical: Tesla Model 3, Polestar 2, Rivian R1T dyno data
      const coppiaTeorica = (60 * powerWatt) / (2 * Math.PI * Math.max(maxRPMVal * 0.2, 100));
      const coppiaMax = coppiaTeorica * 0.90;
      setCoppiaMassima(coppiaMax);
      const p1 = maxRPMVal * 0.20;
      const p2 = maxRPMVal * 0.60;
      const data: { rpm: number; coppia: number }[] = [];
      for (let rpm = 0; rpm <= maxRPMVal; rpm += Math.max(1, Math.floor(maxRPMVal / 50))) {
        let coppia: number;
        if (rpm <= p1)      coppia = coppiaMax;
        else if (rpm <= p2) coppia = coppiaMax * (1.0 - 0.05 * (rpm - p1) / (p2 - p1));
        else                coppia = coppiaMax * 0.95 * (1.0 - 0.70 * (rpm - p2) / (maxRPMVal - p2));
        data.push({ rpm, coppia: Math.max(coppia, 0) });
      }
      setCoppiaGraphData(data);
      return;
    }

    // ICE — petrol / diesel
    const powerToWeight = powerCV / pesoKg;
    let tipo: 'normal' | 'sport' | 'super';
    if (powerCV > 500 || powerToWeight > 0.13)      tipo = 'super';
    else if (powerCV > 150 || powerToWeight > 0.07) tipo = 'sport';
    else                                             tipo = 'normal';

    const baseConfig = {
      normal: { rpmCoppiaMax: 3000, maxTorqueLimit: 220, decayFactor: 2500, crescitaFactor: 1200 },
      sport:  { rpmCoppiaMax: 4000, maxTorqueLimit: 380, decayFactor: 2000, crescitaFactor: 1500 },
      super:  { rpmCoppiaMax: 6000, maxTorqueLimit: 700, decayFactor: 1800, crescitaFactor: 2000 },
    }[tipo];

    const dieselRpmShift  = engineType === 'diesel' ? -1200 : 0;
    const rpmCoppiaMax    = Math.max(800, baseConfig.rpmCoppiaMax + aspMod.rpmPeakShift + dieselRpmShift);
    const decayFactor     = engineType === 'diesel' ? baseConfig.decayFactor * 0.65 : baseConfig.decayFactor;
    const dieselTorqueMult= engineType === 'diesel' ? 1.15 : 1.0;

    const coppiaTeorica = (60 * powerWatt) / (2 * Math.PI * rpmCoppiaMax);
    const coppiaMax = Math.min(
      coppiaTeorica * 0.85 * aspMod.torqueMult * dieselTorqueMult,
      baseConfig.maxTorqueLimit * aspMod.torqueMult
    );
    setCoppiaMassima(coppiaMax);

    const data: { rpm: number; coppia: number }[] = [];
    for (let rpm = minRPMVal; rpm <= maxRPMVal; rpm += 1000) {
      let coppia: number;
      if (aspiration === 'turbo' || aspiration === 'biturbo') {
        // Turbo lag: validated on Golf GTI EA888, BMW N54, Porsche 992 Turbo
        const boostThreshold = aspiration === 'biturbo' ? 2800 : 2200;
        const lagFactor      = aspiration === 'biturbo' ? 0.22 : 0.28;
        if (rpm < boostThreshold) {
          coppia = coppiaMax * lagFactor * (1 - Math.exp(-rpm / (baseConfig.crescitaFactor * 1.5)));
        } else if (rpm <= rpmCoppiaMax) {
          const t = (rpm - boostThreshold) / (rpmCoppiaMax - boostThreshold);
          coppia = coppiaMax * (lagFactor + (1 - lagFactor) * Math.pow(t, 0.5));
        } else {
          coppia = coppiaMax * Math.exp(-Math.pow((rpm - rpmCoppiaMax) / decayFactor, 2));
        }
      } else {
        coppia = rpm <= rpmCoppiaMax
          ? coppiaMax * (1 - Math.exp(-rpm / baseConfig.crescitaFactor))
          : coppiaMax * Math.exp(-Math.pow((rpm - rpmCoppiaMax) / decayFactor, 2));
      }
      data.push({ rpm, coppia: Math.max(coppia, 0) });
    }
    setCoppiaGraphData(data);
  }, [cv, kg, minRPM, maxRPM, engineConfig]);

  // ---------------------------------------------------------------------------
  // Main calculate handler — all heavy work deferred to avoid blocking UI
  // ---------------------------------------------------------------------------
  const handleCalculate = () => {
    if (!requiredFieldsFilled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShowError(true);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowError(false);

    // Give UI time to render before heavy computation
    setTimeout(() => {
      // 0-100 graph (step 2 km/h = 50 points — enough for smooth line)
      const data100 = buildGraphData(100, 2);
      const t100    = data100[data100.length - 1]?.time ?? 0;

      // 0-200 graph (step 5 km/h = 40 points)
      const data200 = buildGraphData(200, 5);
      const t200    = data200[data200.length - 1]?.time ?? 0;

      const topSpeed = calculateTopSpeed();
      const bands    = calculatePowerBands();
      calculateCoppia();

      // Batch all state updates
      setGraphData100(data100);
      setGraphData200(data200);
      setPowerBands(bands);
      setResult({
        time0to100: t100.toFixed(2),
        time0to200: t200.toFixed(2),
        topSpeed,
      });
      setIsResultVisible(true);

      setTimeout(() => {
        ref.current?.scrollTo({ y: firstChartY.current - 20, animated: true });
      }, 100);
    }, 50);
  };

  const handleSaveSet = async (title: string, brand: string, model: string) => {
    await saveSet({
      title, brand, model,
      cv, kg, trazione,
      engineType: engineConfig.engineType,
      aspiration: engineConfig.aspiration,
      minRPM, maxRPM,
      terrain:     weatherConditions.terrain,
      temperature: weatherConditions.temperature,
      windSpeed:   weatherConditions.windSpeed,
      rain:        weatherConditions.rain,
      isImperial,
      time0to100:  result.time0to100,
      time0to200:  result.time0to200,
      topSpeed:    result.topSpeed,
      graphData100,
      graphData200,
      coppiaGraphData,
      coppiaMassima,
      powerBands,
      topSpeedGraphData,
    });
    setShowSaveModal(false);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCv(''); setKg(''); setEfficienza('0.85'); setDensitaAria('1.225');
    setCd('0.30'); setCr('0.015'); setAreaFrontale('2');
    setMinRPM('500'); setMaxRPM(''); setTrazione('');
    setEngineConfig({ engineType: 'petrol', aspiration: 'natural' });
    setResult({ time0to100: '', time0to200: '', topSpeed: '' });
    setGraphData100([]); setGraphData200([]); setPowerBands([]);
    setTopSpeedGraphData({ labels: [], datasets: [] });
    setCoppiaGraphData([]); setCoppiaMassima(null);
    setWeatherConditions({ terrain: 'asphalt', temperature: 20, windSpeed: 0, rain: false });
    setIsResultVisible(false);
  };

  const renderInputField = (
    labelKey: string,
    state: string,
    setter: (value: string) => void,
    helpKey: string,
    placeholderOverride?: string,
    labelOverride?: string,
  ) => {
    const isDark = currentTheme.background !== '#fff';
    const labelText = labelOverride ?? t(labelKey);
    const placeholder = placeholderOverride ?? t(`${labelKey}_placeholder`);
    return (
      <View style={styles.inputGroup} key={helpKey}>
        <View style={[styles.inputCard, { backgroundColor: isDark ? '#101c2e' : '#f4f7ff', borderColor: state ? '#004aad' : (isDark ? '#1e2e45' : '#dce4f5') }]}>
          <View style={styles.inputCardHeader}>
            <Text style={[styles.inputCardLabel, { color: state ? '#004aad' : (isDark ? '#4a6890' : '#8899bb') }]}>
              {labelText}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setSelectedHelp(selectedHelp === helpKey ? null : (helpKey as HelpKey))
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather
                name='help-circle'
                size={15}
                color={selectedHelp === helpKey ? '#004aad' : (isDark ? '#3a5070' : '#b0bdd0')}
              />
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.inputCardField, { color: currentTheme.text }]}
            keyboardType='numeric'
            value={state}
            onChangeText={setter}
            placeholder={placeholder}
            placeholderTextColor={isDark ? '#2a3e58' : '#c0cce0'}
          />
        </View>
        {selectedHelp === helpKey && (
          <Text style={styles.helpText}>{helpMessages[helpKey as HelpKey]}</Text>
        )}
      </View>
    );
  };

  const buttonStyle = requiredFieldsFilled ? styles.buttonWhite : styles.buttonDisabled;

  return (
    <>
    {/* ── Garage Screen (stack) ── */}
    {showGarage && (
      <GarageScreen
        currentTheme={currentTheme}
        isImperial={isImperial}
        onBack={() => { Haptics.selectionAsync(); setShowGarage(false); }}
      />
    )}

    {!showGarage && (
    <ScrollView ref={ref} contentContainerStyle={dynamicStyles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        {/* Row 1: logo + title/subtitle */}
        <View style={styles.headerInner}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
          <View>
            <Text style={styles.title}>{t('title')}</Text>
            <Text style={styles.subtitle}>Performance Simulator</Text>
          </View>
        </View>
        {/* Row 2: garage button below, aligned left with the text */}
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); setShowGarage(true); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.garageBtn}
        >
          <Feather name="archive" size={15} color={ACCENT} />
          <Text style={styles.garageBtnText}>Garage</Text>
        </TouchableOpacity>
      </View>

      {/* Controls row — segmented pill */}
      <View style={styles.pillRow}>
        {/* Language segment */}
        <View style={[styles.pillGroup, { backgroundColor: currentTheme.background === '#fff' ? '#f0f4ff' : '#1a2235' }]}>
          <TouchableOpacity
            style={[styles.pillOption, !isEnglish && styles.pillOptionActive]}
            onPress={() => { if (isEnglish) { Haptics.selectionAsync(); handleLanguageToggle(); } }}
          >
            <Text style={[styles.pillText, !isEnglish && styles.pillTextActive]}>IT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pillOption, isEnglish && styles.pillOptionActive]}
            onPress={() => { if (!isEnglish) { Haptics.selectionAsync(); handleLanguageToggle(); } }}
          >
            <Text style={[styles.pillText, isEnglish && styles.pillTextActive]}>EN</Text>
          </TouchableOpacity>
        </View>

        {/* Unit segment */}
        <View style={[styles.pillGroup, { backgroundColor: currentTheme.background === '#fff' ? '#f0f4ff' : '#1a2235' }]}>
          <TouchableOpacity
            style={[styles.pillOption, !isImperial && styles.pillOptionActive]}
            onPress={() => { Haptics.selectionAsync(); setIsImperial(false); }}
          >
            <Text style={[styles.pillText, !isImperial && styles.pillTextActive]}>MET</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pillOption, isImperial && styles.pillOptionActive]}
            onPress={() => { Haptics.selectionAsync(); setIsImperial(true); }}
          >
            <Text style={[styles.pillText, isImperial && styles.pillTextActive]}>IMP</Text>
          </TouchableOpacity>
        </View>

        {/* Theme segment */}
        <View style={[styles.pillGroup, { backgroundColor: currentTheme.background === '#fff' ? '#f0f4ff' : '#1a2235' }]}>
          <TouchableOpacity
            style={[styles.pillOption, colorScheme !== 'dark' && styles.pillOptionActive]}
            onPress={() => { if (colorScheme === 'dark') { Haptics.selectionAsync(); toggleTheme(); } }}
          >
            <Feather name="sun" size={14} color={colorScheme !== 'dark' ? '#fff' : '#888'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pillOption, colorScheme === 'dark' && styles.pillOptionActive]}
            onPress={() => { if (colorScheme !== 'dark') { Haptics.selectionAsync(); toggleTheme(); } }}
          >
            <Feather name="moon" size={14} color={colorScheme === 'dark' ? '#fff' : '#888'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputsWrapper}>
        {/* Vehicle inputs */}
        {renderInputField('cv', cv, setCv, 'cv')}
        {renderInputField('kg', kg, setKg, 'kg', isImperial ? t('kg_placeholder_imperial') : undefined, isImperial ? t('kg_imperial') : undefined)}

        {/* Engine type + aspiration */}
        <View style={styles.inputGroup}>
          <EngineTypePicker
            config={engineConfig}
            setConfig={setEngineConfig}
            currentTheme={currentTheme}
          />
        </View>

        {!isElectric && renderInputField('minRPM', minRPM, setMinRPM, 'minRPM')}
        {!isElectric && renderInputField('maxRPM', maxRPM, setMaxRPM, 'maxRPM')}

        {/* Advanced parameters — collapsed by default */}
        <AdvancedParamsAccordion>
          {renderInputField('efficienza',   efficienza,   setEfficienza,   'efficienza')}
          {renderInputField('densitaAria',  densitaAria,  setDensitaAria,  'densitaAria')}
          {renderInputField('cd',           cd,           setCd,           'cd')}
          {renderInputField('cr',           cr,           setCr,           'cr')}
          {renderInputField('areaFrontale', areaFrontale, setAreaFrontale, 'areaFrontale')}
        </AdvancedParamsAccordion>

        {/* Traction picker */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <TouchableOpacity
              onPress={() =>
                setSelectedHelp(selectedHelp === 'trazione' ? null : 'trazione')
              }
            >
              <Feather name='help-circle' size={16} color={currentTheme.text} style={styles.helpIcon} />
            </TouchableOpacity>
            <Text style={dynamicStyles.label}> {t('trazione')}</Text>
          </View>
          <TractionPicker trazione={trazione} setTrazione={setTrazione} currentTheme={{ text: currentTheme.text, background: currentTheme.background }} />
          {selectedHelp === 'trazione' && (
            <Text style={styles.helpText}>{helpMessages.trazione}</Text>
          )}
        </View>

        {/* Terrain & Weather picker */}
        <TerrainWeatherPicker
          conditions={weatherConditions}
          onChange={setWeatherConditions}
          currentTheme={currentTheme}
          isImperial={isImperial}
        />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.calcButton, !requiredFieldsFilled && styles.calcButtonDisabled]}
            onPress={handleCalculate}
            disabled={!requiredFieldsFilled}
            activeOpacity={0.85}
          >
            <Feather name="zap" size={16} color={!requiredFieldsFilled ? '#aaa' : '#fff'} style={{ marginRight: 8 }} />
            <Text style={[styles.calcButtonText, !requiredFieldsFilled && { color: '#aaa' }]}>
              {t('calcola')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.85}>
            <Feather name="refresh-ccw" size={16} color="#004aad" style={{ marginRight: 6 }} />
            <Text style={styles.resetBtnText}>{t('reset')}</Text>
          </TouchableOpacity>
        </View>

        {showError && <Text style={styles.errorText}>{t('error_fields')}</Text>}

        {isResultVisible && (
          <>
          <View style={styles.risultatiHeader}>
            <View style={styles.risultatiLine} />
            <Text style={styles.risultati}>{t('risultati')}</Text>
            <View style={styles.risultatiLine} />
          </View>

          {/* Save Set button */}
          <TouchableOpacity
            style={styles.saveSetBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSaveModal(true); }}
            activeOpacity={0.85}
          >
            <Feather name="bookmark" size={15} color={ACCENT} style={{ marginRight: 7 }} />
            <Text style={styles.saveSetBtnText}>{t('save_set') ?? 'Save Set'}</Text>
          </TouchableOpacity>
          </>
        )}

        {/* 0-100 chart */}
        {graphData100.length > 0 && (
          <View
            ref={firstChartRef}
            onLayout={(e) => { firstChartY.current = e.nativeEvent.layout.y; }}
          >
          <ZeroTo100Chart
            graphData={graphData100}
            currentTheme={currentTheme}
            title={`${speed100Label} ${speedUnit}: ${result.time0to100} ${t('seconds')}`}
            description={t('chart_0_100_desc')}
            legendTitle={t('chart_0_100_legend')}
            isImperial={isImperial}
          />
          </View>
        )}

        {/* 0-200 chart */}
        {graphData200.length > 0 && (
          <ZeroTo200Chart
            graphData={graphData200}
            currentTheme={currentTheme}
            title={`${speed200Label} ${speedUnit}: ${result.time0to200} ${t('seconds')}`}
            description={t('chart_0_200_desc')}
            legendTitle={t('chart_0_200_legend')}
            isImperial={isImperial}
          />
        )}

        {/* Top speed chart */}
        {result.topSpeed && (
          <TheoreticalTopSpeed
            topSpeedGraphData={topSpeedGraphData}
            currentTheme={currentTheme}
            title={`${t('top_speed')} ${toDisplaySpeed(parseFloat(result.topSpeed)).toFixed(1)} ${speedUnit}`}
            legendTitle={`${t('chart_topspeed_legend')} (${speedUnit})`}
            description={t('chart_topspeed_desc')}
            isImperial={isImperial}
          />
        )}

        {/* Power distribution chart */}
        {powerBands.length > 0 && (
          <PowerDistributionChart
            bands={powerBands}
            currentTheme={currentTheme}
            title={t('chart_power_title')}
            description={t('chart_power_desc')}
            isImperial={isImperial}
          />
        )}

        {/* Torque chart */}
        {coppiaGraphData.length > 0 && (
          <MaxTorqueChart
            coppiaGraphData={coppiaGraphData}
            currentTheme={currentTheme}
            title={`${t('coppia_massima')}: ${isImperial ? (coppiaMassima! * 0.7376).toFixed(2) + ' lb·ft' : coppiaMassima!.toFixed(2) + ' Nm'}`}
            legendTitle={t('chart_torque_legend')}
            description={t('chart_torque_desc')}
            isImperial={isImperial}
          />
        )}

        {/* Additional stats */}
        {result.time0to100 && (
          <AdditionalStats
            cv={cv}
            kg={parseFloat(kg)}
            result={result}
            currentTheme={currentTheme}
            isImperial={isImperial}
            speed100Label={speed100Label}
            speed200Label={speed200Label}
            speedUnit={speedUnit}
            toDisplayPower={toDisplayPower}
            toDisplayDist={toDisplayDist}
            toDisplayAccel={toDisplayAccel}
            powerUnit={powerUnit}
            distUnit={distUnit}
            accelUnit={accelUnit}
          />
        )}

        <View style={{ marginBottom: 40 }} />
      </View>
    </ScrollView>
    )}

    {/* Save Set Modal */}
    <SaveSetModal
      visible={showSaveModal}
      currentTheme={currentTheme}
      onSave={handleSaveSet}
      onCancel={() => setShowSaveModal(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  // ── Header ──────────────────────────────────────────────────────────────
  headerContainer: {
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12, overflow: 'hidden',
  },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logo: { width: 52, height: 52, borderRadius: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#004aad', letterSpacing: -0.5 },
  subtitle: { fontSize: 11, color: '#6b8ccc', letterSpacing: 2, textTransform: 'uppercase', marginTop: 1 },

  // ── Pill row ─────────────────────────────────────────────────────────────
  pillRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 12, justifyContent: 'center',
  },
  pillGroup: {
    flexDirection: 'row', borderRadius: 50, padding: 3,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pillOption: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center', minWidth: 42,
  },
  pillOptionActive: {
    backgroundColor: '#004aad',
    shadowColor: '#004aad', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pillText: { fontSize: 12, fontWeight: '600', color: '#888' },
  pillTextActive: { color: '#fff' },

  // ── Inputs ───────────────────────────────────────────────────────────────
  inputsWrapper: { width: '90%', marginTop: 6 },
  inputGroup:    { marginBottom: 12 },
  labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  helpIcon: { marginLeft: 5, paddingBottom: 10 },
  helpText: { fontSize: 12, color: '#6b8ccc', marginTop: 5, paddingLeft: 6, fontStyle: 'italic' },

  // ── Input Card (new floating-label style) ────────────────────────────────
  inputCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  inputCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  inputCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  inputCardField: {
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: 4,
    paddingHorizontal: 0,
    letterSpacing: 0.2,
  },

  // ── Buttons ──────────────────────────────────────────────────────────────
  buttonContainer: { flexDirection: 'row', gap: 10, marginVertical: 20 },
  calcButton: {
    flex: 1, height: 50, borderRadius: 14, backgroundColor: '#004aad',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#004aad', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  calcButtonDisabled: {
    backgroundColor: '#e4e8f0', shadowOpacity: 0, elevation: 0,
  },
  calcButtonText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },
  resetBtn: {
    flex: 0.5, height: 50, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#004aad',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  resetBtnText: { color: '#004aad', fontWeight: '600', fontSize: 14 },

  // ── Results header ────────────────────────────────────────────────────────
  risultatiHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 14,
  },
  risultatiLine: { flex: 1, height: 1, backgroundColor: '#004aad', opacity: 0.25 },
  risultati: {
    fontSize: 16, fontWeight: '700', color: '#004aad', letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  garageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginLeft: 66,   // logo width (52) + gap (14)
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#004aad' + '55',
    backgroundColor: '#004aad' + '12',
  },
  garageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#004aad',
    letterSpacing: 0.5,
  },

  // ── Save Set button ───────────────────────────────────────────────────────
  saveSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#004aad',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  saveSetBtnText: {
    color: '#004aad',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // ── Error ─────────────────────────────────────────────────────────────────
  errorText: { color: '#e03030', textAlign: 'center', marginTop: -10, marginBottom: 10, fontSize: 13 },
});
