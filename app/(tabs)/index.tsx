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
import { Picker } from '@react-native-picker/picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';
import TractionPicker from '@/components/TractionPicker';
import ZeroTo100Chart from '@/components/ZeroTo100Chart';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const [showError, setShowError] = useState(false);
  const [selectedHelp, setSelectedHelp] = useState<string | null>(null);

  // State variables
  const [cv, setCv] = useState('');
  const [kg, setKg] = useState('');
  const [efficienza, setEfficienza] = useState('0.85');
  const [densitaAria, setDensitaAria] = useState('1.225');
  const [cd, setCd] = useState('0.30');
  const [cr, setCr] = useState('0.015');
  const [areaFrontale, setAreaFrontale] = useState('2');
  const [trazione, setTrazione] = useState('');
  const [result, setResult] = useState({ time0to100: '', topSpeed: '' });
  const [graphData, setGraphData] = useState<{ speed: number; time: number }[]>(
    []
  );
  const [isEnglish, setIsEnglish] = useState(i18n.language === 'en');
  const [minRPM, setMinRPM] = useState('500');
  const [maxRPM, setMaxRPM] = useState('');
  const [coppiaMassima, setCoppiaMassima] = useState<number | null>(null);
  const [coppiaGraphData, setCoppiaGraphData] = useState<
    { rpm: number; coppia: number }[]
  >([]);
  const [topSpeedGraphData, setTopSpeedGraphData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  }>({ labels: [], datasets: [] });
  const [isResultVisible, setIsResultVisible] = useState(false);

  const requiredFieldsFilled =
    cv &&
    kg &&
    areaFrontale &&
    minRPM &&
    maxRPM &&
    trazione &&
    efficienza &&
    densitaAria &&
    cd &&
    cr;
  const buttonStyle = requiredFieldsFilled
    ? styles.buttonWhite
    : styles.buttonDisabled;

  const { colorScheme, toggleTheme } = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // Help messages translations
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
    text: {
      color: currentTheme.text,
    } as TextStyle,
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
    expoIcon: {
      color: currentTheme.tabIconSelected,
    },
    additionalOutput: {
      marginTop: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      backgroundColor: currentTheme.background,
      marginBottom: 20,
    },
    outputText: {
      fontSize: 16,
      marginBottom: 5,
      color: currentTheme.text,
    },
    resultText: {
      fontSize: 16,
      color: currentTheme.text,
    },
    languageText: {
      color: currentTheme.text,
    },
  };

  // Language management function IT - EN
  const handleLanguageToggle = () => {
    const newLang = isEnglish ? 'it' : 'en';
    i18n.changeLanguage(newLang);
    setIsEnglish(!isEnglish);
  };

  // Function to calculate acceleration time from 0 to 100km/h
  const calculateAccelerationTime = (targetSpeed: number) => {
    const powerCV = parseFloat(cv);
    const mass = parseFloat(kg);
    const eta = parseFloat(efficienza);
    const rho = parseFloat(densitaAria);
    const cdValue = parseFloat(cd);
    const crValue = parseFloat(cr);
    const area = parseFloat(areaFrontale);

    const vFinal = targetSpeed === 100 ? 27.78 : targetSpeed / 3.6;
    const powerW = powerCV * 735.5;
    const powerEff = powerW * eta;
    const fAero = 0.5 * rho * cdValue * area * Math.pow(vFinal, 2);
    const fRoll = crValue * mass * 9.81;
    const fNet = powerEff / vFinal - (fAero + fRoll);
    const acceleration = fNet / mass;
    let time = vFinal / acceleration;

    let trazionePenalty = 0;
    if (trazione === 'RWD') {
      trazionePenalty = (0.3 * targetSpeed) / 100;
    } else if (trazione === 'AWD') {
      trazionePenalty = (0.5 * targetSpeed) / 100;
    }

    time = Math.max(time - trazionePenalty, 0);
    return time.toFixed(2);
  };

  // Function to calculate maximum speed based on available power in kW
  const calculateTopSpeed = () => {
    const powerW = parseFloat(cv) * 735.5;
    const eta = parseFloat(efficienza);
    const mass = parseFloat(kg);
    const rho = parseFloat(densitaAria);
    const cdValue = parseFloat(cd);
    const crValue = parseFloat(cr);
    const area = parseFloat(areaFrontale);

    const powerAvailable = powerW * eta;
    let vMin = 38;
    let vMax = 500;
    let vMid;

    while (vMax - vMin > 0.1) {
      vMid = (vMin + vMax) / 2;
      const powerRequired =
        0.5 * rho * cdValue * area * Math.pow(vMid / 3.6, 3) +
        crValue * mass * 9.81 * (vMid / 3.6);

      if (powerRequired < powerAvailable) {
        vMin = vMid;
      } else {
        vMax = vMid;
      }
    }

    const labels: string[] = [];
    const powerRequiredData: number[] = [];
    const powerAvailableData: number[] = [];

    for (let speed = 0; speed <= vMid; speed += 1) {
      const powerRequired =
        0.5 * rho * cdValue * area * Math.pow(speed / 3.6, 3) +
        crValue * mass * 9.81 * (speed / 3.6);
      powerRequiredData.push(powerRequired);
      powerAvailableData.push(powerAvailable);

      if (speed % 50 === 0) {
        labels.push(speed.toFixed(0));
      }
    }

    setTopSpeedGraphData({
      labels,
      datasets: [
        { data: powerRequiredData.map((watt) => watt / 1000) },
        { data: powerAvailableData.map((watt) => watt / 1000) },
      ],
    });

    return vMid.toFixed(2);
  };

  // Function to calculate the torque (coppia) based on engine specifications and RPM range
  const calculateCoppia = () => {
    const powerCV = parseFloat(cv);
    const powerWatt = powerCV * 735.5;
    const pesoKg = parseFloat(kg);
    let minRPMValue = parseFloat(minRPM) || 800;
    const maxRPMValue = parseFloat(maxRPM);

    if (!powerWatt || !pesoKg || !maxRPMValue || minRPMValue >= maxRPMValue)
      return;

    let tipo,
      step = 1000;
    const powerToWeight = powerCV / pesoKg;

    if (powerCV > 500 || powerToWeight > 0.13) {
      tipo = 'super';
    } else if (powerCV > 150 || powerToWeight > 0.07) {
      tipo = 'sport';
    } else {
      tipo = 'normal';
    }

    let rpmCoppiaMax, maxTorqueLimit, decayFactor, crescitaFactor;
    if (tipo === 'normal') {
      rpmCoppiaMax = 3000;
      maxTorqueLimit = 220;
      decayFactor = 2500;
      crescitaFactor = 1200;
    } else if (tipo === 'sport') {
      rpmCoppiaMax = 4000;
      maxTorqueLimit = 380;
      decayFactor = 2000;
      crescitaFactor = 1500;
    } else {
      // super
      rpmCoppiaMax = 6000;
      maxTorqueLimit = 700;
      decayFactor = 1800;
      crescitaFactor = 2000;
    }

    let coppiaTeorica = (60 * powerWatt) / (2 * Math.PI * rpmCoppiaMax);
    let coppiaMassimaRealistica = Math.min(
      coppiaTeorica * 0.85,
      maxTorqueLimit
    );
    setCoppiaMassima(coppiaMassimaRealistica);

    const rpmMedio = (minRPMValue + maxRPMValue) / 2;

    const data = [];
    for (let rpm = minRPMValue; rpm <= maxRPMValue; rpm += step) {
      let coppia;
      if (rpm <= rpmCoppiaMax) {
        coppia =
          coppiaMassimaRealistica * (1 - Math.exp(-rpm / crescitaFactor));
      } else {
        coppia =
          coppiaMassimaRealistica *
          Math.exp(-Math.pow((rpm - rpmCoppiaMax) / decayFactor, 2));
      }
      coppia = Math.max(coppia, 0);
      data.push({ rpm, coppia });
    }
    setCoppiaGraphData(data);
  };

  // Function to handle the calculation of acceleration time, top speed and torque
  const handleCalculate = () => {
    if (!requiredFieldsFilled) {
      setShowError(true);
      return;
    }
    setShowError(false);

    const time0to100 = calculateAccelerationTime(100);
    setResult({ time0to100, topSpeed: '' });

    const data = [];
    for (let speed = 0; speed <= 100; speed += 1) {
      const time = calculateAccelerationTime(speed);
      if (!isNaN(time)) {
        data.push({ speed, time: parseFloat(time) });
      }
    }

    if (data[0].speed !== 0) {
      data.unshift({ speed: 0, time: 0 });
    }

    setGraphData(data);

    const topSpeed = calculateTopSpeed();
    setResult((prev) => ({ ...prev, topSpeed }));

    calculateCoppia();
    setIsResultVisible(true);

    setTimeout(() => {
      ref.current?.scrollToEnd();
    }, 100);
  };

  // Function to reset input fields and delete output
  const handleReset = () => {
    setCv('');
    setKg('');
    setEfficienza('0.85');
    setDensitaAria('1.225');
    setCd('0.30');
    setCr('0.015');
    setAreaFrontale('2');
    setMinRPM('500');
    setMaxRPM('');
    setResult({ time0to100: '', topSpeed: '' });
    setGraphData([]);
    setTopSpeedGraphData({ labels: [], datasets: [] });
    setCoppiaGraphData([]);
    setCoppiaMassima(null);
    setTrazione('');
    setIsResultVisible(false);
  };

  const renderInputField = (
    labelKey: string,
    state: string,
    setter: (value: string) => void,
    helpKey: string
  ) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <TouchableOpacity
          onPress={() =>
            setSelectedHelp(selectedHelp === helpKey ? null : helpKey)
          }
        >
          <Feather
            name='help-circle'
            size={16}
            color={currentTheme.text}
            style={styles.helpIcon}
          />
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
        <Text style={styles.helpText}>{helpMessages[helpKey]}</Text>
      )}
    </View>
  );

  const ref = useRef<ScrollView>(null);

  return (
    <ScrollView ref={ref} contentContainerStyle={dynamicStyles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>{t('title')}</Text>
      </View>

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
        {renderInputField('cv', cv, setCv, 'cv')}
        {renderInputField('kg', kg, setKg, 'kg')}
        {renderInputField(
          'efficienza',
          efficienza,
          setEfficienza,
          'efficienza'
        )}
        {renderInputField(
          'densitaAria',
          densitaAria,
          setDensitaAria,
          'densitaAria'
        )}
        {renderInputField('cd', cd, setCd, 'cd')}
        {renderInputField('cr', cr, setCr, 'cr')}
        {renderInputField(
          'areaFrontale',
          areaFrontale,
          setAreaFrontale,
          'areaFrontale'
        )}
        {renderInputField('minRPM', minRPM, setMinRPM, 'minRPM')}
        {renderInputField('maxRPM', maxRPM, setMaxRPM, 'maxRPM')}

        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <TouchableOpacity
              onPress={() =>
                setSelectedHelp(selectedHelp === 'trazione' ? null : 'trazione')
              }
            >
              <Feather
                name='help-circle'
                size={16}
                color={currentTheme.text}
                style={styles.helpIcon}
              />
            </TouchableOpacity>
            <Text style={dynamicStyles.label}> {t('trazione')}</Text>
          </View>
          {/* <Picker
            selectedValue={trazione}
            onValueChange={setTrazione}
            dropdownIconColor={currentTheme.text}
          >
            {['FWD', 'RWD', 'AWD'].map((type) => (
              <Picker.Item
                key={type}
                label={t(type.toLowerCase())}
                value={type}
                color={dynamicStyles.text.color as string}
              />
            ))}
          </Picker> */}
          <TractionPicker
            trazione={trazione}
            setTrazione={setTrazione}
            currentTheme={currentTheme}
          />
          {selectedHelp === 'trazione' && (
            <Text style={styles.helpText}>{helpMessages.trazione}</Text>
          )}
        </View>

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

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>{t('reset')}</Text>
          </TouchableOpacity>
        </View>

        {showError && <Text style={styles.errorText}>{t('error_fields')}</Text>}

        {isResultVisible && (
          <Text style={styles.risultati}>{t('risultati')}</Text>
        )}

        {/* {result.time0to100 && (
          <Text style={dynamicStyles.resultText}>
            {t('tempo')} {result.time0to100} {t('seconds')}
          </Text>
        )} */}

        <ZeroTo100Chart //Description and legend title need to be translated in Italian
          graphData={graphData}
          currentTheme={currentTheme}
          title={`${t('tempo')} ${result.time0to100} ${t('seconds')}`}
          description={
            ' This graph represents the time taken to reach different speeds, illustrating acceleration performance.'
          }
          legendTitle={'Time To reach 100 km/h'}
        />

        {/* {graphData.length > 0 && (
          <View>
            <LineChart
              data={{
                labels: graphData
                  .filter((d, index) => index % 10 === 0)
                  .map((d) => `${d.speed}`),
                datasets: [{ data: graphData.map((d) => d.time) }],
              }}
              width={320}
              height={240}
              yAxisSuffix=' s'
              chartConfig={{
                backgroundColor: currentTheme.background,
                backgroundGradientFrom: currentTheme.background,
                backgroundGradientTo: currentTheme.background,
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 74, 173, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 74, 173, ${opacity})`,
                propsForDots: {
                  r: '0.1',
                  strokeWidth: '2',
                  stroke: currentTheme.text,
                },
                style: {
                  paddingTop: '5%',
                  paddingBottom: '5%',
                },
              }}
              bezier
              style={styles.chart}
              fromZero
            />
          </View>
        )} */}

        {result.topSpeed && (
          <Text style={dynamicStyles.resultText}>
            {t('top_speed')}: {result.topSpeed} km/h
          </Text>
        )}

        {result.topSpeed && (
          <View>
            <LineChart
              data={{
                labels: topSpeedGraphData.labels,
                datasets: topSpeedGraphData.datasets,
              }}
              width={320}
              height={240}
              yAxisSuffix=' kW'
              chartConfig={{
                backgroundColor: currentTheme.background,
                backgroundGradientFrom: currentTheme.background,
                backgroundGradientTo: currentTheme.background,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 74, 173, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 74, 173, ${opacity})`,
                propsForDots: {
                  r: (value, index) => (index % 50 === 0 ? 4 : 0),
                  strokeWidth: 2,
                  stroke: '#004aad',
                },
                propsForBackgroundLines: {
                  strokeWidth: 0.25,
                  strokeDasharray: '',
                },
                style: {
                  paddingTop: '5%',
                  paddingBottom: '5%',
                },
                strokeWidth: 1,
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {coppiaMassima && (
          <Text style={dynamicStyles.outputText}>
            {t('coppia_massima')}: {coppiaMassima.toFixed(2)} Nm
          </Text>
        )}

        {coppiaGraphData.length > 0 && (
          <View>
            <LineChart
              data={{
                labels: coppiaGraphData.map((d) => `${d.rpm}`),
                datasets: [{ data: coppiaGraphData.map((d) => d.coppia) }],
              }}
              width={320}
              height={240}
              yAxisSuffix=' Nm'
              chartConfig={{
                backgroundColor: currentTheme.background,
                backgroundGradientFrom: currentTheme.background,
                backgroundGradientTo: currentTheme.background,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 74, 173, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 74, 173, ${opacity})`,
                propsForDots: {
                  r: 3,
                  strokeWidth: 2,
                  stroke: '#004aad',
                },
                style: {
                  paddingTop: '5%',
                  paddingBottom: '5%',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {result.time0to100 && (
          <View style={dynamicStyles.additionalOutput}>
            <Text style={dynamicStyles.outputText}>
              {t('power_kw')}: {(parseFloat(cv) * 0.7355).toFixed(2)} kW
            </Text>
            <Text style={dynamicStyles.outputText}>
              {t('power_kgcv')}: {(kg / cv).toFixed(2)} CV/Kg
            </Text>
            <Text style={dynamicStyles.outputText}>
              {t('power')}: {(cv / (kg / 1000)).toFixed(2)} CV/t
            </Text>
            <Text style={dynamicStyles.outputText}>
              {t('acceleration')}:{' '}
              {(27.78 / parseFloat(result.time0to100)).toFixed(2)} m/s²
            </Text>
            <Text style={dynamicStyles.outputText}>
              {t('distance')}:{' '}
              {(
                0.5 *
                (27.78 / parseFloat(result.time0to100)) *
                Math.pow(parseFloat(result.time0to100), 2)
              ).toFixed(2)}{' '}
              meters
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#004aad',
  },
  risultati: {
    fontSize: 24,
    color: '#004aad',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    marginLeft: 200,
    color: '#004aad',
    borderRadius: 100,
    padding: 5,
    borderColor: 'white',
  },
  inputsWrapper: {
    width: '90%',
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  helpIcon: {
    marginLeft: 5,
    paddingBottom: 10,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginVertical: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonWhite: {
    backgroundColor: 'white',
    padding: 10,
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 50,
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 50,
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#004aad',
    padding: 10,
    height: 45,
    borderRadius: 50,
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: 'white',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 10,
  },
  resultText: {
    fontSize: 18,
    textAlign: 'left',
    marginVertical: 15,
    color: '#004aad',
  },
  chart: {
    marginVertical: 15,
    borderRadius: 8,
  },
  additionalOutput: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  outputText: {
    fontSize: 16,
    marginBottom: 5,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
});
