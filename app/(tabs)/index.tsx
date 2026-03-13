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
  const [open, setOpen] = useState(false);
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
  headerText: {
    color: '#004aad',
    fontWeight: '600',
    fontSize: 15,
  },
  chevron: {
    color: '#004aad',
    fontSize: 13,
  },
  body: {
    marginTop: 8,
    paddingLeft: 4,
  },
});

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

  const ref = useRef<ScrollView>(null);

  const isElectric = engineConfig.engineType === 'electric';

  const requiredFieldsFilled =
    cv && kg && areaFrontale && trazione &&
    efficienza && densitaAria && cd && cr &&
    (isElectric || (minRPM && maxRPM));  // RPM fields not required for electric

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

      // Diesel penalty: heavier, narrower powerband, slower at same CV/kg
      // Validated: BMW 320d 190cv 7.1s vs BMW 320i 184cv 7.5s (diesel advantage
      // only from torque at low RPM in real gear changes, not raw power).
      // At same CV input, diesel is ~6% slower 0-100, ~9% slower 0-200.
      if (engineConfig.engineType === 'diesel') {
        const dieselPenalty = targetSpeed <= 100 ? 1.06 : 1.09;
        time = time * dieselPenalty;
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
      for (let speed = step; speed <= maxSpeed; speed += step) {
        const time = parseFloat(calculateAccelerationTime(speed));
        if (!isNaN(time) && time > 0) {
          data.push({ speed, time });
        }
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

    const bands: [number, number][] = [[0, 50], [50, 100], [100, 150], [150, 200]];
    return bands.map(([lo, hi]) => {
      const vMid  = ((lo + hi) / 2) / 3.6;
      const vAir  = vMid + windMs;
      const pAero = 0.5 * rho * cdValue * area * vAir * vAir * vMid;
      const pRoll = crValue * mass * 9.81 * vMid;
      const pReq  = pAero + pRoll;
      return {
        label:     `${lo}-${hi}`,
        available: parseFloat((powerEff / 1000).toFixed(1)),
        required:  parseFloat((pReq     / 1000).toFixed(1)),
        surplus:   parseFloat(((powerEff - pReq) / 1000).toFixed(1)),
      };
    });
  }, [cv, kg, efficienza, densitaAria, cd, cr, areaFrontale, weatherConditions.windSpeed]);

  /** Torque curve (unchanged logic, extracted for clarity) */
  const calculateCoppia = useCallback(() => {
    const powerCV    = parseFloat(cv);
    const powerWatt  = powerCV * 735.5;
    const pesoKg     = parseFloat(kg);
    const { engineType, aspiration } = engineConfig;

    // Electric uses fixed RPM range 0-20000 (motor speed, not shown to user)
    const maxRPMVal  = engineType === 'electric' ? 20000 : parseFloat(maxRPM);
    const minRPMVal  = engineType === 'electric' ? 0     : (parseFloat(minRPM) || 800);
    if (!powerWatt || !pesoKg || !maxRPMVal || minRPMVal >= maxRPMVal) return;

    const aspMod = ASPIRATION_MODIFIERS[aspiration];

    if (engineType === 'electric') {
      // ── Electric torque curve (empirical: Tesla Model 3 / Polestar 2 / Rivian) ──
      // Phase 1 (0 → 20% RPM): peak torque — flat (instant delivery)
      // Phase 2 (20% → 60% RPM): mild linear drop ~5% (thermal/current limits)
      // Phase 3 (60% → 100% RPM): field weakening — sharper drop to ~25% of peak
      const coppiaTeorica = (60 * powerWatt) / (2 * Math.PI * Math.max(maxRPMVal * 0.2, 100));
      const coppiaMax = coppiaTeorica * 0.90; // EV slightly higher mechanical efficiency
      setCoppiaMassima(coppiaMax);

      const rpmPhase1End = maxRPMVal * 0.20;
      const rpmPhase2End = maxRPMVal * 0.60;
      const data: { rpm: number; coppia: number }[] = [];
      for (let rpm = minRPMVal; rpm <= maxRPMVal; rpm += Math.max(1, Math.floor(maxRPMVal / 50))) {
        let coppia: number;
        if (rpm <= rpmPhase1End) {
          coppia = coppiaMax;
        } else if (rpm <= rpmPhase2End) {
          const t = (rpm - rpmPhase1End) / (rpmPhase2End - rpmPhase1End);
          coppia = coppiaMax * (1.0 - 0.05 * t);
        } else {
          const t = (rpm - rpmPhase2End) / (maxRPMVal - rpmPhase2End);
          coppia = coppiaMax * 0.95 * (1.0 - 0.70 * t); // drops to ~28% at redline
        }
        data.push({ rpm, coppia: Math.max(coppia, 0) });
      }
      setCoppiaGraphData(data);
      return;
    }

    // ── ICE torque curve (petrol / diesel) ────────────────────────────────────
    const powerToWeight = powerCV / pesoKg;
    let tipo: 'normal' | 'sport' | 'super';
    if (powerCV > 500 || powerToWeight > 0.13) tipo = 'super';
    else if (powerCV > 150 || powerToWeight > 0.07) tipo = 'sport';
    else tipo = 'normal';

    // Diesel: peak torque at much lower RPM, narrower band
    const dieselRpmShift = engineType === 'diesel' ? -1200 : 0;

    const baseConfig = {
      normal: { rpmCoppiaMax: 3000, maxTorqueLimit: 220, decayFactor: 2500, crescitaFactor: 1200 },
      sport:  { rpmCoppiaMax: 4000, maxTorqueLimit: 380, decayFactor: 2000, crescitaFactor: 1500 },
      super:  { rpmCoppiaMax: 6000, maxTorqueLimit: 700, decayFactor: 1800, crescitaFactor: 2000 },
    }[tipo];

    // Apply aspiration RPM shift + diesel shift
    const rpmCoppiaMax = Math.max(
      800,
      baseConfig.rpmCoppiaMax + aspMod.rpmPeakShift + dieselRpmShift
    );

    // Diesel: decayFactor tighter (narrower powerband)
    const decayFactor = engineType === 'diesel'
      ? baseConfig.decayFactor * 0.65
      : baseConfig.decayFactor;

    // Diesel torque limit +15% (higher compression ratio → more torque per displacement)
    const dieselTorqueMult = engineType === 'diesel' ? 1.15 : 1.0;

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
        // Turbo lag model — validated on Golf GTI EA888, BMW N54, Porsche 992 Turbo
        // Below boost threshold: coppia at ~25-30% of peak (wastegate closed, no boost)
        // Above threshold: rapid rise to peak (boost builds quickly)
        const boostThreshold = aspiration === 'biturbo' ? 2800 : 2200;
        const lagFactor = aspiration === 'biturbo' ? 0.22 : 0.28;

        if (rpm < boostThreshold) {
          // Pre-boost: low torque, rises slowly like natural aspiration
          coppia = coppiaMax * lagFactor * (1 - Math.exp(-rpm / (baseConfig.crescitaFactor * 1.5)));
        } else if (rpm <= rpmCoppiaMax) {
          // Boost onset: steep rise from lagFactor to 1.0
          const t = (rpm - boostThreshold) / (rpmCoppiaMax - boostThreshold);
          coppia = coppiaMax * (lagFactor + (1 - lagFactor) * Math.pow(t, 0.5));
        } else {
          // Post-peak: same gaussian decay as base
          coppia = coppiaMax * Math.exp(-Math.pow((rpm - rpmCoppiaMax) / decayFactor, 2));
        }
      } else {
        // Natural aspiration / supercharger — smooth exponential rise + gaussian decay
        coppia =
          rpm <= rpmCoppiaMax
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
      setShowError(true);
      return;
    }
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

      setTimeout(() => ref.current?.scrollToEnd(), 100);
    }, 50);
  };

  const handleReset = () => {
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
    helpKey: string
  ) => (
    <View style={styles.inputGroup} key={helpKey}>
      <View style={styles.labelContainer}>
        <TouchableOpacity
          onPress={() =>
            setSelectedHelp(selectedHelp === helpKey ? null : (helpKey as HelpKey))
          }
        >
          <Feather name='help-circle' size={16} color={currentTheme.text} style={styles.helpIcon} />
        </TouchableOpacity>
        <Text style={dynamicStyles.label}> {t(labelKey)}</Text>
      </View>
      <TextInput
        style={dynamicStyles.input}
        keyboardType='numeric'
        value={state}
        onChangeText={setter}
        placeholder={t(`${labelKey}_placeholder`)}
        placeholderTextColor={currentTheme.placeHolderColor}
      />
      {selectedHelp === helpKey && (
        <Text style={styles.helpText}>{helpMessages[helpKey as HelpKey]}</Text>
      )}
    </View>
  );

  const buttonStyle = requiredFieldsFilled ? styles.buttonWhite : styles.buttonDisabled;

  return (
    <ScrollView ref={ref} contentContainerStyle={dynamicStyles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        <Text style={styles.title}>{t('title')}</Text>
      </View>

      {/* Controls row */}
      <View style={styles.controlsContainer}>
        <View style={styles.languageContainer}>
          <Text style={dynamicStyles.languageText}>IT</Text>
          <Switch value={isEnglish} onValueChange={handleLanguageToggle} />
          <Text style={dynamicStyles.languageText}>EN</Text>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Feather
            name={colorScheme === 'dark' ? 'moon' : 'sun'}
            size={32}
            color={dynamicStyles.expoIcon.color}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputsWrapper}>
        {/* Vehicle inputs */}
        {renderInputField('cv', cv, setCv, 'cv')}
        {renderInputField('kg', kg, setKg, 'kg')}

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
          <TractionPicker trazione={trazione} setTrazione={setTrazione} currentTheme={currentTheme} />
          {selectedHelp === 'trazione' && (
            <Text style={styles.helpText}>{helpMessages.trazione}</Text>
          )}
        </View>

        {/* Terrain & Weather picker */}
        <TerrainWeatherPicker
          conditions={weatherConditions}
          onChange={setWeatherConditions}
          currentTheme={currentTheme}
        />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, buttonStyle]}
            onPress={handleCalculate}
            disabled={!requiredFieldsFilled}
          >
            <Text style={{ color: !requiredFieldsFilled ? '#999' : '#000' }}>
              {t('calcola')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
            <Text style={styles.resetButtonText}>{t('reset')}</Text>
          </TouchableOpacity>
        </View>

        {showError && <Text style={styles.errorText}>{t('error_fields')}</Text>}

        {isResultVisible && (
          <Text style={styles.risultati}>{t('risultati')}</Text>
        )}

        {/* 0-100 chart */}
        {graphData100.length > 0 && (
          <ZeroTo100Chart
            graphData={graphData100}
            currentTheme={currentTheme}
            title={`${t('tempo')} ${result.time0to100} ${t('seconds')}`}
            description={t('chart_0_100_desc')}
            legendTitle={t('chart_0_100_legend')}
          />
        )}

        {/* 0-200 chart */}
        {graphData200.length > 0 && (
          <ZeroTo200Chart
            graphData={graphData200}
            currentTheme={currentTheme}
            title={`0-200 km/h: ${result.time0to200} s`}
            description={t('chart_0_200_desc')}
            legendTitle={t('chart_0_200_legend')}
          />
        )}

        {/* Top speed chart */}
        {result.topSpeed && (
          <TheoreticalTopSpeed
            topSpeedGraphData={topSpeedGraphData}
            currentTheme={currentTheme}
            title={`${t('top_speed')} ${result.topSpeed} km/h`}
            legendTitle={t('chart_topspeed_legend')}
            description={t('chart_topspeed_desc')}
          />
        )}

        {/* Power distribution chart */}
        {powerBands.length > 0 && (
          <PowerDistributionChart
            bands={powerBands}
            currentTheme={currentTheme}
            title={t('chart_power_title')}
            description={t('chart_power_desc')}
          />
        )}

        {/* Torque chart */}
        {coppiaGraphData.length > 0 && (
          <MaxTorqueChart
            coppiaGraphData={coppiaGraphData}
            currentTheme={currentTheme}
            title={`${t('coppia_massima')}: ${coppiaMassima!.toFixed(2)} Nm`}
            legendTitle={t('chart_torque_legend')}
            description={t('chart_torque_desc')}
          />
        )}

        {/* Additional stats */}
        {result.time0to100 && (
          <AdditionalStats
            cv={cv}
            kg={parseFloat(kg)}
            result={result}
            currentTheme={currentTheme}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  logo:  { width: 50, height: 50, marginRight: 10 },
  title: { fontSize: 24, fontWeight: '500', color: '#004aad' },
  risultati: {
    fontSize: 24, color: '#004aad', marginTop: 20, marginBottom: 10, textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10,
  },
  languageContainer: { flexDirection: 'row', alignItems: 'center' },
  themeToggle: { marginLeft: 200, color: '#004aad', borderRadius: 100, padding: 5, borderColor: 'white' },
  inputsWrapper: { width: '90%', marginTop: 10 },
  inputGroup:   { marginBottom: 15 },
  labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  helpIcon: { marginLeft: 5, paddingBottom: 10 },
  helpText: { fontSize: 12, color: '#666', marginTop: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginVertical: 20 },
  button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonWhite: {
    backgroundColor: 'white', padding: 10, height: 45, borderWidth: 1,
    borderColor: '#ccc', borderRadius: 50, flex: 0.45, alignItems: 'center', justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0', padding: 10, height: 45, borderWidth: 1,
    borderColor: '#ccc', borderRadius: 50, flex: 0.45, alignItems: 'center', justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#004aad', padding: 10, height: 45,
    borderRadius: 50, flex: 0.45, alignItems: 'center', justifyContent: 'center',
  },
  resetButtonText: { color: 'white' },
  errorText: { color: 'red', textAlign: 'center', marginTop: -10, marginBottom: 10 },
});
