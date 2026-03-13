import React from 'react';
import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

export interface PowerBand {
  label: string;
  available: number;
  required: number;
  surplus: number;
}

interface PowerDistributionChartProps {
  bands: PowerBand[];
  currentTheme: {
    background: string;
    text: string;
  };
  title: string;
  description: string;
}

const PowerDistributionChart: React.FC<PowerDistributionChartProps> = ({
  bands,
  currentTheme,
  title,
  description,
}) => {
  if (bands.length === 0) return null;

  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 80;

  // Bar geometry constants — must match exactly so custom labels align
  const BAR_WIDTH    = 20;
  const GAP_INNER    = 4;  // between blue and orange within a group
  const GAP_BETWEEN  = 20; // between groups
  const INITIAL_SPACING = 10;
  const Y_AXIS_WIDTH = 58; // matches yAxisLabelWidth below

  // Bar data WITHOUT label text — labels drawn manually for readability
  const barData = bands.flatMap((band, i) => [
    {
      value: Math.max(band.surplus, 0),
      frontColor: '#004aad',
      barWidth: BAR_WIDTH,
      spacing: GAP_INNER,
    },
    {
      value: band.required,
      frontColor: '#e05c00',
      barWidth: BAR_WIDTH,
      spacing: i < bands.length - 1 ? GAP_BETWEEN : 2,
    },
  ]);

  const maxVal = Math.ceil(
    Math.max(...bands.map((b) => Math.max(b.available, b.required))) + 10
  );

  // Width each group occupies on screen
  const groupWidth = BAR_WIDTH + GAP_INNER + BAR_WIDTH;

  return (
    <View style={[styles.container, { borderBottomColor: currentTheme.text }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>{title}</Text>

      <View style={{ width: '100%', paddingHorizontal: 10 }}>
        <BarChart
          data={barData}
          width={chartWidth}
          height={200}
          barWidth={BAR_WIDTH}
          noOfSections={5}
          maxValue={maxVal}
          xAxisColor={'#004aad'}
          yAxisColor={'#004aad'}
          yAxisTextStyle={{ color: currentTheme.text, fontSize: 10 }}
          rulesColor={'#5a5d5e'}
          yAxisLabelSuffix=' kW'
          yAxisLabelWidth={Y_AXIS_WIDTH}
          isAnimated
          animationDuration={600}
          disableScroll={true}
          initialSpacing={INITIAL_SPACING}
          xAxisLabelTextStyle={{ color: 'transparent', fontSize: 1 }}
        />

        {/* Custom X-axis labels centred under each group */}
        <View
          style={{
            flexDirection: 'row',
            paddingLeft: Y_AXIS_WIDTH + INITIAL_SPACING - 2,
            marginTop: -4,
            marginBottom: 10,
          }}
        >
          {bands.map((band, i) => (
            <View
              key={band.label}
              style={{
                width: groupWidth + (i < bands.length - 1 ? GAP_BETWEEN : 2),
                alignItems: 'center',
              }}
            >
              <Text style={[styles.xLabelText, { color: currentTheme.text }]}>
                {band.label}
              </Text>
              <Text style={[styles.xLabelUnit, { color: currentTheme.text }]}>
                km/h
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#004aad' }]} />
          <Text style={[styles.legendText, { color: currentTheme.text }]}>
            Surplus (accel.)
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#e05c00' }]} />
          <Text style={[styles.legendText, { color: currentTheme.text }]}>
            Required (drag)
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: currentTheme.text }]}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    marginTop: 10,
    borderBottomWidth: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  xLabelText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  xLabelUnit: {
    fontSize: 9,
    textAlign: 'center',
    opacity: 0.6,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default PowerDistributionChart;
