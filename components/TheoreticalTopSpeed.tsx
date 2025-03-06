// TheoreticalTopSpeed.tsx
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface TheoreticalTopSpeedProps {
  topSpeedGraphData: { labels: string[]; datasets: { data: number[] }[] };
  currentTheme: { background: string; text: string };
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
  console.log('Graph Data:', { ...topSpeedGraphData });
  return (
    <View style={[styles.container, { borderBottomColor: currentTheme.text }]}>
      <View style={styles.chartContainer}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          {title}
        </Text>

        <LineChart
          data={{
            labels: topSpeedGraphData.labels,
            datasets: topSpeedGraphData.datasets,
          }}
          width={340}
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
              r: 0.4,
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
          xAxisLabel='km/h'
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
