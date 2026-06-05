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
  <a href="../README.md" style="padding: 10px; background-color: #2B7FFF; border-radius: 10px; color: white">🇺🇸 English</a>
  |
  <a href="/documentation/README_IT.md" style="padding: 10px; background-color: #5EA529; border-radius: 10px; color: white">🇮🇹 Italian</a>
</div>

> Un simulador de rendimiento vehicular basado en física para móvil. Sin dinamómetro requerido.

---
<center><h1>¿Qué es VirtualDyno?</h1></center>

**VirtualDyno** es una aplicación móvil de código abierto que simula el rendimiento de un vehículo a partir de un conjunto de parámetros físicos — potencia, peso, aerodinámica, tipo de motor, modo de aspiración, tipo de tracción, terreno y clima. Proporciona tiempos de 0–100 km/h y 0–200 km/h, velocidad máxima teórica, una curva de torque y un análisis de distribución de potencia por rangos de velocidad — todo sin necesidad de acceso a un dinamómetro físico.

El modelo físico está calibrado empíricamente con datos de múltiples fuentes confiables sobre una amplia gama de vehículos, desde utilitarios cotidianos hasta superdeportivos de alto rendimiento. Las fórmulas están documentadas en el código fuente y están diseñadas para mantenerse interpretables sin sacrificar precisión.

## Características

- Tiempo **0–100 km/h (0–62 mph)** con gráfica animada de velocidad-tiempo
- Tiempo **0–200 km/h (0–124 mph)** con interpolación de curva monótona — sin artefactos de caída
- **Velocidad máxima teórica** mediante búsqueda binaria con factor de pérdida de transmisión calibrado
- **Curva de torque** a lo largo de todo el rango de RPM, con modelos específicos por tipo de motor
- **Gráfica de distribución de potencia** — potencia sobrante vs. potencia requerida por rangos de velocidad
- **Tipos de motor** — Gasolina, Diésel, Eléctrico con valores físicos predeterminados y curvas de torque dedicadas
- **Modos de aspiración** — Natural, Turbo (con modelo de retraso), Compresor, Biturbo
- **Simulación de terreno y clima** — asfalto, mojado, nieve, lodo, arena; temperatura, viento de frente, lluvia — panel colapsable con selector de terreno basado en imágenes e insignia de estado activo
- **Tipo de tracción** — FWD, RWD, AWD con penalizaciones de agarre calibradas
- **Acordeón de parámetros avanzados** — eficiencia, densidad del aire, Cd, Cr, área frontal
- **Alternancia Métrico / Imperial** — conversión completa en todas las entradas, salidas y ejes de gráficas
- **Cambio de idioma Inglés / Italiano**
- **Tema Claro / Oscuro**
- **Retroalimentación háptica** — vibraciones de selección, impacto y error en todos los elementos interactivos
- **Garaje** — guardar, explorar, editar y eliminar configuraciones de vehículos con reproducción completa de gráficas
- **Compartir e Importar** — tres modos de compartir (Social, Código, JSON) y dos métodos de importación (pegar código, selector de archivos)

## Modelo físico

| Resultado | Método |
|-----------|--------|
| Tiempo 0–100 | Empírico: `t = v/a` a v = 100 km/h, fuerza neta de `P·η/v − F_aero − F_roll` |
| Tiempo 0–200 | Escalador calibrado: `t200 = t100 × clamp(1.9516 + 0.2082/(cv/kg), 2.1, 3.8)` |
| Gráfica 0–200 | Interpolación sqrt monótona anclada en los valores exactos de t100 / t200 |
| Velocidad máxima | Búsqueda binaria sobre `F_motor − F_arrastre − F_rodadura = 0` |
| Torque (MCI) | Subida exponencial + decaimiento gaussiano, RPM de pico escalado por clase de potencia |
| Torque (EV) | 3 fases: pico plano → caída lineal → debilitamiento de campo |
| Penalización diésel | ×1.06 en 0–100, ×1.09 en 0–200 |
| Retraso turbo | Umbral de presión 2200 RPM (biturbo: 2800), torque previo al boost al 28% / 22% del pico |
| Aspiración | Multiplicadores por modo sobre t100 / t200 y pico de torque |
| Tracción | Penalización de tiempo calibrada por tipo de tracción |
| Terreno / clima | Post-multiplicador: factor de agarre, corrección de temperatura/densidad, viento de frente, lluvia |

## Tecnologías

| Librería | Propósito |
|----------|-----------|
| React Native + Expo | Framework móvil |
| TypeScript | Tipado seguro |
| react-i18next | Internacionalización (EN / IT) |
| react-native-gifted-charts | Gráficas de líneas y barras |
| @react-native-community/slider | Controles deslizantes de terreno y clima |
| react-native-reanimated | Animaciones |
| expo-haptics | Retroalimentación háptica |
| @react-native-async-storage/async-storage | Persistencia local del garaje |
| expo-sharing | Exportación de archivos JSON |
| expo-file-system | Lectura/escritura de archivos para importar/exportar |
| expo-clipboard | Copiar código de compartir al portapapeles |
| expo-document-picker | Selector de archivos JSON para importación |

## Instalación

```sh
git clone https://github.com/DevFoxxx/VirtualDyno.git
cd VirtualDyno
npm install
npx expo install @react-native-community/slider
npx expo install @react-native-async-storage/async-storage
npx expo install expo-sharing expo-file-system expo-clipboard expo-document-picker
npx expo start
```

Escanea el código QR con Expo Go en Android o iOS, o presiona `a` para un emulador de Android.

## Garaje y compartir

### Garaje

El Garaje almacena configuraciones de vehículos localmente usando AsyncStorage. Cada configuración captura la entrada completa, las condiciones climáticas y los resultados. Las configuraciones guardadas se pueden explorar desde la pantalla principal mediante el botón **Garaje** en el encabezado.

- Toca una tarjeta para abrir su vista de detalle completo con todas las gráficas reproducidas desde los datos guardados
- Ícono de edición (✏️) — renombrar título, fabricante o modelo; aparece una etiqueta gris *editado* tras cualquier actualización
- Ícono de papelera (🗑) — eliminar con alerta de confirmación
- FAB (⬇) — abre el modal de importación

### Compartir e Importar

Desde la pantalla de detalle de cualquier configuración, toca el **ícono de compartir** (↗) para abrir una hoja inferior con tres opciones:

| Opción | Qué hace |
|--------|----------|
| **Compartir Social** | Texto formateado con resultados clave + código de importación — compartir vía WhatsApp, Telegram, etc. |
| **Código para Compartir** | Genera un código `VD-XXXXXX-…`, lo copia al portapapeles y abre la hoja de compartir del sistema |
| **Exportar JSON** | Crea un archivo `.json` ligero (~2 KB, solo entradas) y lo comparte mediante la hoja del sistema |

Para importar una configuración, toca el **FAB (⬇)** en la pantalla del Garaje:

| Pestaña | Cómo usarla |
|---------|-------------|
| **Ingresar Código** | Pega el código completo `VD-XXXXXX-…` recibido de otro usuario |
| **Abrir Archivo** | Selecciona un archivo `.json` exportado desde VirtualDyno |

> Las configuraciones importadas almacenan únicamente los parámetros de entrada. Las gráficas se recalculan en el dispositivo al momento de la importación — no se conservan datos de gráficas desactualizados.

## Sistema de unidades

Todos los cálculos internos usan el sistema métrico. Cuando el selector **IMP** está activo, las conversiones se aplican al momento de mostrar en cada entrada, salida y eje de gráfica:

| Métrico | Imperial |
|---------|----------|
| km/h | mph |
| kg | lbs |
| kW | hp |
| Nm | lb·ft |
| m² | ft² |
| kg/m³ | lb/ft³ |
| °C | °F |

## Contribuir

Las solicitudes de cambios son bienvenidas. Las áreas más abiertas a contribución son:

1. **Mejoras físicas** — integración numérica basada en curva de torque para tiempos intermedios más precisos
2. **UI / UX** — pulido de diseño, alineación de etiquetas en gráficas (ver problemas abiertos)
3. **Nuevos perfiles de vehículos** — configuraciones predeterminadas para autos comunes
4. **Traducciones** — idiomas adicionales más allá de EN / IT
5. **Corrección de errores** — revisa la pestaña de [Issues](https://github.com/DevFoxxx/VirtualDyno/issues)

Por favor abre un issue antes de comenzar trabajo significativo para poder coordinar.

## Licencia

El código fuente está disponible para revisión y contribuciones.  
El uso comercial, la redistribución y los trabajos derivados no están permitidos  
sin el permiso explícito por escrito del autor. Consulta [LICENSE](https://github.com/DevFoxxx/VirtualDyno/blob/main/LICENSE).