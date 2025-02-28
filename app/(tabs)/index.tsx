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
import { useState, useEffect, useRef } from 'react';

import Animated from 'react-native-reanimated';
import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';

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
  const [areaFrontale, setAreaFrontale] = useState('');
  const [trazione, setTrazione] = useState('FWD');
  const [result, setResult] = useState({ time0to100: '' });
  const [graphData, setGraphData] = useState([]);
  const [isEnglish, setIsEnglish] = useState(i18n.language === 'en');

  const requiredFieldsFilled = cv && kg && areaFrontale;
  const buttonStyle = requiredFieldsFilled ? styles.buttonWhite : styles.buttonDisabled;

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
      marginBottom: 30,
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
      fontSize: 18,
      marginTop: 20,
      color: currentTheme.text,
    },
  };

  // function to toggle language
  const handleLanguageToggle = () => {
    const newLang = isEnglish ? 'it' : 'en';
    i18n.changeLanguage(newLang);
    setIsEnglish(!isEnglish);
  };

  // function to calculate acceleration time
  const calculateAccelerationTime = (targetSpeed) => {
    const powerCV = parseFloat(cv);
    const mass = parseFloat(kg);
    const eta = parseFloat(efficienza);
    const rho = parseFloat(densitaAria);
    const cdValue = parseFloat(cd);
    const crValue = parseFloat(cr);
    const area = parseFloat(areaFrontale);

    const vFinal = targetSpeed === 100 ? 27.78 : targetSpeed / 3.6; // convert speed from km/h to m/s, with a fixed value for 100 km/h

    const powerW = powerCV * 735.5; // convert horsepower (CV) to watts
    const powerEff = powerW * eta; // apply efficiency factor to get effective power
    const fAero = 0.5 * rho * cdValue * area * Math.pow(vFinal, 2); // calculate aerodynamic resistance force
    const fRoll = crValue * mass * 9.81; // calculate rolling resistance force
    const fNet = powerEff / vFinal - (fAero + fRoll); // compute net force available for acceleration
    const acceleration = fNet / mass; // derive acceleration using f = ma
    let time = vFinal / acceleration; // compute time to reach final velocity using kinematic equation

    let trazionePenalty = 0; // initialize traction penalty

    if (trazione === 'RWD') {
      trazionePenalty = (0.3 * targetSpeed) / 100; // apply rear-wheel drive traction penalty
    } else if (trazione === 'AWD') {
      trazionePenalty = (0.5 * targetSpeed) / 100; // apply all-wheel drive traction penalty
    }

    time -= trazionePenalty; // subtract traction penalty from total time
    time = Math.max(time, 0); // ensure time is not negative

    return time.toFixed(2);
  };

  // function to trigger calculation and update state
  const handleCalculate = () => {
    if (!requiredFieldsFilled) {
      setShowError(true);
      return;
    }
    setShowError(false);
    const time0to100 = calculateAccelerationTime(100);
    setResult({ time0to100 });

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

    // scroll down to the graph when its generated, time delay is used to ensure graph is generated before it scrolls down
    setTimeout(() => {
      ref.current?.scrollToEnd();
    }, 100);
  };


  // function to reset all inputs and results
  const handleReset = () => {
    setCv('');
    setKg('');
    setEfficienza('0.85');
    setDensitaAria('1.225');
    setCd('0.30');
    setCr('0.015');
    setAreaFrontale('');
    setResult({ time0to100: '' });
    setGraphData([]);
  };

  // calculation of specific power and other metrics
  const powerW = parseFloat(cv) * 735.5;

  //used to scroll all the way down to reveal the graph
  const ref = useRef<ScrollView>(null);

  return (
    <ScrollView ref={ref} contentContainerStyle={dynamicStyles.container}>
      <View style={dynamicStyles.container}>
        <View style={styles.row}>
          <Animated.View style={styles.imageContainer}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.icon}
            />
          </Animated.View>
          <Animated.Text style={styles.Text}>{t('title')}</Animated.Text>
        </View>
      </View>

      <View
        style={{
          marginVertical: 20,
          marginBottom: 40,
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 30,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={dynamicStyles.languageText}>IT</Text>
          <Switch value={isEnglish} onValueChange={handleLanguageToggle} />
          <Text style={dynamicStyles.languageText}>EN</Text>
          
  // Render input field with help icon
  const renderInputField = (labelKey: string, state: string, setter: any, helpKey: string) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Text style={dynamicStyles.label}>{t(labelKey)}</Text>
        <TouchableOpacity onPress={() => setSelectedHelp(selectedHelp === helpKey ? null : helpKey)}>
          <Feather name="help-circle" size={16} color={currentTheme.text} style={styles.helpIcon} />
        </TouchableOpacity>
      </View>
      <TextInput
        style={dynamicStyles.input}
        keyboardType="numeric"
        value={state}
        onChangeText={setter}
        placeholder={t(`${labelKey}_placeholder`)}
        placeholderTextColor={currentTheme.placeHolderColor}
      />
      {selectedHelp === helpKey && <Text style={styles.helpText}>{helpMessages[helpKey]}</Text>}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={dynamicStyles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        <Text style={styles.title}>{t('title')}</Text>
      </View>

      {/* Language and Theme Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.languageContainer}>
          <Text style={dynamicStyles.text}>IT</Text>
          <Switch value={isEnglish} onValueChange={() => {
            const newLang = isEnglish ? 'it' : 'en';
            i18n.changeLanguage(newLang);
            setIsEnglish(!isEnglish);
          }} />
          <Text style={dynamicStyles.text}>EN</Text>

        </View>

        <TouchableOpacity onPress={toggleTheme}>

          {colorScheme === 'dark' ? (
            <Feather
              name='moon'
              size={36}
              color={dynamicStyles.expoIcon.color}
            />
          ) : (
            <Feather
              name='sun'
              size={36}
              color={dynamicStyles.expoIcon.color}
            />
          )}

          <Feather
            name={colorScheme === 'dark' ? 'moon' : 'sun'}
            size={32}
            color={dynamicStyles.expoIcon.color}
          />

        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View style={styles.inputsWrapper}>
        {renderInputField('cv', cv, setCv, 'cv')}
        {renderInputField('kg', kg, setKg, 'kg')}
        {renderInputField('efficienza', efficienza, setEfficienza, 'efficienza')}
        {renderInputField('densitaAria', densitaAria, setDensitaAria, 'densitaAria')}
        {renderInputField('cd', cd, setCd, 'cd')}
        {renderInputField('cr', cr, setCr, 'cr')}
        {renderInputField('areaFrontale', areaFrontale, setAreaFrontale, 'areaFrontale')}

        {/* Traction Picker */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={dynamicStyles.label}>{t('trazione')}</Text>
            <TouchableOpacity onPress={() => setSelectedHelp(selectedHelp === 'trazione' ? null : 'trazione')}>
              <Feather name="help-circle" size={16} color={currentTheme.text} style={styles.helpIcon} />
            </TouchableOpacity>
          </View>
          <Picker
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
          </Picker>
          {selectedHelp === 'trazione' && <Text style={styles.helpText}>{helpMessages.trazione}</Text>}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>

          <TouchableOpacity style={styles.buttonBlue} onPress={handleCalculate}>
            <Text
              style={{
                color: '#ECEDEE',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              {t('calcola')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonWhite} onPress={handleReset}>
            <Text
              style={{
                color: '#004aad',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              {t('reset')}
            </Text>
          </TouchableOpacity>
        </View>

        {result.time0to100 && (
          <Text style={dynamicStyles.resultText}>
            {t('tempo')} {result.time0to100} {t('seconds')}
          </Text>
        )}

        {graphData.length > 0 && (
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
        )}

        {result.time0to100 && (
          <View style={dynamicStyles.additionalOutput}>
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

          <TouchableOpacity
            style={[styles.button, buttonStyle]}
            onPress={() => {
              if (!requiredFieldsFilled) {
                setShowError(true);
                return;
              }
              setShowError(false);
              handleCalculate(); 
            }}
            disabled={!requiredFieldsFilled}
          >
            <Text style={{ color: !requiredFieldsFilled ? '#999' : '#000' }}>{t('calcola')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={() => {
            handleReset();
          }}>
            <Text style={styles.resetButtonText}>{t('reset')}</Text>
          </TouchableOpacity>
        </View>

        {showError && (
          <Text style={styles.errorText}>{t('error_fields')}</Text>
        )}

{/* Results Section */}
{result.time0to100 && (
  <Text style={styles.resultText}>
    {t('tempo')} {result.time0to100} {t('seconds')}
  </Text>
)}

{graphData.length > 0 && (
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
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        propsForDots: {
          r: '0.1',
          strokeWidth: '2',
          stroke: '#000',
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
)}

{result.time0to100 && (
  <View style={styles.additionalOutput}>
    <Text style={styles.outputText}>
      {t('power_kgcv')}: {(kg / cv).toFixed(2)} CV/Kg
    </Text>
    <Text style={styles.outputText}>
      {t('power')}: {(cv / (kg / 1000)).toFixed(2)} CV/t
    </Text>
    <Text style={styles.outputText}>
      {t('acceleration')}:{' '}
      {(27.78 / parseFloat(result.time0to100)).toFixed(2)} m/s²
    </Text>
    <Text style={styles.outputText}>
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
    fontWeight: '300',
    color: '#004aad',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
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
    textAlign: 'center',
    marginVertical: 15,
    color: '#004aad',
  },
  chart: {
    marginVertical: 15,
    borderRadius: 8,
  },
  metricsContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  metricText: {
    fontSize: 16,
    marginVertical: 5,
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
});