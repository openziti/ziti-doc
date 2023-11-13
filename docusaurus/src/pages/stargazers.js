import React from "react";
import ReactEcharts from "echarts-for-react"; 
import zrok from './all.zrok.stargazers.json'
import ziti from './all.ziti.stargazers.json'
import others from './all.other.stargazers.json'
import { time } from "echarts";

const zitiData = {
  data: ziti,
  stars: [],
  dayRates: []
};
const zrokData = {
  data: zrok,
  stars: [],
  dayRates: []
};
const othersData = {
  data: others,
  stars: [],
  dayRates: []
};

function stripTime(input) {
  return new Date(input.getFullYear(), input.getMonth(), input.getDate());
}

function calculateRateAndStars(inp, data) {
  data.dayRates.push([
    "Day",
    "Count"
  ]);
  data.stars.push(["Date", "Stars"]);
  let currentDay = stripTime(new Date(inp[0].date));
  let dayCount = 0;
  let weekCount = 0;
  
  let index = 1;
  for (let i = 0; i < inp.length; i++) {
    const entryDate = new Date(inp[i].date);
    const day = stripTime(entryDate);
  
    if (day.getTime() === currentDay.getTime()) {
      dayCount = dayCount + 1;
      const n = dayCount;
    } else {
      const n1 = dayCount;
      weekCount = weekCount + dayCount;
      const e = [currentDay, dayCount];
      currentDay = day; // Update currentDay to the new day
      dayCount = 0; // Reset dayCount for the new day
      data.dayRates.push(e);
    }
    index = index + 1;
    const v = index;
    data.stars.push([entryDate,v]);
  }
}

/*
const othersData = calculateRateAndStars(others);
const zitiData = calculateRateAndStars(ziti);
const zrokData = calculateRateAndStars(zrok);
*/
calculateRateAndStars(zrok, zrokData)
calculateRateAndStars(ziti, zitiData)
calculateRateAndStars(others, othersData)

const largeAreaChart = {
  dataset: [
    /*
    {
      id: 'zitiData',
      source: monthRates/*calculateRateAndStars(ziti)* /,
    },
    {
      id: 'zrokData',
      source: calculateRateAndStars(zrok),
    }
    */
    {
      id: 'zitiDayRates',
      source: zitiData.dayRates,
    },
    {
      id: 'zrokDayRates',
      source: zrokData.dayRates,
    },
    {
      id: 'othersDayRates',
      source: othersData.dayRates,
    }
  ],
  tooltip: {
    trigger: 'axis',
    position: function (pt) {
      return [pt[0], '10%'];
    }
  },
  title: {
    left: 'center',
    text: 'Stargazer Change by Day'
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
    /*{
      name: 'ziti',
      datasetId: 'dataset_raw',
      type: 'line',
      smooth: false,
      symbolSize: 6,
      areaStyle: {
        color: 'rgba(0,0,0,0)',
      },
      encode: {
        x: 'Date',
        y: 'Stars',
        itemName: 'user',
        tooltip: ['user', 'user']
      },
    },*/
    {
      name: 'zrokDayRates',
      datasetId: 'zrokDayRates',
      type: 'line',
      smooth: false,
      symbol: 'none',
      symbolSize: 6,
      areaStyle: {
        color: 'rgba(0,0,0,0)',
      },
      encode: {
        x: 'Date',
        y: 'Stars',
        itemName: 'user',
        tooltip: ['user', 'user']
      },
    },
    {
      name: 'zitiDayRates',
      datasetId: 'zitiDayRates',
      type: 'line',
      smooth: false,
      symbol: 'none',
      symbolSize: 6,
      areaStyle: {
        color: 'rgba(0,0,0,0)',
      },
      encode: {
        x: 'Date',
        y: 'Stars',
        itemName: 'user',
        tooltip: ['user', 'user']
      },
    },
    {
      name: 'othersDayRates',
      datasetId: 'othersDayRates',
      type: 'line',
      smooth: false,
      symbol: 'none',
      symbolSize: 6,
      areaStyle: {
        color: 'rgba(0,0,0,0)',
      },
      encode: {
        x: 'Date',
        y: 'Stars',
        itemName: 'user',
        tooltip: ['user', 'user']
      },
    },
    /*
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
    },*/
    /*
    {
      name: 'all other stars',
      type: 'line',
      smooth: false,
      symbolSize: 6,
      areaStyle: {
        color: 'rgba(0,0,0,0)',
      },
      data: othersData,e
      encode: {
        x: 'Date',
        y: 'Stars',
        itemName: 'Year',
        tooltip: ['Year', 'Income']
      }
    },*/
  ]
};
const largeAreaChartDailies = {
  dataset: [
    /*
    {
      id: 'zitiData',
      source: monthRates/*calculateRateAndStars(ziti)* /,
    },
    {
      id: 'zrokData',
      source: calculateRateAndStars(zrok),
    }
    */
    {
      id: 'zitiDayRates',
      source: zitiData.stars,
    },
    {
      id: 'zrokDayRates',
      source: zrokData.stars,
    },
    {
      id: 'othersDayRates',
      source: othersData.stars,
    }
  ],
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
      name: 'zrokDayRates',
      datasetId: 'zrokDayRates',
      type: 'line',
      smooth: false,
      symbol: 'none',
      symbolSize: 6,
      areaStyle: {
        color: 'rgba(0,0,0,0)',
      },
      encode: {
        x: 'Date',
        y: 'Stars',
        itemName: 'user',
        tooltip: ['user', 'user']
      },
    },
    {
      name: 'zitiDayRates',
      datasetId: 'zitiDayRates',
      type: 'line',
      smooth: false,
      symbol: 'none',
      symbolSize: 6,
      areaStyle: {
        color: 'rgba(0,0,0,0)',
      },
      encode: {
        x: 'Date',
        y: 'Stars',
        itemName: 'user',
        tooltip: ['user', 'user']
      },
    },
    {
      name: 'othersDayRates',
      datasetId: 'othersDayRates',
      type: 'line',
      smooth: false,
      symbol: 'none',
      symbolSize: 6,
      areaStyle: {
        color: 'rgba(0,0,0,0)',
      },
      encode: {
        x: 'Date',
        y: 'Stars',
        itemName: 'user',
        tooltip: ['user', 'user']
      },
    },
  ]
};


const bigChart = {
  width: '80%', // Set the width of the chart container
  height: '500px',
};
const smallerChart = {
  width: '80%', // Set the width of the chart container
  height: '300px',
};

function App() {
  return <>
  <ReactEcharts option={largeAreaChartDailies} style={bigChart}/>
  <ReactEcharts option={largeAreaChart} style={smallerChart}/>
  </>;
} 
export default App;