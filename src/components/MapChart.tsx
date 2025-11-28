import React, { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { GeoComponent, TooltipComponent, VisualMapComponent } from "echarts/components";
import { MapChart as EMapChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import italyJson from "../assets/Italy.json";

echarts.use([GeoComponent, TooltipComponent, VisualMapComponent, EMapChart, CanvasRenderer]);

interface MapChartProps {
  data?: Array<{ name: string; value: number }>;
  height?: string;
}

const MapChart: React.FC<MapChartProps> = ({ data = [], height = "600px" }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 注册意大利地图 GeoJSON
    echarts.registerMap("italy", italyJson as any);

    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsCoreOption = {
      // 全局动画配置
      animation: true,
      animationDuration: 0, // 初始动画持续时间（毫秒）
      animationDurationUpdate: 0, // 数据更新动画持续时间（毫秒）
      animationEasing: 'cubicOut', // 动画缓动函数
      animationEasingUpdate: 'cubicOut', // 更新动画缓动函数

      tooltip: {
        trigger: "item",
      },
      visualMap: {
        min: 0,
        max: 100,
        left: "left",
        top: "bottom",
        text: ["高", "低"],
        calculable: true,
        show: false
      },
      series: [
        {
          name: "Italy Map",
          type: "map",
          map: "italy",
          roam: true, // 可缩放拖动
          label: {
            show: true,
            fontSize: 10,
            fontWeight: "bold",
            color: "rgb(0,0,125)",
          },
          itemStyle: {
            areaColor: "rgba(150, 200, 255, 0.5)",
            borderColor: "rgba(0,150,225,1)",
            borderWidth: 1,
          },
          emphasis: {
            // focus: 'self',
            label: {
              show: true,
              color: "#fff",
              fontSize: 12,
            },
            itemStyle: {
              areaColor: "rgba(0,150,225,1)",
              borderColor: "rgba(0,150,225,1)",
              borderWidth: 1,
              shadowColor: "rgba(0,150,225,0.3)",
              shadowBlur: 0,
              shadowOffsetX: 2,
              shadowOffsetY: 2,
            },
          },
          select: {
            label: {
              show: true,
              color: "rgba(0, 0, 0, 1)",
            },
            itemStyle: {
              areaColor: "rgba(0,150,225,1)",
              borderColor: "rgba(0,150,225,1)",
            },
          },
          data,
        },
      ],
    };

    chartInstance.current.setOption(option);

    const resize = () => chartInstance.current?.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chartInstance.current?.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: "500px", height }} />;
};

export default MapChart;