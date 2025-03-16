import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { CurveType, LineChart } from 'react-native-gifted-charts';
interface MaxTorqueChartProps {
  coppiaGraphData: { rpm: number; coppia: number }[];
  currentTheme: {
    placeHolderColor: string | undefined;
    background: string;
    text: string;
  };
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
  const getMaxCoppiaIndex = (data: { rpm: number; coppia: number }[]) => {
    return data.reduce(
      (maxIndex, entry, index, arr) =>
        entry.coppia > arr[maxIndex].coppia ? index : maxIndex,
      0
    );
  };

  let peakCoppiaIndex = getMaxCoppiaIndex(coppiaGraphData);

  return (
    <View style={[styles.container, { borderBottomColor: currentTheme.text }]}>
      <View style={styles.chartContainer}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          {title}
        </Text>
        <View
          style={{
            marginBottom: 20,
            paddingRight: 60,
            marginLeft: -20,
            borderWidth: 1,
          }}
        >
          <LineChart
            data={coppiaGraphData.map((item) => ({
              value: item.coppia,
              label: String(item.rpm),
              dataPointText: String(Math.floor(item.coppia)),
            }))}
            //Max Torque///////////////////////////////////
            data2={coppiaGraphData.map((item) => ({
              value: item.coppia,
              label: String(item.rpm),
              dataPointText: String(Math.floor(item.coppia)),
            }))}
            startIndex2={peakCoppiaIndex}
            endIndex2={peakCoppiaIndex}
            dataPointsColor2='#09ff00'
            zIndex2={100}
            //Declining Torque//////////////////////////////
            data3={coppiaGraphData.map((item) => ({
              value: item.coppia,
              label: String(item.rpm),
              dataPointText: String(Math.floor(item.coppia)),
            }))}
            startIndex3={peakCoppiaIndex}
            endIndex3={coppiaGraphData.length - 1}
            color3={'#ff8080'}
            dataPointsColor3='#004aad'
            /////////////////////////////////////////////////
            width={320}
            height={240}
            xAxisColor={'#004aad'}
            yAxisColor={'#004aad'}
            yAxisIndicesColor={'#004aad'}
            xAxisLabelTextStyle={{
              color: '#004aad',
              fontSize: 12,
              width: 40,
            }}
            yAxisTextStyle={{ color: '#004aad' }}
            rulesColor={'#5a5d5e'}
            verticalLinesColor={'#5a5d5e'}
            thickness={3}
            dataPointsRadius={4}
            showVerticalLines={true}
            isAnimated
            adjustToWidth={true}
            color1={'#004aad'}
            dataPointsColor1='#004aad'
            focusEnabled
            stripColor={'#004aad'}
            focusedDataPointColor='green'
            showStripOnFocus
            showTextOnFocus={true}
            delayBeforeUnFocus={3000}
            textColor={'#004aad'}
            focusedDataPointHeight={30}
            textFontSize1={15}
            disableScroll={true}
            yAxisLabelSuffix=' Nm'
            yAxisLabelWidth={55}
            curved
            curvature={0.05}
            curveType={CurveType.CUBIC}
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
