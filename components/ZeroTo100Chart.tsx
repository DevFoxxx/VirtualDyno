import React from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
// import { LineChart } from 'react-native-chart-kit';
import { LineChart } from 'react-native-gifted-charts';

interface TimeTo100GraphProps {
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

const TimeTo100Graph: React.FC<TimeTo100GraphProps> = ({
  graphData,
  currentTheme,
  title,
  description,
  legendTitle,
}) => {
  if (graphData.length === 0) return null;
  const maxTime = Math.ceil(Math.max(...graphData.map((d) => d.time)));
  // console.log(graphData);

  return (
    <View style={[styles.container, { borderBottomColor: currentTheme.text }]}>
      <View style={styles.chartContainer}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          {title}
        </Text>

        <View
          style={{
            marginBottom: 30,
            paddingRight: 40,
            marginLeft: -8,
          }}
        >
          <LineChart
            data={graphData
              .filter((_, index) => index % 10 === 0)
              .map((item) => ({
                value: item.time, // y-axis value (time)
                label: String(item.speed),
                dataPointText: String(item.time),
              }))}
            width={320}
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
            maxValue={maxTime + 1}
            noOfSections={maxTime + 1}
            spacing={30}
          />
        </View>
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
