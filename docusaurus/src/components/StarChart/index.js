import React from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import zrok from './all.zrok.stargazers.json'
import ziti from './all.ziti.stargazers.json'
import others from './all.other.stargazers.json'

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default function StarChart(props) {   
    
    const zitiData = ziti.map((entry, index) => {
      const dateObject = new Date(entry.date);
      const r = {
        x: dateObject,
        y: index + 1
      };
      return r;
    });
    const zrokData = zrok.map((entry, index) => {
      const dateObject = new Date(entry.date);
      const r = {
        x: dateObject,
        y: index + 1
      };
      return r;
    });
    const othersData = others.map((entry, index) => {
      const dateObject = new Date(entry.date);
      const r = {
        x: dateObject,
        y: index + 1
      };
      return r;
    });
    
    const lastRow = {
      x: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Add an extra month to the current date
      y: null
    };
    
    const { children,style } = props;

    const options = {      
      zoomEnabled: true,
      panEnabled: true,
      title: {
        //text: "OpenZiti Combined Stars Over Time"
      },
      axisX: {
        title: "Date / Time"
      },
      axisY: {
        title: "Stargazers"
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        verticalAlign: "top",
        horizontalAlign: "center",
        dockInsidePlotArea: false,
      },
      data: [{
        name: "ziti",
        type: "line",
        connectNullData: true,
        showInLegend: true,
        xValueType: "dateTime",
        dataPoints: zitiData
      },
      {
        name: "zrok",
        type: "line",
        connectNullData: true,
        showInLegend: true,
        xValueType: "dateTime",
        dataPoints: zrokData
      },
      {
        name: "all others",
        type: "line",
        connectNullData: true,
        showInLegend: true,
        xValueType: "dateTime",
        dataPoints: othersData
      }
      ]
    }
    
    othersData.push(lastRow);

    return (
      <div>
        <CanvasJSChart options = {options} />
      </div>
    );
}
