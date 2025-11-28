import { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Button,
  Menu,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Card,
  message,
  Spin,
  Input,
  Tabs,
  Radio,
} from 'antd';
import { LineChartOutlined, ClusterOutlined, EnvironmentOutlined, BarChartOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import TrafficMap from './TrafficMap';
import type { CityConfig } from '../App';

const { Sider, Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface DataAnalysisViewProps {
  analysisData: AnalysisResponse | null;
  setAnalysisData: (data: AnalysisResponse | null) => void;
  clusterData: ClusterResponse | null;
  setClusterData: (data: ClusterResponse | null) => void;
  cityConfig: CityConfig;
}

interface CityData {
  missing: number[];
  outliers: number[];
  x: string[];
  y: number[];
}

interface CityStats {
  mean: number;
  missing: number;
  outlier: number;
  std: number;
  total: number;
}

interface AnalysisResponse {
  status: string;
  message: string;
  data: {
    points: Record<string, CityData>;
    stats: Record<string, CityStats>;
  };
}

interface ClusterResponse {
  status: string;
  message: string;
  data: {
    labels: number[];
    result: {
      heatmap: {
        labels: string[];
        matrix: number[][];
      };
      mean_curve: Array<{
        cluster: number;
        mean: number;
        std: number;
        time: string;
      }>;
      pca_2d: Array<{
        city: string;
        cluster: number;
        x: number;
        y: number;
      }>;
    };
    cluster_stats: Record<string, {
      mean: number[];
      members: string[];
      std: number[];
      x_axis: string[];
    }>;
  };
}

// 城市名称映射表（从ID 1开始）
const CITY_NAMES = [
  'ADRIANO', 'AFFORI', 'ASSIANO', 'BAGGIO', 'BANDE NERE', 'BARONA', 'BICOCCA', 'BOLDINASCO',
  'BOSCOINCITTA', 'BOVISA', 'BOVISASCA', 'BRERA', 'BRUZZANO', 'BUENOS AIRES', 'CALVAIRATE',
  'CANTALUPA', 'CASCINA MERLATA', 'CHIARAVALLE', 'CIMIANO', 'CITTA STUDI', 'COMASINA',
  'CONCA DEL NAVIGLIO', 'CONCA FALLATA', 'CONCHETTA', 'CORSICA', 'DE ANGELI', 'DEI NAVIGLI',
  'DELLE ABBAZIE', 'DERGANO', 'DUOMO', 'FARINI', 'FATIMA', 'FIGINO', 'FORLANINI', 'FORZE ARMATE',
  'GHISOLFA', 'GIAMBELLINO', 'GIARDINI', 'GORLA', 'GRATOSOGLIO', 'GRECO', 'GUASTALLA',
  'IPPODROMI', 'ISOLA', 'LAMBRATE', 'LAMPUGNANO', 'LODI', 'LODOVICO IL MORO', 'LORENTEGGIO',
  'LORETO', 'MACIACHINI', 'MAGENTA', 'MAGGIORE', 'MONCUCCO', 'MONLUE', 'MORIVIONE', 'MUGGIANO',
  'MUSOCCO', 'NIGUARDA', 'ORTOMERCATO', 'PADOVA', 'PAGANO', 'PARCO FORLANINI', 'PARCO NORD',
  'PARCO SEMPIONE', 'PONTE SEVESO', 'PORTA GARIBALDI', 'PORTA GENOVA', 'PORTA LODOVICA',
  'PORTA MAGENTA', 'PORTELLO', 'PTA ROMANA', 'QT 8', 'QUARTO CAGNINO', 'QUINTO ROMANO',
  'QUINTOSOLE', 'RONCHETTO DELLE RANE', 'ROSERIO', 'SAN SIRO', 'SANTA GIULIA', 'SARPI',
  'SCALO ROMANA', 'STEPHENSON', 'TIBALDI', 'TRE TORRI', 'TRENNO', 'TRIULZO SUPERIORE', 'XXII MARZO'
];

const DataAnalysisView: React.FC<DataAnalysisViewProps> = ({
  analysisData,
  setAnalysisData,
  clusterData,
  setClusterData,
  cityConfig,
}) => {
  const [form] = Form.useForm();
  const [clusterForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [currentMenu, setCurrentMenu] = useState('analysis');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'chart' | 'map'>('chart'); // 图表或地图视图
  const [geoJsonData, setGeoJsonData] = useState<any>(null); // 存储 GeoJSON 数据

  // 加载并注册地图（根据城市配置）
  useEffect(() => {
    // 从 public 目录加载对应城市的 GeoJSON 数据
    fetch(cityConfig.geoJsonPath)
      .then(response => response.json())
      .then(geoJson => {
        echarts.registerMap(cityConfig.type, geoJson);
        setGeoJsonData(geoJson); // 保存 GeoJSON 数据供 Leaflet 使用
      })
      .catch(error => {
        console.error(`加载${cityConfig.displayName}地图数据失败:`, error);
      });
  }, [cityConfig]);

  const handleAnalysis = async (values: any) => {
    if (!values.csv_path) {
      messageApi.error('请输入 CSV 文件路径！');
      return;
    }

    setLoading(true);

    try {
      const requestBody: any = {
        csv_path: values.csv_path,
        city_id: values.city_id,
        method: values.method || 'iqr',
      };

      if (values.time_range) {
        requestBody.start_time = values.time_range[0].format('YYYY-MM-DD HH:mm:ss');
        requestBody.end_time = values.time_range[1].format('YYYY-MM-DD HH:mm:ss');
      }

      if (values.window_size) {
        requestBody.window_size = values.window_size;
      }

      if (values.z_thresh) {
        requestBody.z_thresh = values.z_thresh;
      }

      // 替换为实际的API端点
      const response = await fetch('http://localhost:5000/api/data_analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();

      if (data.status === 'success') {
        setAnalysisData(data);
        messageApi.success('数据分析完成！');
      } else {
        messageApi.error(data.message || '数据分析失败');
      }
    } catch (error) {
      console.error('分析请求失败:', error);
      messageApi.error('分析请求失败，请检查网络或服务器状态');
    } finally {
      setLoading(false);
    }
  };

  const handleCluster = async (values: any) => {
    if (!values.csv_path) {
      messageApi.error('请输入 CSV 文件路径！');
      return;
    }

    setLoading(true);

    try {
      const requestBody: any = {
        csv_path: values.csv_path,
        method: values.method || 'kmeans',
        n_clusters: values.n_clusters || 3,
        return_mode: 'data',
      };

      if (values.time_range) {
        requestBody.start_time = values.time_range[0].format('YYYY-MM-DD HH:mm:ss');
        requestBody.end_time = values.time_range[1].format('YYYY-MM-DD HH:mm:ss');
      }

      if (values.city_id) {
        requestBody.city_ids = values.city_id;
      }

      const response = await fetch('http://localhost:5000/api/cluster_city', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ClusterResponse = await response.json();

      if (data.status === 'success') {
        setClusterData(data);
        messageApi.success('聚类分析完成！');
      } else {
        messageApi.error(data.message || '聚类分析失败');
      }
    } catch (error) {
      console.error('聚类请求失败:', error);
      messageApi.error('聚类请求失败，请检查网络或服务器状态');
    } finally {
      setLoading(false);
    }
  };

  const getChartOption = () => {
    if (!analysisData) return {};

    const series: any[] = [];
    const cities = Object.keys(analysisData.data.points);

    cities.forEach((city) => {
      const cityData = analysisData.data.points[city];

      // 主数据线
      series.push({
        name: city,
        type: 'line',
        data: cityData.y,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          width: 2,
        },
      });

      // 标记缺失值
      if (cityData.missing && cityData.missing.length > 0) {
        const missingData = cityData.x.map((_x, idx) => {
          return cityData.missing.includes(idx) ? cityData.y[idx] : null;
        });
        series.push({
          name: `${city} - 缺失值`,
          type: 'scatter',
          data: missingData,
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: {
            color: '#faad14',
            borderColor: '#fff',
            borderWidth: 2,
          },
          zlevel: 2,
        });
      }

      // 标记异常值
      if (cityData.outliers && cityData.outliers.length > 0) {
        const outlierData = cityData.x.map((_x, idx) => {
          return cityData.outliers.includes(idx) ? cityData.y[idx] : null;
        });
        series.push({
          name: `${city} - 异常值`,
          type: 'scatter',
          data: outlierData,
          symbol: 'diamond',
          symbolSize: 12,
          itemStyle: {
            color: '#ff4d4f',
            borderColor: '#fff',
            borderWidth: 2,
          },
          zlevel: 2,
        });
      }
    });

    return {
      title: {
        text: '交通数据分析',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';

          let result = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;
          params.forEach((param: any) => {
            if (param.value !== null && param.value !== undefined) {
              const marker = param.marker;
              result += `${marker} ${param.seriesName}: ${param.value.toFixed(2)}<br/>`;
            }
          });
          return result;
        },
      },
      legend: {
        data: series.map(s => s.name),
        top: 40,
        type: 'scroll',
        pageIconColor: '#1890ff',
        pageIconInactiveColor: '#aaa',
        pageTextStyle: {
          color: '#333',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '80px',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: analysisData.data.points[cities[0]]?.x || [],
        axisLabel: {
          rotate: 45,
          formatter: (value: string) => {
            const date = new Date(value);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${month}-${day} ${hours}:${minutes}`;
          },
        },
        axisLine: {
          lineStyle: {
            color: '#999',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: '流量',
        nameTextStyle: {
          fontSize: 14,
          padding: [0, 0, 0, 10],
        },
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 10000) {
              return (value / 10000).toFixed(1) + 'w';
            }
            return value.toFixed(0);
          },
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series: series,
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 30,
          bottom: 10,
          handleIcon: 'path://M2,2 L7,2 L7,32 L2,32 Z',
          handleSize: '100%',
          handleStyle: {
            color: '#f1f1f1ff'
          },
        },
      ],
      toolbox: {
        feature: {
          saveAsImage: {
            title: '保存为图片',
            pixelRatio: 2,
          },
          restore: {
            title: '还原',
          },
          dataView: {
            title: '数据视图',
            readOnly: false,
          },
          magicType: {
            type: ['line', 'bar'],
            title: {
              line: '切换为折线图',
              bar: '切换为柱状图',
            },
          },
        },
        right: 20,
        top: 10,
      },
    };
  };

  const getHeatmapOption = () => {
    if (!clusterData) return {};

    const { heatmap } = clusterData.data.result;
    return {
      title: {
        text: '城市相关性热力图',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          return `${heatmap.labels[params.data[0]]} - ${heatmap.labels[params.data[1]]}<br/>相关性: ${params.data[2].toFixed(3)}`;
        },
      },
      grid: {
        left: '15%',
        right: '5%',
        bottom: '15%',
        top: '80px',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: heatmap.labels,
        splitArea: {
          show: true,
        },
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'category',
        data: heatmap.labels,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: -1,
        max: 1,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        inRange: {
          color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
        },
      },
      series: [
        {
          name: '相关性',
          type: 'heatmap',
          data: heatmap.matrix.flatMap((row, i) =>
            row.map((value, j) => [i, j, value])
          ),
          label: {
            show: true,
            formatter: (params: any) => params.data[2].toFixed(2),
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  };

  const getMeanCurveOption = () => {
    if (!clusterData) return {};

    const { mean_curve } = clusterData.data.result;
    const clusters = [...new Set(mean_curve.map(item => item.cluster))];

    const series = clusters.map(clusterId => {
      const clusterData = mean_curve.filter(item => item.cluster === clusterId);
      return {
        name: `簇 ${clusterId}`,
        type: 'line',
        data: clusterData.map(item => item.mean),
        smooth: true,
        lineStyle: {
          width: 2,
        },
        areaStyle: {
          opacity: 0.3,
        },
      };
    });

    return {
      title: {
        text: '聚类均值曲线',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: clusters.map(id => `簇 ${id}`),
        top: 40,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '80px',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: mean_curve.filter(item => item.cluster === clusters[0]).map(item => item.time),
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: '流量均值',
      },
      series: series,
    };
  };

  const getPCAOption = () => {
    if (!clusterData) return {};

    const { pca_2d } = clusterData.data.result;
    const clusters = [...new Set(pca_2d.map(item => item.cluster))];

    const series = clusters.map(clusterId => {
      const clusterPoints = pca_2d.filter(item => item.cluster === clusterId);
      return {
        name: `簇 ${clusterId}`,
        type: 'scatter',
        data: clusterPoints.map(item => [item.x, item.y, item.city]),
        symbolSize: 15,
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderColor: '#333',
            borderWidth: 2,
          },
        },
      };
    });

    return {
      title: {
        text: 'PCA 二维投影',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        formatter: (params: any) => {
          return `${params.data[2]}<br/>簇: ${params.seriesName}<br/>X: ${params.data[0].toFixed(2)}<br/>Y: ${params.data[1].toFixed(2)}`;
        },
      },
      legend: {
        data: clusters.map(id => `簇 ${id}`),
        top: 40,
      },
      grid: {
        left: '10%',
        right: '5%',
        bottom: '10%',
        top: '80px',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: 'PC1',
        nameLocation: 'center',
        nameGap: 30,
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'PC2',
        nameLocation: 'center',
        nameGap: 30,
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series: series,
    };
  };

  const renderContent = () => {
    switch (currentMenu) {
      case 'analysis':
        return (
          <>
            <Spin spinning={loading}>
              <Card title="数据分析配置" style={{ marginBottom: '20px' }}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleAnalysis}
                  initialValues={{
                    z_thresh: 3.0,
                    window_size: 10,
                  }}
                >
                  <Form.Item
                    label="CSV 文件路径"
                    name="csv_path"
                    rules={[{ required: true, message: '请输入 CSV 文件路径' }]}
                  >
                    <Input
                      placeholder="例如: /path/to/your/data.csv"
                      allowClear
                    />
                  </Form.Item>

                  <Form.Item
                    label="选择城市"
                    name="city_id"
                    rules={[{ required: true, message: '请选择至少一个城市' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="选择城市"
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={cityConfig.cities.map((name, index) => ({
                        label: `${index + 1} - ${name}`,
                        value: index + 1,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item
                    label="分析方法"
                    name="method"
                    rules={[{ required: true, message: '请选择分析方法' }]}
                  >
                    <Select placeholder="请选择分析方法" allowClear>
                      <Option value="iqr">IQR (四分位距)</Option>
                      <Option value="zscore">Z-Score (Z分数)</Option>
                      <Option value="window">Window (滑动窗口)</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="时间范围"
                    name="time_range"
                  >
                    <RangePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.method !== currentValues.method}>
                    {({ getFieldValue }) => {
                      const method = getFieldValue('method');
                      if (method === 'zscore') {
                        return (
                          <Form.Item
                            label="Z分数阈值"
                            name="z_thresh"
                          >
                            <InputNumber
                              min={1}
                              max={5}
                              step={0.1}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        );
                      }
                      if (method === 'window') {
                        return (
                          <Form.Item
                            label="窗口大小"
                            name="window_size"
                          >
                            <InputNumber
                              min={3}
                              max={50}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        );
                      }
                      return null;
                    }}
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<LineChartOutlined />}
                      block
                      loading={loading}
                    >
                      开始分析
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              {analysisData && (
                <Card title="统计信息">
                  {Object.entries(analysisData.data.stats).map(([city, stats]) => (
                    <div key={city} style={{ marginBottom: '16px' }}>
                      <Typography.Title level={5}>{city}</Typography.Title>
                      <Typography.Text>
                        总数据点: {stats.total} |
                        平均值: {stats.mean.toFixed(2)} |
                        标准差: {stats.std.toFixed(2)} |
                        缺失值: {stats.missing} |
                        异常值: {stats.outlier}
                      </Typography.Text>
                    </div>
                  ))}
                </Card>
              )}
            </Spin>
          </>
        );

      case 'cluster':
        return (
          <>
            <Spin spinning={loading}>
              <Card title="聚类分析配置" style={{ marginBottom: '20px' }}>
                <Form
                  form={clusterForm}
                  layout="vertical"
                  onFinish={handleCluster}
                  initialValues={{
                    method: 'kmeans',
                    n_clusters: 3,
                  }}
                >
                  <Form.Item
                    label="CSV 文件路径"
                    name="csv_path"
                    rules={[{ required: true, message: '请输入 CSV 文件路径' }]}
                  >
                    <Input
                      placeholder="例如: /path/to/your/data.csv"
                      allowClear
                    />
                  </Form.Item>

                  <Form.Item
                    label="选择城市"
                    name="city_id"
                  >
                    <Select
                      mode="multiple"
                      placeholder="选择城市（可选）"
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={cityConfig.cities.map((name, index) => ({
                        label: `${index + 1} - ${name}`,
                        value: index + 1,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item
                    label="聚类方法"
                    name="method"
                  >
                    <Select placeholder="请选择分析方法" allowClear>
                      <Option value="kmeans">K-Means</Option>
                      <Option value="hierarchical">层次聚类</Option>
                      <Option value="gmm">高斯混合模型</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="聚类簇数"
                    name="n_clusters"
                  >
                    <InputNumber
                      min={2}
                      max={10}
                      style={{ width: '100%' }}
                      placeholder="请填写聚类簇数"
                    />
                  </Form.Item>

                  <Form.Item
                    label="时间范围"
                    name="time_range"
                  >
                    <RangePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<ClusterOutlined />}
                      block
                    >
                      开始聚类分析
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Spin>
          </>
        );

      default:
        return null;
    }
  };

  // 获取地图视图数据
  const getMapData = () => {
    if (!analysisData) return null;

    // 获取所有城市的时间序列数据
    const cities = Object.keys(analysisData.data.points);
    if (cities.length === 0) return null;

    // 获取时间轴数据（使用第一个城市的时间序列作为参考）
    const timeSeriesData = analysisData.data.points[cities[0]].x;

    // 为每个时间点准备城市数据
    const timelineData = timeSeriesData.map((timestamp, timeIndex) => {
      const cityDataMap: Record<string, number> = {};

      cities.forEach((cityName) => {
        const cityPoints = analysisData.data.points[cityName];
        // 获取该时间点的流量值
        cityDataMap[cityName] = cityPoints.y[timeIndex] || 0;
      });

      return {
        timestamp,
        data: Object.keys(cityDataMap).map(cityName => {
          // 市区名称映射：将cityName转换为GeoJSON中的NIL名称
          const nilName = CITY_NAMES[parseInt(cityName) - 1] || cityName;
          return {
            name: nilName,
            value: cityDataMap[cityName],
          };
        }),
      };
    });

    // 计算所有时间点的流量范围
    const allValues = cities.flatMap(city => analysisData.data.points[city].y);
    const minTraffic = Math.min(...allValues);
    const maxTraffic = Math.max(...allValues);

    return { timelineData, minTraffic, maxTraffic };
  };

  return (
    <>
      {contextHolder}
      <Layout style={{ height: '100%', overflow: 'hidden' }}>
        <Menu
          mode="horizontal"
          selectedKeys={[currentMenu]}
          onClick={({ key }) => setCurrentMenu(key)}
          style={{ marginBottom: 0 }}
          items={[
            { key: 'analysis', label: '数据分析', icon: <LineChartOutlined /> },
            { key: 'cluster', label: '聚类分析', icon: <ClusterOutlined /> },
          ]}
        />
        <Layout style={{ height: 'calc(100% - 46px)', overflow: 'hidden' }}>
          <Sider
            width="25%"
            style={{
              background: '#fff',
              padding: '20px',
              overflow: 'auto',
              height: '75%',
              borderRight: '1px solid #f0f0f0',
            }}
          >
            {renderContent()}
          </Sider>
          <Content style={{ background: '#fff', padding: '20px', overflow: 'hidden', height: '100%', position: 'relative' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip={currentMenu === 'analysis' ? '分析中...' : '聚类中...'} />
              </div>
            ) : currentMenu === 'analysis' ? (
              analysisData ? (
                <>
                  {/* 悬浮的切换按钮 */}
                  <div style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px',
                    padding: '4px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }}>
                    <Radio.Group
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value)}
                      buttonStyle="solid"
                      size="large"
                    >
                      <Radio.Button value="chart">
                        <BarChartOutlined /> 图表视图
                      </Radio.Button>
                      <Radio.Button value="map">
                        <EnvironmentOutlined /> 地图视图
                      </Radio.Button>
                    </Radio.Group>
                  </div>

                  {/* 内容区域 */}
                  {viewMode === 'chart' ? (
                    <ReactECharts
                      option={getChartOption()}
                      style={{ height: 'calc(100vh - 360px)', width: '100%' }}
                      notMerge={true}
                      lazyUpdate={true}
                    />
                  ) : (
                    geoJsonData && analysisData ? (
                      <div style={{ height: 'calc(100vh - 240px)', width: '100%' }}>
                        <TrafficMap
                          geoJsonData={geoJsonData}
                          trafficData={getMapData()?.timelineData || []}
                          minTraffic={getMapData()?.minTraffic || 0}
                          maxTraffic={getMapData()?.maxTraffic || 100}
                          cityType={cityConfig.type}
                          cityConfig={cityConfig}
                        />
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        color: '#999',
                      }}>
                        <Spin size="large" tip="加载地图中..." />
                      </div>
                    )
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                  <LineChartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <Typography.Title level={4} style={{ color: '#999' }}>
                    请配置参数并开始分析
                  </Typography.Title>
                  <Typography.Text>
                    上传CSV文件，选择城市和分析方法，然后点击"开始分析"按钮
                  </Typography.Text>
                </div>
              )
            ) : currentMenu === 'cluster' ? (
              clusterData ? (
                <Tabs
                  defaultActiveKey="heatmap"
                  style={{ height: '100%' }}
                  items={[
                    {
                      key: 'heatmap',
                      label: '相关性热力图',
                      children: (
                        <ReactECharts
                          option={getHeatmapOption()}
                          style={{ height: 'calc(100vh - 360px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                    {
                      key: 'mean_curve',
                      label: '聚类均值曲线',
                      children: (
                        <ReactECharts
                          option={getMeanCurveOption()}
                          style={{ height: 'calc(100vh - 360px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                    {
                      key: 'pca',
                      label: 'PCA 二维投影',
                      children: (
                        <ReactECharts
                          option={getPCAOption()}
                          style={{ height: 'calc(100vh - 360px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                  ]}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                  <ClusterOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <Typography.Title level={4} style={{ color: '#999' }}>
                    请配置参数并开始聚类分析
                  </Typography.Title>
                  <Typography.Text>
                    上传CSV文件，选择聚类方法和簇数，然后点击"开始聚类分析"按钮
                  </Typography.Text>
                </div>
              )
            ) : null}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default DataAnalysisView;
