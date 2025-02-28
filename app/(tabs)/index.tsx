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
    // Convert input values to numbers
    const powerCV = parseFloat(cv) || 0; // Horsepower in CV (metric horsepower)
    const mass = parseFloat(kg) || 1500; // Vehicle mass (kg), default value is 1500 kg
    const eta = Math.min(parseFloat(efficienza), 0.95); // Efficiency (max value capped at 0.95)
    const rho = parseFloat(densitaAria); // Air density (kg/m^3)
    const cdValue = parseFloat(cd); // Drag coefficient
    const crValue = parseFloat(cr); // Rolling resistance coefficient
    const area = parseFloat(areaFrontale) || 2.2; // Frontal area (m^2), default value is 2.2 m^2

    // Derived technical parameters
    const maxPowerW = powerCV * 735.49875 * eta; // Maximum power in Watts (considering efficiency)
    const maxPowerRpm = 6500; // Max power RPM (revolutions per minute)
    const redlineRpm = 7500; // Redline RPM (engine speed limit)
    const tireRadius = 0.33; // Tire radius (m)
    const gearRatios = [3.1, 2.2, 1.7, 1.3, 1.0, 0.8]; // Gear ratios for the vehicle
    const finalDriveRatio = 3.7; // Final drive ratio of the vehicle
    
    // Simulation variables
    let speed = 0; // Current speed of the vehicle (m/s)
    let time = 0; // Elapsed time (seconds)
    let currentGear = 0; // Current gear
    let currentRpm = 2000; // Initial RPM

    // Determine vehicle type based on power-to-weight ratio
    const powerToWeight = powerCV / mass; 
    const isSupercar = powerToWeight > 0.4 && mass < 1800; // Supercar if power-to-weight ratio > 0.4 and mass < 1800 kg
    const isSportcar = powerToWeight > 0.2 && powerToWeight <= 0.4; // Sportcar if ratio between 0.2 and 0.4

    // Start simulation loop until target speed is reached
    while (speed < targetSpeed / 3.6 && currentGear < gearRatios.length) { // targetSpeed is converted to m/s
        // Calculate RPM based on current speed and gear
        const wheelCircumference = 2 * Math.PI * tireRadius; // Circumference of the tire (m)
        currentRpm = (speed * 60 * gearRatios[currentGear] * finalDriveRatio) / (wheelCircumference / 1000); // RPM formula
        currentRpm = Math.min(currentRpm, redlineRpm); // Limit RPM to redline

        // Calculate torque based on power and RPM
        const torque = (maxPowerW * 9549) / Math.max(currentRpm, 1000); // Torque in Nm (Newton meters)

        // Force applied to the wheels
        let wheelForce = (torque * gearRatios[currentGear] * finalDriveRatio) / tireRadius; // Wheel force in N (Newtons)

        // Calculate resisting forces (aerodynamic and rolling resistance)
        const fRoll = crValue * mass * 9.81; // Rolling resistance force (N)
        const fAero = 0.5 * rho * cdValue * area * speed ** 2; // Aerodynamic drag force (N)

        // Limit traction force based on vehicle type and current speed
        const tractionCoefficient = {
            FWD: 1.2, // Front-wheel drive
            RWD: 1.4, // Rear-wheel drive
            AWD: 1.6  // All-wheel drive
        }[trazione] * (1 - speed / 200); // Decrease traction with higher speed
        
        const maxTraction = tractionCoefficient * mass * 9.81; // Maximum traction force (N)
        wheelForce = Math.min(wheelForce, maxTraction); // Limit wheel force to max traction

        // Calculate acceleration
        const acceleration = (wheelForce - fAero - fRoll) / mass; // Acceleration in m/s^2

        // Time step for the simulation
        const dt = 0.01; // Time step (seconds)
        speed += acceleration * dt; // Update speed
        time += dt; // Update elapsed time

        // Gear shift logic
        if (currentRpm >= redlineRpm - 500 && currentGear < gearRatios.length - 1) {
            time += isSupercar ? 0.15 : isSportcar ? 0.25 : 0.35; // Time for shifting gears based on car type
            currentGear++; // Shift to the next gear
            currentRpm = maxPowerRpm * 0.7; // Set RPM after shifting gear
        }

        // Stop simulation if acceleration is very low (near zero)
        if (acceleration < 0.1) break;
    }

    // Final correction based on the vehicle type (Supercar, Sportcar, or regular)
    const correction = isSupercar ? 0.85 : isSportcar ? 0.92 : 1.0;
    return (time * correction).toFixed(2); // Return time with correction factor (seconds, 2 decimal places)
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
