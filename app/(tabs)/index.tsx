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

  /* -------------------------------- START EXPERIMENTAL FUNCTIONS -------------------------------- */

  const calculateAccelerationTime = (targetSpeed: number) => {
    // 1. Retrieve parameters and set default values
    const powerCV = parseFloat(cv) || 0; // Power in CV (horsepower)
    const mass = parseFloat(kg) || 1500; // Mass of the vehicle (default 1500 kg)
    const eta = Math.min(parseFloat(efficienza), 0.95); // Efficiency, limited to 0.95
    const rho = parseFloat(densitaAria); // Air density (rho)
    const cdValue = parseFloat(cd); // Drag coefficient (cd)
    const crValue = parseFloat(cr); // Rolling resistance coefficient (cr)
    const area = parseFloat(areaFrontale) || 2.2; // Frontal area (default 2.2 m²)

    // 2. Adjust power for high speeds
    const maxPowerW = powerCV * 735.49875 * eta * (1 - 0.00015 * Math.pow(targetSpeed, 1.5));

    // 3. Technical parameters related to the car's performance
    const maxPowerRpm = 6800; // Maximum power RPM
    const redlineRpm = 7800; // Redline RPM (maximum safe RPM)
    const tireRadius = 0.33; // Tire radius in meters
    const gearRatios = [3.4, 2.6, 1.9, 1.4, 1.1, 0.9]; // Gear ratios for different gears
    const finalDriveRatio = 3.2; // Final drive ratio

    let speed = 0; // Current speed in m/s
    let time = 0; // Total time taken for acceleration
    let currentGear = 0; // The current gear
    let currentRpm = 2200; // Initial RPM
    const powerToWeight = powerCV / mass; // Power-to-weight ratio
    const isSupercar = powerToWeight > 0.35 && mass < 1700; // Supercar classification based on power-to-weight
    const isHypercar = powerToWeight > 0.45 && mass < 1500;  // Hypercar classification

    // 4. Aerodynamic drag model
    const getAeroDrag = (speed: number) => {
        // Base aerodynamic drag formula
        const baseDrag = 0.5 * rho * cdValue * area * Math.pow(speed, 2);
        // Apply a high-speed factor for drag increase at higher speeds
        const highSpeedFactor = 1 + Math.pow(speed/35, 1.8);  // Exponent adjusts drag resistance at higher speeds
        return baseDrag * highSpeedFactor;
    };

    // 5. Speed correction for different vehicle types
    const getSpeedCorrection = () => {
      const base = isSupercar ? 0.22 : isHypercar ? 0.18 : 0.6;  // A base correction factor for supercars and hypercars
      const speedFactor = 1 + (targetSpeed/100) * (isSupercar ? 0.13 : isHypercar ? 0.1 : 0.5);  // Adjusts based on speed and vehicle type
      return base * speedFactor;
    };

    // 6. Simulation loop for acceleration calculation
    while (speed < targetSpeed / 3.6 && currentGear < gearRatios.length) {
        const wheelCircumference = 2 * Math.PI * tireRadius; // Calculate tire circumference
        // RPM calculation based on current speed, gear, and final drive
        currentRpm = (speed * 60 * gearRatios[currentGear] * finalDriveRatio) / (wheelCircumference / 1000);
        currentRpm = Math.min(currentRpm, redlineRpm); // Ensure RPM doesn't exceed redline

        const torque = (maxPowerW * 9549) / Math.max(currentRpm, 1500); // Torque calculation
        let wheelForce = (torque * gearRatios[currentGear] * finalDriveRatio) / tireRadius;

        // 7. Traction model based on drivetrain type (FWD, RWD, AWD)
        const maxTraction = {
            FWD: 1.1 * mass * 9.81 * Math.exp(-speed/20),  // Front-Wheel Drive (FWD)
            RWD: 1.3 * mass * 9.81 * Math.exp(-speed/18),  // Rear-Wheel Drive (RWD)
            AWD: 1.5 * mass * 9.81 * Math.exp(-speed/22)   // All-Wheel Drive (AWD)
        }[trazione]; // Select the appropriate traction type (FWD, RWD, AWD)

        wheelForce = Math.min(wheelForce, maxTraction); // Ensure wheel force doesn't exceed traction limit

        // 8. Resistance forces (aerodynamic and rolling resistance)
        const fRoll = crValue * mass * 9.81 * (1 + speed/100); // Rolling resistance force
        const fAero = getAeroDrag(speed); // Aerodynamic drag force

        // 9. Acceleration calculation based on net forces
        const acceleration = (wheelForce - fAero - fRoll) / mass;

        // 10. Adaptive time-step for more precise simulation at lower accelerations
        const dt = Math.max(0.01, 0.03 - acceleration * 0.05);  // Dynamic time-step
        speed += acceleration * dt;  // Update speed
        time += dt;  // Update time

        // 11. Gear shift logic with progressive losses
        if (currentRpm >= redlineRpm - 300 && currentGear < gearRatios.length - 1) {
            time += 0.15 + currentGear * 0.05;  // Time penalty for gear shift
            currentGear++;  // Shift to next gear
            currentRpm = redlineRpm * 0.65; // Adjust RPM after gear shift
        }

        if (acceleration < 0.2) break; // Stop the simulation if acceleration becomes too low
    }

    // 12. Final time correction for vehicle type and performance
    return (time * getSpeedCorrection()).toFixed(2); // Return the final time with correction factor
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

  /* -------------------------------- END EXPERIMENTAL FUNCTIONS -------------------------------- */

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
