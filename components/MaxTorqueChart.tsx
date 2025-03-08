import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface MaxTorqueChartProps {
  coppiaGraphData: { rpm: number; coppia: number }[];
  currentTheme: { background: string; text: string };
  title: string;
  legendTitle: string;
  description: string;
}

const MaxTorqueChart: React.FC<MaxTorqueChartProps> = ({
  coppiaGraphData,
  currentTheme,
  legendTitle,
  description,
  title,
}) => {
  return (
    <View style={[styles.container, { borderBottomColor: currentTheme.text }]}>
      <View style={styles.chartContainer}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          {title}
        </Text>

        <LineChart
          data={{
            labels: coppiaGraphData.map((d) => `${d.rpm}`),
            datasets: [{ data: coppiaGraphData.map((d) => d.coppia) }],
          }}
          width={360}
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
          yLabelsOffset={8}
        />

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
    paddingTop: 30,
    marginRight: 10,
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

export default MaxTorqueChart;
