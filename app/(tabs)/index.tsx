import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  Button,
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
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';

export default function HomeScreen() {
  // shared value for animation
  const rotation = useSharedValue(0);

  // language translation hook
  const { t, i18n } = useTranslation();

  // state variables for user input and results
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

  const { colorScheme, toggleTheme } = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  // Toggle the system theme
  const handleThemeToggle = (value: boolean) => {
    toggleTheme();
  };

  //need dynamic styles instead of static as the theme changes due to users preference (dark/light mode)
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
    icon: {
      tintColor: currentTheme.icon,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.text,
    } as TextStyle,
    languageText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.text,
    } as TextStyle,

    input: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      marginBottom: 10,
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

  return (
    <ScrollView contentContainerStyle={dynamicStyles.container}>
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
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 30,
        }}
      >
        {/*Language selector, current language text is not displayed  */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[dynamicStyles.languageText]}>{isEnglish && 'IT'}</Text>
          <Switch value={isEnglish} onValueChange={handleLanguageToggle} />
          <Text style={[dynamicStyles.languageText]}>{!isEnglish && 'EN'}</Text>
        </View>

        {/* Day/night mode switch using expo icon //////////////////////////////*/}
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
        </TouchableOpacity>
      </View>
      {/* ///////////////////////////////////////////////// */}
      <View style={styles.inputContainer}>
        <Text style={dynamicStyles.label}>{t('cv')}</Text>
        <TextInput
          style={dynamicStyles.input}
          keyboardType='numeric'
          value={cv}
          onChangeText={setCv}
          placeholder={t('cv_placeholder')}
          placeholderTextColor={currentTheme.placeHolderColor}
        />

        <Text style={dynamicStyles.label}>{t('kg')}</Text>
        <TextInput
          style={dynamicStyles.input}
          keyboardType='numeric'
          value={kg}
          onChangeText={setKg}
          placeholder={t('kg_placeholder')}
          placeholderTextColor={currentTheme.placeHolderColor}
        />

        <Text style={dynamicStyles.label}>{t('efficienza')}</Text>
        <TextInput
          style={dynamicStyles.input}
          keyboardType='numeric'
          value={efficienza}
          onChangeText={setEfficienza}
          placeholder={t('efficienza_placeholder')}
          placeholderTextColor={currentTheme.placeHolderColor}
        />

        <Text style={dynamicStyles.label}>{t('densitaAria')}</Text>
        <TextInput
          style={dynamicStyles.input}
          keyboardType='numeric'
          value={densitaAria}
          onChangeText={setDensitaAria}
          placeholder={t('densitaAria_placeholder')}
          placeholderTextColor={currentTheme.placeHolderColor}
        />

        <Text style={dynamicStyles.label}>{t('cd')}</Text>
        <TextInput
          style={dynamicStyles.input}
          keyboardType='numeric'
          value={cd}
          onChangeText={setCd}
          placeholder={t('cd_placeholder')}
          placeholderTextColor={currentTheme.placeHolderColor}
        />

        <Text style={dynamicStyles.label}>{t('cr')}</Text>
        <TextInput
          style={dynamicStyles.input}
          keyboardType='numeric'
          value={cr}
          onChangeText={setCr}
          placeholder={t('cr_placeholder')}
          placeholderTextColor={currentTheme.placeHolderColor}
        />

        <Text style={dynamicStyles.label}>{t('areaFrontale')}</Text>
        <TextInput
          style={dynamicStyles.input}
          keyboardType='numeric'
          value={areaFrontale}
          onChangeText={setAreaFrontale}
          placeholder={t('areaFrontale_placeholder')}
          placeholderTextColor={currentTheme.placeHolderColor}
        />

        <Text style={dynamicStyles.label}>{t('trazione')}</Text>
        <Picker
          selectedValue={trazione}
          onValueChange={(itemValue) => setTrazione(itemValue)}
        >
          <Picker.Item
            label={t('fwd')}
            value='FWD'
            color={dynamicStyles.text.color as string}
          />
          <Picker.Item
            label={t('rwd')}
            value='RWD'
            color={dynamicStyles.text.color as string}
          />
          <Picker.Item
            label={t('awd')}
            value='AWD'
            color={dynamicStyles.text.color as string}
          />
        </Picker>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.buttonWhite}
            onPress={handleCalculate}
          >
            <Text>{t('calcola')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonBlue} onPress={handleReset}>
            <Text style={{ color: 'white', textAlign: 'center' }}>
              {t('reset')}
            </Text>
          </TouchableOpacity>
        </View>

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
                backgroundColor: currentTheme.background,
                backgroundGradientFrom: currentTheme.background,
                backgroundGradientTo: currentTheme.background,
                decimalPlaces: 2,
                color: (opacity = 1) =>
                  `rgba(${currentTheme.textRGB}, ${opacity})`,
                labelColor: (opacity = 1) =>
                  `rgba(${currentTheme.textRGB}, ${opacity})`,
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '90%',
    marginTop: 0,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonWhite: {
    backgroundColor: 'white',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    flex: 0.45,
    alignItems: 'center',
  },
  buttonBlue: {
    backgroundColor: '#004aad',
    padding: 10,
    flex: 0.45,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    marginTop: 20,
  },
  chart: {
    marginVertical: 10,
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
  Text: {
    fontSize: 25,
    marginTop: 30,
    fontWeight: 'light',
    fontStyle: 'italic',
    color: '#004aad',
    borderColor: 'black',
  },
  languageSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  languageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginTop: 30,
    marginRight: 5,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});
