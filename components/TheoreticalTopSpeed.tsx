import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

interface TheoreticalTopSpeedProps {
  topSpeedGraphData: { labels: string[]; datasets: { data: number[] }[] };
  currentTheme: {
    placeHolderColor: string | undefined;
    background: string;
    text: string;
  };
  title: string;
  legendTitle: string;
  description: string;
}

const TheoreticalTopSpeed: React.FC<TheoreticalTopSpeedProps> = ({
  topSpeedGraphData,
  currentTheme,
  title,
  legendTitle,
  description,
}) => {
  //need to modify topSpeedGraphData to properly render on chart
  const graphData = [{ value: 0 }];

  topSpeedGraphData.datasets[0].data.forEach((kW, index) => {
    if ((index + 1) % 50 === 0) {
      graphData.push({ value: kW });
    }
  });

  const modifiedData = graphData.map((item, index) => {
    return {
      ...item,
      label: topSpeedGraphData.labels[index],
    };
  });

  return (
    <View style={[styles.container, { borderBottomColor: currentTheme.text }]}>
      <View style={styles.chartContainer}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          {title}
        </Text>
        <View
          style={{
            marginBottom: 20,
            paddingRight: 40,
            marginLeft: -8,
          }}
        >
          <LineChart
            data={modifiedData.map((item) => ({
              value: item.value,
              label: item.label,
              dataPointText: String(Math.floor(item.value)),
            }))}
            width={300}
            height={240}
            xAxisColor={currentTheme.text}
            yAxisColor={currentTheme.text}
            yAxisIndicesColor={currentTheme.text}
            xAxisLabelTextStyle={{ color: currentTheme.text }}
            yAxisLabelContainerStyle={{ color: currentTheme.text }}
            showVerticalLines={true}
            isAnimated
            xAxisIndicesWidth={0}
            adjustToWidth={true}
            initialSpacing={0}
            color1={currentTheme.placeHolderColor}
            dataPointsColor1='#004aad'
            focusEnabled
            stripColor={currentTheme.placeHolderColor}
            focusedDataPointColor='green'
            showStripOnFocus
            showTextOnFocus={true}
            delayBeforeUnFocus={3000}
            textColor={currentTheme.text}
            focusedDataPointHeight={30}
            textFontSize1={15}
            textShiftX={-30}
            disableScroll={true}
            yAxisLabelSuffix=' kW'
            yAxisLabelWidth={55}
            curved
          />
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: 'rgba(0, 74, 173, 1)' },
              ]}
            />
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
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
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

export default TheoreticalTopSpeed;
