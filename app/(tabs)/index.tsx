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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Animated from "react-native-reanimated";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LineChart } from "react-native-chart-kit";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const [showError, setShowError] = useState(false);
  const [selectedHelp, setSelectedHelp] = useState<string | null>(null);

  // State variables
  const [cv, setCv] = useState("");
  const [kg, setKg] = useState("");
  const [efficienza, setEfficienza] = useState("0.85");
  const [densitaAria, setDensitaAria] = useState("1.225");
  const [cd, setCd] = useState("0.30");
  const [cr, setCr] = useState("0.015");
  const [areaFrontale, setAreaFrontale] = useState("");
  const [trazione, setTrazione] = useState("FWD");
  const [result, setResult] = useState({
    time0to100: "",
    time0to200: "",
    topSpeed: "",
  });
  const [graphData, setGraphData] = useState([]);
  const [isEnglish, setIsEnglish] = useState(i18n.language === "en");

  const requiredFieldsFilled = cv && kg && areaFrontale;
  const buttonStyle = requiredFieldsFilled
    ? styles.buttonWhite
    : styles.buttonDisabled;

  const { colorScheme, toggleTheme } = useColorScheme();
  const currentTheme = colorScheme === "dark" ? Colors.dark : Colors.light;

  // Help messages translations
  const helpMessages = {
    cv: t("help_cv"),
    kg: t("help_kg"),
    efficienza: t("help_efficienza"),
    densitaAria: t("help_densitaAria"),
    cd: t("help_cd"),
    cr: t("help_cr"),
    areaFrontale: t("help_areaFrontale"),
    trazione: t("help_trazione"),
  };

  const dynamicStyles = {
    container: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: currentTheme.background,
    } as ViewStyle,
    text: {
      color: currentTheme.text,
    } as TextStyle,
    label: {
      fontSize: 16,
      fontWeight: "bold",
      color: currentTheme.text,
    } as TextStyle,
    input: {
      height: 40,
      borderColor: "#ccc",
      borderWidth: 1,
      marginBottom: 10,
      paddingLeft: 10,
      color: currentTheme.text,
    },
    expoIcon: {
      color: currentTheme.tabIconSelected,
    },
  };

  // function to toggle language
  const handleLanguageToggle = () => {
    const newLang = isEnglish ? "it" : "en";
    i18n.changeLanguage(newLang);
    setIsEnglish(!isEnglish);
  };

  const calculateAccelerationTime = (targetSpeed: number) => {
    const powerCV = parseFloat(cv) || 0;
    const mass = parseFloat(kg) || 1500;
    const eta = Math.min(parseFloat(efficienza), 0.95);
    const rho = parseFloat(densitaAria);
    const cdValue = parseFloat(cd);
    const crValue = parseFloat(cr);
    const area = parseFloat(areaFrontale) || 2.2;

    // 1. Aggiustamento potenza per alte velocità
    const maxPowerW = powerCV * 735.49875 * eta * (1 - 0.00015 * Math.pow(targetSpeed, 1.5));

    // 2. Parametri tecnici aggiornati
    const maxPowerRpm = 6800;
    const redlineRpm = 7800;
    const tireRadius = 0.33;
    const gearRatios = [3.4, 2.6, 1.9, 1.4, 1.1, 0.9]; // Rapporti più lunghi per alte velocità
    const finalDriveRatio = 3.2;

    let speed = 0;
    let time = 0;
    let currentGear = 0;
    let currentRpm = 2200;
    const powerToWeight = powerCV / mass;
    const isSupercar = powerToWeight > 0.35 && mass < 1700;
    const isHypercar = powerToWeight > 0.45 && mass < 1500;  // Nuova categoria hypercar

    // 3. Modello aerodinamico avanzato
    const getAeroDrag = (speed: number) => {
        const baseDrag = 0.5 * rho * cdValue * area * Math.pow(speed, 2);
        const highSpeedFactor = 1 + Math.pow(speed/35, 1.8);  // Cambia esponente per minor resistenza
        return baseDrag * highSpeedFactor;
    };

    // 4. Sistema di correzione differenziata
    const getSpeedCorrection = () => {
      const base = isSupercar ? 0.22 : isHypercar ? 0.18 : 0.6;  // Correzione per hypercar ancora minore
      const speedFactor = 1 + (targetSpeed/100) * (isSupercar ? 0.13 : isHypercar ? 0.1 : 0.5);  // Aggiusta anche per hypercar
      return base * speedFactor;
    };

    // Simulazione aggiornata
    while (speed < targetSpeed / 3.6 && currentGear < gearRatios.length) {
        const wheelCircumference = 2 * Math.PI * tireRadius;
        currentRpm = (speed * 60 * gearRatios[currentGear] * finalDriveRatio) / (wheelCircumference / 1000);
        currentRpm = Math.min(currentRpm, redlineRpm);

        const torque = (maxPowerW * 9549) / Math.max(currentRpm, 1500);
        let wheelForce = (torque * gearRatios[currentGear] * finalDriveRatio) / tireRadius;

        // 5. Modello di trazione realistico (adattato per auto normali)
        const maxTraction = {
            FWD: 1.1 * mass * 9.81 * Math.exp(-speed/20),  // Migliorato il fattore di velocità
            RWD: 1.3 * mass * 9.81 * Math.exp(-speed/18),
            AWD: 1.5 * mass * 9.81 * Math.exp(-speed/22)
        }[trazione];

        wheelForce = Math.min(wheelForce, maxTraction);

        // 6. Forze resistenti potenziate (più elevate per auto normali)
        const fRoll = crValue * mass * 9.81 * (1 + speed/100);
        const fAero = getAeroDrag(speed);

        const acceleration = (wheelForce - fAero - fRoll) / mass;

        // 7. Time-step adattivo con maggiore precisione per accelerazioni basse
        const dt = Math.max(0.01, 0.03 - acceleration * 0.05);  // Ridurre il passo del tempo per accelerazioni basse
        speed += acceleration * dt;
        time += dt;

        // 8. Cambio marcia con perdite progressive
        if (currentRpm >= redlineRpm - 300 && currentGear < gearRatios.length - 1) {
            time += 0.15 + currentGear * 0.05;  // Minor penalità per il cambio marcia
            currentGear++;
            currentRpm = redlineRpm * 0.65;
        }

        if (acceleration < 0.2) break;
    }

    // 9. Correzione finale rinforzata
    return (time * getSpeedCorrection()).toFixed(2);
  };

  const calculateTopSpeed = () => {
    const powerW = parseFloat(cv) * 735.5; // Convert horsepower (CV) to watts
    const eta = parseFloat(efficienza); // Efficiency factor
    const mass = parseFloat(kg); // Vehicle mass in kg
    const rho = parseFloat(densitaAria); // Air density in kg/m³
    const cdValue = parseFloat(cd); // Drag coefficient
    const crValue = parseFloat(cr); // Rolling resistance coefficient
    const area = parseFloat(areaFrontale); // Frontal area in m²
  
    const powerAvailable = powerW * eta; // Effective power considering efficiency
    let vMin = 50; // Minimum speed (180 km/h)
    let vMax = 500; // Maximum speed to prevent infinite loops
    let vMid;
  
    while (vMax - vMin > 0.1) {
      vMid = (vMin + vMax) / 2;
      const powerRequired =
        0.5 * rho * cdValue * area * Math.pow(vMid / 3.6, 3) + crValue * mass * 9.81 * (vMid / 3.6);
  
      if (powerRequired < powerAvailable) {
        vMin = vMid;
      } else {
        vMax = vMid;
      }
    }
  
    // return Math.min(vMid, parseFloat(limitatore) || vMid).toFixed(2); // Consider electronic speed limiter
    return vMid.toFixed(2);
  };  

  // function to trigger calculation and update state
  const handleCalculate = () => {
    if (!requiredFieldsFilled) {
      setShowError(true);
      return;
    }
    setShowError(false);
    const time0to100 = calculateAccelerationTime(100);
    const time0to200 = calculateAccelerationTime(200);

    const data = [];
    for (let speed = 0; speed <= 200; speed += 1) {
      const time = calculateAccelerationTime(speed);
      if (!isNaN(time)) {
        data.push({ speed, time: parseFloat(time) });
      }
    }

    if (data[0].speed !== 0) {
      data.unshift({ speed: 0, time: 0 });
    }

    setResult((prev) => ({ ...prev, time0to100, time0to200 }));
    setGraphData(data);
    const topSpeed = calculateTopSpeed();
    setResult((prev) => ({ ...prev, topSpeed }));
  };

  // function to reset all inputs and results
  const handleReset = () => {
    setCv("");
    setKg("");
    setEfficienza("0.85");
    setDensitaAria("1.225");
    setCd("0.30");
    setCr("0.015");
    setAreaFrontale("");
    setResult({ time0to100: "" });
    setGraphData([]);
  };

  // calculation of specific power and other metrics
  const powerW = parseFloat(cv) * 735.5;

  // Render input field with help icon
  const renderInputField = (
    labelKey: string,
    state: string,
    setter: any,
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
            name="help-circle"
            size={16}
            color={currentTheme.text}
            style={styles.helpIcon}
          />
        </TouchableOpacity>
        <Text style={dynamicStyles.label}> {t(labelKey)}</Text>
      </View>
      <TextInput
        style={dynamicStyles.input}
        keyboardType="numeric"
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

  return (
    <ScrollView contentContainerStyle={dynamicStyles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>{t("title")}</Text>
      </View>

      {/* Language and Theme Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.languageContainer}>
          <Text style={dynamicStyles.text}>IT</Text>
          <Switch
            value={isEnglish}
            onValueChange={() => {
              const newLang = isEnglish ? "it" : "en";
              i18n.changeLanguage(newLang);
              setIsEnglish(!isEnglish);
            }}
          />
          <Text style={dynamicStyles.text}>EN</Text>
        </View>

        <TouchableOpacity onPress={toggleTheme}>
          <Feather
            name={colorScheme === "dark" ? "moon" : "sun"}
            size={32}
            color={dynamicStyles.expoIcon.color}
          />
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View style={styles.inputsWrapper}>
        {renderInputField("cv", cv, setCv, "cv")}
        {renderInputField("kg", kg, setKg, "kg")}
        {renderInputField(
          "efficienza",
          efficienza,
          setEfficienza,
          "efficienza"
        )}
        {renderInputField(
          "densitaAria",
          densitaAria,
          setDensitaAria,
          "densitaAria"
        )}
        {renderInputField("cd", cd, setCd, "cd")}
        {renderInputField("cr", cr, setCr, "cr")}
        {renderInputField(
          "areaFrontale",
          areaFrontale,
          setAreaFrontale,
          "areaFrontale"
        )}

        {/* Traction Picker */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <TouchableOpacity
              onPress={() =>
                setSelectedHelp(selectedHelp === "trazione" ? null : "trazione")
              }
            >
              <Feather
                name="help-circle"
                size={16}
                color={currentTheme.text}
                style={styles.helpIcon}
              />
            </TouchableOpacity>
            <Text style={dynamicStyles.label}> {t("trazione")}</Text>
          </View>
          <Picker
            selectedValue={trazione}
            onValueChange={setTrazione}
            dropdownIconColor={currentTheme.text}
          >
            {["FWD", "RWD", "AWD"].map((type) => (
              <Picker.Item
                key={type}
                label={t(type.toLowerCase())}
                value={type}
                color={dynamicStyles.text.color as string}
              />
            ))}
          </Picker>
          {selectedHelp === "trazione" && (
            <Text style={styles.helpText}>{helpMessages.trazione}</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
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
            <Text style={{ color: !requiredFieldsFilled ? "#999" : "#000" }}>
              {t("calcola")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={() => {
              handleReset();
            }}
          >
            <Text style={styles.resetButtonText}>{t("reset")}</Text>
          </TouchableOpacity>
        </View>

        {showError && <Text style={styles.errorText}>{t("error_fields")}</Text>}

        {/* Results Section */}
        {result.time0to100 && (
          <Text style={styles.resultText}>
            {t("tempo")} {result.time0to100} {t("s")}
          </Text>
        )}
        {result.time0to200 && (
          <Text style={styles.resultText}>
            {t("0-200 km/h")}: {result.time0to200} s
          </Text>
        )}
        {result.topSpeed && (
          <Text style={styles.resultText}>
            {t("Velocità massima")}: {result.topSpeed} km/h
          </Text>
        )}

        {graphData.length > 0 && (
          <View>
            <LineChart
              data={{
                labels: graphData
                  .filter((d, index) => index % 20 === 0)
                  .map((d) => `${d.speed}`),
                datasets: [{ data: graphData.map((d) => d.time) }],
              }}
              width={320}
              height={240}
              yAxisSuffix=" s"
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: {
                  r: "0.1",
                  strokeWidth: "2",
                  stroke: "#000",
                },
                style: {
                  paddingTop: "5%",
                  paddingBottom: "5%",
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
              {t("power_kgcv")}: {(kg / cv).toFixed(2)} CV/Kg
            </Text>
            <Text style={styles.outputText}>
              {t("power")}: {(cv / (kg / 1000)).toFixed(2)} CV/t
            </Text>
            <Text style={styles.outputText}>
              {t("acceleration")}:{" "}
              {(27.78 / parseFloat(result.time0to100)).toFixed(2)} m/s²
            </Text>
            <Text style={styles.outputText}>
              {t("distance")}:{" "}
              {(
                0.5 *
                (27.78 / parseFloat(result.time0to100)) *
                Math.pow(parseFloat(result.time0to100), 2)
              ).toFixed(2)}{" "}
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
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "300",
    color: "#004aad",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  languageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputsWrapper: {
    width: "90%",
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  helpIcon: {
    marginLeft: 5,
  },
  helpText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginVertical: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonWhite: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonDisabled: {
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  resetButton: {
    backgroundColor: "#004aad",
  },
  resetButtonText: {
    color: "white",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: -10,
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    textAlign: "left",
    marginVertical: 5,
  },
  chart: {
    marginVertical: 15,
    borderRadius: 8,
  },
  metricsContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f8f8f8",
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
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
  },
  outputText: {
    fontSize: 16,
    marginBottom: 5,
  },
});
