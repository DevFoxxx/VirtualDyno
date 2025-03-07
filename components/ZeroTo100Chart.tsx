import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface TimeTo100GraphProps {
  graphData: { speed: number; time: number }[];
  currentTheme: { background: string; text: string };
  title: string;
  description: string;
  legendTitle: string;
}

const TimeTo100Graph: React.FC<TimeTo100GraphProps> = ({
  graphData,
  currentTheme,
  title,
  description,
  legendTitle,
}) => {
  if (graphData.length === 0) return null;

  return (
    <View style={[styles.container, { borderBottomColor: currentTheme.text }]}>
      <View style={styles.chartContainer}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          {title}
        </Text>

        <LineChart
          data={{
            labels: graphData
              .filter((_, index) => index % 10 === 0)
              .map((d) => `${d.speed}`),
            datasets: [{ data: graphData.map((d) => d.time) }],
          }}
          width={390}
          height={240}
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
          xAxisLabel='km/h'
          yAxisSuffix=' s'
          style={styles.chart}
          fromZero
          bezier
          verticalLabelRotation={60}
          xLabelsOffset={-10}
          yLabelsOffset={4}
        />

        {/* Legend and description */}
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
  centeredText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingBottom: 12,
    marginLeft: -30,
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

export default TimeTo100Graph;
