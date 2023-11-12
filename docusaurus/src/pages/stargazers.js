import React from "react";
import ReactEcharts from "echarts-for-react"; 
import zrok from './all.zrok.stargazers.json'
import ziti from './all.ziti.stargazers.json'
import others from './all.other.stargazers.json'

const othersData = others.map((entry, index) => {
  const dateObject = new Date(entry.date);
  const r = {
    x: dateObject,
    y: index + 1
  };
  return [dateObject, index+1];
});
const zitiData = ziti.map((entry, index) => {
  const dateObject = new Date(entry.date);
  const r = {
    x: dateObject,
    y: index + 1
  };
  return [dateObject, index+1];
});
const zrokData = zrok.map((entry, index) => {
  const dateObject = new Date(entry.date);
  const r = {
    x: dateObject,
    y: index + 1
  };
  return [dateObject, index+1];
});



const largeAreaChart = {
  tooltip: {
    trigger: 'axis',
    position: function (pt) {
      return [pt[0], '10%'];
    }
  },
  title: {
    left: 'center',
    text: 'OpenZiti Stargazes by Project'
  },
  toolbox: {
    feature: {
      dataZoom: {
        yAxisIndex: 'none'
      },
      restore: {},
      saveAsImage: {}
    }
  },
  xAxis: {
    type: 'time',
    boundaryGap: "5%",
    axisLabel: {
      formatter: function (value) {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
      },
    },
    axisTick: {
      alignWithLabel: true,
      interval: 0,
      inside: true,
      length: 10,
      lineStyle: {
        color: 'red',
      },
    },
  },
  yAxis: {
    type: 'value',
    min: 'dataMin'
  },
  dataZoom: [
    {
      type: 'inside',
      start: 0,
      end: 100
    },
    {
      start: 0,
      end: 20
    }
  ],
  series: [
    {
      name: 'ziti',
      type: 'line',
      smooth: false,
      symbolSize: 6,
      areaStyle: {
        color: 'rgba(0,0,0,0)',
      },
      data: zitiData
    },
    {
      name: 'zrok',
      type: 'line',
      smooth: false,
      symbolSize: 6,
      areaStyle: {
        color: 'rgba(0,0,0,0)',
      },
      data: zrokData
    },
    {
      name: 'all other stars',
      type: 'line',
      smooth: false,
      symbolSize: 6,
      areaStyle: {
        color: 'rgba(0,0,0,0)',
      },
      data: othersData
    }
  ]
};

function handleDataZoom() {
  console.info("here");
}

const chartStyle = {
  width: '80%', // Set the width of the chart container
  height: '800px',
};
function App() {
  return <ReactEcharts option={largeAreaChart} style={chartStyle} />;
} 
export default App;