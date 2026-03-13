import React from 'react';
import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

interface ZeroTo200ChartProps {
  graphData: { speed: number; time: number }[];
  currentTheme: {
    placeHolderColor: string;
    background: string;
    text: string;
  };
  title: string;
  description: string;
  legendTitle: string;
}

const ZeroTo200Chart: React.FC<ZeroTo200ChartProps> = ({
  graphData,
  currentTheme,
  title,
  description,
  legendTitle,
}) => {
  if (graphData.length === 0) return null;

  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 80;

  const maxTime = Math.ceil(Math.max(...graphData.map((d) => d.time)));

  // Sample every 20 km/h for readability on 0-200 range
  const sampledData = graphData
    .filter((_, index) => index % 4 === 0)
    .map((item) => ({
      value: item.time,
      label: String(item.speed),
      dataPointText: item.time.toFixed(1),
    }));

  const dynamicSpacing = Math.floor((chartWidth - 20) / Math.max(sampledData.length - 1, 1));

  return (
    <View style={[styles.container, { borderBottomColor: currentTheme.text }]}>
      <View style={styles.chartContainer}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          {title}
        </Text>

        <View style={{ marginBottom: 30, paddingRight: 40, marginLeft: -8 }}>
          <LineChart
            data={sampledData}
            width={chartWidth}
            height={250}
            xAxisColor={'#004aad'}
            yAxisColor={'#004aad'}
            yAxisIndicesColor={'#004aad'}
            xAxisLabelTextStyle={{ color: '#004aad' }}
            yAxisTextStyle={{ color: '#004aad' }}
            rulesColor={'#5a5d5e'}
            verticalLinesColor={'#5a5d5e'}
            thickness={3}
            dataPointsRadius={4}
            showVerticalLines={true}
            isAnimated
            xAxisIndicesWidth={0}
            adjustToWidth={true}
            initialSpacing={0}
            color1={'#004aad'}
            dataPointsColor1='#004aad'
            focusEnabled
            stripColor={'#004aad'}
            focusedDataPointColor='#004aad'
            showStripOnFocus
            focusedDataPointRadius={8}
            showTextOnFocus={true}
            delayBeforeUnFocus={3000}
            textColor={'#004aad'}
            focusedDataPointHeight={30}
            textFontSize1={12}
            textShiftX={-10}
            textShiftY={-10}
            disableScroll={true}
            yAxisLabelSuffix=' s'
            maxValue={maxTime + 2}
            noOfSections={Math.min(maxTime + 2, 10)}
            spacing={dynamicSpacing}
          />
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#004aad' }]} />
            <Text style={[styles.legendText, { color: currentTheme.text }]}>
              {legendTitle}
            </Text>
          </View>
          <Text style={[styles.descriptionText, { color: currentTheme.text }]}>
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
    borderBottomWidth: 2,
  },
  chartContainer: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  legendContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: -15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
  },
  descriptionText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ZeroTo200Chart;
