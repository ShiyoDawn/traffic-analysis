import { useState } from 'react';
import {
  Layout,
  Typography,
  Button,
  Menu,
  Form,
  Select,
  Input,
  InputNumber,
  Card,
  message,
  Spin,
  Tabs,
} from 'antd';
import { ThunderboltOutlined, ExperimentOutlined, CalculatorOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import type { CityConfig } from '../App';

const { Sider, Content } = Layout;
const { Option } = Select;

interface ModelPredictionViewProps {
  dlPredictionData: PredictionResponse | null;
  setDlPredictionData: (data: PredictionResponse | null) => void;
  mlPredictionData: PredictionResponse | null;
  setMlPredictionData: (data: PredictionResponse | null) => void;
  mathPredictionData: PredictionResponse | null;
  setMathPredictionData: (data: PredictionResponse | null) => void;
  cityConfig: CityConfig;
}

interface PredictionMetrics {
  rmse: number;
  mae: number;
  r2: number;
  smape: number;
}

interface LineData {
  x: number[];
  y_true: number[];
  y_pred: number[];
  total_points: number;
}

interface ErrorData {
  x: number[];
  y_error: number[];
}

interface PredictionResponse {
  status: string;
  message: string;
  data: {
    metrics: PredictionMetrics;
    line_data: LineData;
    error_data: ErrorData;
    model_path: string;
  };
}

const ModelPredictionView: React.FC<ModelPredictionViewProps> = ({
  dlPredictionData,
  setDlPredictionData,
  mlPredictionData,
  setMlPredictionData,
  mathPredictionData,
  setMathPredictionData,
  cityConfig,
}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [currentMenu, setCurrentMenu] = useState('dl');
  const [loading, setLoading] = useState(false);

  const handleDLPredict = async (values: any) => {
    if (!values.model_path || !values.test_csv) {
      messageApi.error('请填写模型路径和测试数据路径！');
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        model_class: values.model_class,
        model_path: values.model_path,
        test_csv: values.test_csv,
        batch_size: values.batch_size || 64,
        device: values.device || 'cpu',
      };

      const response = await fetch('http://localhost:5000/api/load_dl_model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PredictionResponse = await response.json();
      
      if (data.status === 'success') {
        setDlPredictionData(data);
        messageApi.success(data.message);
      } else {
        messageApi.error(data.message || '模型预测失败');
      }
    } catch (error) {
      console.error('预测请求失败:', error);
      messageApi.error('预测请求失败，请检查网络或服务器状态');
    } finally {
      setLoading(false);
    }
  };

  const handleMLPredict = async (values: any) => {
    if (!values.model_path || !values.test_csv) {
      messageApi.error('请填写模型路径和测试数据路径！');
      return;
    }

    setLoading(true);

    try {
      const requestBody: any = {
        model_path: values.model_path,
        test_csv: values.test_csv,
        batch_size: values.batch_size || 512,
        max_display_points: values.max_display_points || 5000,
        bins: values.bins || 40,
      };

      // 如果指定了保存路径，则添加到请求中
      if (values.save_preds_path) {
        requestBody.save_preds_path = values.save_preds_path;
      }

      const response = await fetch('http://localhost:5000/api/load_ml_model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PredictionResponse = await response.json();
      
      if (data.status === 'success') {
        setMlPredictionData(data);
        messageApi.success(data.message);
      } else {
        messageApi.error(data.message || '模型预测失败');
      }
    } catch (error) {
      console.error('预测请求失败:', error);
      messageApi.error('预测请求失败，请检查网络或服务器状态');
    } finally {
      setLoading(false);
    }
  };

  const handleMathPredict = async (values: any) => {
    if (!values.model_path || !values.test_csv) {
      messageApi.error('请填写模型路径和测试数据路径！');
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        model_path: values.model_path,
        test_csv: values.test_csv,
        model_name: values.model_name,
        batch_size: values.batch_size || 64,
        max_display_points: values.max_display_points || 8000,
        bins: values.bins || 50,
      };

      const response = await fetch('http://localhost:5000/api/math_model_predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PredictionResponse = await response.json();
      
      if (data.status === 'success') {
        setMathPredictionData(data);
        messageApi.success(data.message);
      } else {
        messageApi.error(data.message || '模型预测失败');
      }
    } catch (error) {
      console.error('预测请求失败:', error);
      messageApi.error('预测请求失败，请检查网络或服务器状态');
    } finally {
      setLoading(false);
    }
  };

  const renderDLForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleDLPredict}
      style={{ marginTop: 20 }}
    >
      <Form.Item
        name="model_class"
        label="模型类型"
        rules={[{ required: true, message: '请选择模型类型' }]}
      >
        <Select placeholder="请选择模型">
          <Option value="mlp">MLP</Option>
          <Option value="lstm">LSTM</Option>
          <Option value="gru">GRU</Option>
          <Option value="cnn1d">CNN1D</Option>
          <Option value="cnn_lstm">CNN-LSTM</Option>
          <Option value="attention_lstm">Attention-LSTM</Option>
          <Option value="transformer">Transformer</Option>
          <Option value="tcn">TCN</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="model_path"
        label="模型路径"
        rules={[{ required: true, message: '请输入模型路径' }]}
        initialValue="../save/dl_save/cnn1d_best.pth"
      >
        <Input placeholder="例如: ../save/dl_save/cnn1d_best.pth" />
      </Form.Item>

      <Form.Item
        name="test_csv"
        label="测试数据路径"
        rules={[{ required: true, message: '请输入测试数据路径' }]}
        initialValue="../data/output/test_samples_seq200_out5_overlap1_testevery5.csv"
      >
        <Input placeholder="例如: ../data/samples/test_samples_seq100_out1_overlap1_testevery5.csv" />
      </Form.Item>

      <Form.Item
        name="batch_size"
        label="批大小"
        initialValue={64}
      >
        <InputNumber min={1} max={512} style={{ width: '100%' }} 
                    placeholder="请输入1-512之间的数字"/>
      </Form.Item>

      <Form.Item
        name="device"
        label="计算设备"
        initialValue="cpu"
      >
        <Select>
          <Option value="cpu">CPU</Option>
          <Option value="cuda">CUDA</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          开始预测
        </Button>
      </Form.Item>
    </Form>
  );

  const renderMLForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleMLPredict}
      style={{ marginTop: 20 }}
    >
      <Form.Item
        name="model_path"
        label="模型路径"
        rules={[{ required: true, message: '请输入模型路径' }]}
        initialValue="../save/ml_save/lightgbm_model.pkl"
      >
        <Input placeholder="例如: ../save/ml_save/lightgbm_model.pkl" />
      </Form.Item>

      <Form.Item
        name="test_csv"
        label="测试数据路径"
        rules={[{ required: true, message: '请输入测试数据路径' }]}
        initialValue="../data/output/test_samples_seq200_out5_overlap1_testevery5.csv"
      >
        <Input placeholder="例如: ../data/samples/test_samples_seq100_out1_overlap1_testevery5.csv" />
      </Form.Item>

      <Form.Item
        name="batch_size"
        label="批大小"
        initialValue={512}
      >
        <InputNumber min={1} max={2048} style={{ width: '100%' }} 
                    placeholder="请输入1-2048之间的数字"/>
      </Form.Item>

      <Form.Item
        name="max_display_points"
        label="最大显示点数"
        initialValue={5000}
      >
        <InputNumber min={100} max={50000} style={{ width: '100%' }} 
                    placeholder="请输入100-50000之间的数字"/>
      </Form.Item>

      <Form.Item
        name="bins"
        label="误差分布分箱数"
        initialValue={40}
      >
        <InputNumber min={10} max={200} style={{ width: '100%' }} 
                    placeholder="请输入50-200之间的数字"/>
      </Form.Item>

      <Form.Item
        name="save_preds_path"
        label="预测结果保存路径（可选）"
      >
        <Input placeholder="例如: ./results/predictions.csv" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          开始预测
        </Button>
      </Form.Item>
    </Form>
  );

  const renderMathForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleMathPredict}
      style={{ marginTop: 20 }}
    >
      <Form.Item
        name="model_name"
        label="模型类型"
        rules={[{ required: true, message: '请选择模型类型' }]}
      >
        <Select placeholder="请选择模型" allowClear>
          <Option value="persistence">Persistence (持续性)</Option>
          <Option value="moving_avg">Moving Average (移动平均)</Option>
          <Option value="exp_smooth">Exponential Smoothing (指数平滑)</Option>
          <Option value="ar">AR (自回归)</Option>
          <Option value="arima">ARIMA (差分自回归移动平均)</Option>
          <Option value="kalman">Kalman Filter (卡尔曼滤波)</Option>
          <Option value="fourier">Fourier (傅里叶变换)</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="model_path"
        label="模型路径"
        rules={[{ required: true, message: '请输入模型路径' }]}
        initialValue="../save/math_save/persistence_model.pkl"
      >
        <Input placeholder="例如: ../save/math_save/persistence_model.pkl" />
      </Form.Item>

      <Form.Item
        name="test_csv"
        label="测试数据路径"
        rules={[{ required: true, message: '请输入测试数据路径' }]}
        initialValue="../data/output/test_samples_seq200_out5_overlap1_testevery5.csv"
      >
        <Input placeholder="例如: ../data/samples/test_samples_seq100_out1_overlap1_testevery5.csv" />
      </Form.Item>

      <Form.Item
        name="batch_size"
        label="批大小"
        initialValue={64}
      >
        <InputNumber min={1} max={1024} style={{ width: '100%' }} 
                    placeholder="请输入1-1024之间的数字"/>
      </Form.Item>

      <Form.Item
        name="max_display_points"
        label="最大显示点数"
        initialValue={8000}
      >
        <InputNumber min={100} max={50000} style={{ width: '100%' }} 
                    placeholder="请输入100-50000之间的数字"/>
      </Form.Item>

      <Form.Item
        name="bins"
        label="误差分布分箱数"
        initialValue={50}
      >
        <InputNumber min={10} max={200} style={{ width: '100%' }} 
                    placeholder="请输入10-200之间的数字"/>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          开始预测
        </Button>
      </Form.Item>
    </Form>
  );

  const renderContent = () => {
    switch (currentMenu) {
      case 'dl':
        return renderDLForm();
      case 'ml':
        return renderMLForm();
      case 'math':
        return renderMathForm();
      default:
        return null;
    }
  };

  const getPredictionLineOption = () => {
    const predictionData = currentMenu === 'dl' ? dlPredictionData : 
                          currentMenu === 'ml' ? mlPredictionData : 
                          mathPredictionData;
    
    if (!predictionData) return {};

    const { line_data } = predictionData.data;

    return {
      title: {
        text: '预测结果对比',
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
        data: ['真实值', '预测值'],
        top: 30,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '20%',
        top: '80px',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: line_data.x,
        name: '样本点',
        nameLocation: 'middle',
        nameGap: 25,
        boundaryGap: true,
      },
      yAxis: {
        type: 'value',
        name: '流量值',
        nameLocation: 'middle',
        nameGap: 40,
      },
      series: [
        {
          name: '真实值',
          type: 'line',
          data: line_data.y_true,
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#5470c6',
          },
          itemStyle: {
            color: '#5470c6',
          },
          symbol: 'circle',
          symbolSize: 4,
          showSymbol: false,
        },
        {
          name: '预测值',
          type: 'line',
          data: line_data.y_pred,
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#ee6666',
          },
          itemStyle: {
            color: '#ee6666',
          },
          symbol: 'circle',
          symbolSize: 4,
          showSymbol: false,
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
          dataZoom: {
            title: {
              zoom: '区域缩放',
              back: '还原缩放',
            },
          },
        },
        right: 20,
        top: 10,
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 100,
          height: 30,
          bottom: 20,
        },
      ],
    };
  };

  const getErrorDistributionOption = () => {
    const predictionData = currentMenu === 'dl' ? dlPredictionData : 
                          currentMenu === 'ml' ? mlPredictionData : 
                          mathPredictionData;
    
    if (!predictionData) return {};

    const { error_data } = predictionData.data;

    return {
      title: {
        text: '误差分布',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: '误差值',
        nameLocation: 'middle',
        nameGap: 25,
      },
      yAxis: {
        type: 'value',
        name: '频数',
        nameLocation: 'middle',
        nameGap: 40,
      },
      series: [
        {
          name: '误差分布',
          type: 'bar',
          data: error_data.x.map((x, i) => [x, error_data.y_error[i]]),
          itemStyle: {
            color: '#91cc75',
          },
        },
      ],
    };
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
            { key: 'dl', label: '深度学习模型', icon: <ThunderboltOutlined /> },
            { key: 'ml', label: '机器学习模型', icon: <ExperimentOutlined /> },
            { key: 'math', label: '数学模型', icon: <CalculatorOutlined /> },
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
          <Content style={{ background: '#fff', padding: '20px', overflow: 'auto', height: '75%' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="预测中..." />
              </div>
            ) : (() => {
              const predictionData = currentMenu === 'dl' ? dlPredictionData : 
                                    currentMenu === 'ml' ? mlPredictionData : 
                                    mathPredictionData;
              
              return predictionData ? (
              <div>
                <Card 
                  title="预测指标" 
                  style={{ marginBottom: 20 }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <Typography.Text type="secondary">RMSE</Typography.Text>
                      <Typography.Title level={4} style={{ margin: '8px 0' }}>
                        {predictionData.data.metrics.rmse.toFixed(4)}
                      </Typography.Title>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Typography.Text type="secondary">MAE</Typography.Text>
                      <Typography.Title level={4} style={{ margin: '8px 0' }}>
                        {predictionData.data.metrics.mae.toFixed(4)}
                      </Typography.Title>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Typography.Text type="secondary">R²</Typography.Text>
                      <Typography.Title level={4} style={{ margin: '8px 0' }}>
                        {predictionData.data.metrics.r2.toFixed(4)}
                      </Typography.Title>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Typography.Text type="secondary">SMAPE</Typography.Text>
                      <Typography.Title level={4} style={{ margin: '8px 0' }}>
                        {predictionData.data.metrics.smape.toFixed(2)}%
                      </Typography.Title>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, padding: '8px', background: '#f5f5f5', borderRadius: 4 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      模型路径: {predictionData.data.model_path}
                    </Typography.Text>
                  </div>
                </Card>

                <Tabs
                  defaultActiveKey="line"
                  style={{ height: '100%' }}
                  items={[
                    {
                      key: 'line',
                      label: '预测曲线',
                      children: (
                        <ReactECharts
                          option={getPredictionLineOption()}
                          style={{ height: 'calc(100vh - 400px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                    {
                      key: 'error',
                      label: '误差分布',
                      children: (
                        <ReactECharts
                          option={getErrorDistributionOption()}
                          style={{ height: 'calc(100vh - 400px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                  ]}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                <ThunderboltOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <Typography.Title level={4} style={{ color: '#999' }}>
                  请配置参数并开始预测
                </Typography.Title>
                <Typography.Text>
                  选择模型类型，输入模型路径和测试数据路径，然后点击"开始预测"按钮
                </Typography.Text>
              </div>
            );
            })()}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default ModelPredictionView;
