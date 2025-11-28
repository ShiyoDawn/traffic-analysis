import { useState } from 'react';
import {
  Layout,
  Typography,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Card,
  message,
  Spin,
} from 'antd';
import {SafetyCertificateOutlined} from '@ant-design/icons';
import type { CityConfig } from '../App';

const { Sider, Content } = Layout;
const { Option } = Select;

interface CleanResponse {
  status: string;
  message: string;
  data: {
    output_path: string;
    outlier_report: Record<string, number>;
  };
}

interface DataProcessingViewProps {
  cleanData: CleanResponse | null;
  setCleanData: (data: CleanResponse | null) => void;
  cityConfig: CityConfig;
}

const DataProcessingView: React.FC<DataProcessingViewProps> = ({
  cleanData,
  setCleanData,
  cityConfig,
}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const handleClean = async (values: any) => {
    if (!values.csv_path) {
      messageApi.error('请输入 CSV 文件路径！');
      return;
    }

    setLoading(true);

    try {
      const requestBody: any = {
        csv_path: values.csv_path,
        outlier_method: values.outlier_method || 'iqr',
        fill_method: values.fill_method || 'interpolate',
      };

      if (values.window_size) {
        requestBody.window_size = values.window_size;
      }

      if (values.z_thresh) {
        requestBody.z_thresh = values.z_thresh;
      }

      if (values.output_name) {
        requestBody.output_name = values.output_name;
      }

      const response = await fetch('http://localhost:5000/api/clean', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CleanResponse = await response.json();
      
      if (data.status === 'success') {
        setCleanData(data);
        messageApi.success('数据清洗完成！');
      } else {
        messageApi.error(data.message || '数据清洗失败');
      }
    } catch (error) {
      console.error('清洗请求失败:', error);
      messageApi.error('清洗请求失败，请检查网络或服务器状态');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Layout style={{ height: '100%', overflow: 'hidden' }}>
        <Sider 
          width="25%" 
          style={{ 
            background: '#fff', 
            padding: '20px',
            overflow: 'auto',
            height: '100%',
            borderRight: '1px solid #f0f0f0',
          }}
        >
          <Spin spinning={loading}>
            <Card title="数据清洗配置" style={{ marginBottom: '20px' }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleClean}
                initialValues={{
                  window_size: 50,
                  z_thresh: 3.0,
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
                  label="异常值检测方法"
                  name="outlier_method"
                >
                  <Select placeholder="请选择异常值检测方法" allowClear>
                    <Option value="iqr">IQR (四分位距)</Option>
                    <Option value="zscore">Z-Score (Z分数)</Option>
                    <Option value="window">Window (滑动窗口)</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="缺失值填补方法"
                  name="fill_method"
                >
                  <Select placeholder="请选择缺失值填补方法" allowClear>
                    <Option value="mean">均值填充</Option>
                    <Option value="median">中位数填充</Option>
                    <Option value="ffill">前向填充</Option>
                    <Option value="bfill">后向填充</Option>
                    <Option value="interpolate">插值填充</Option>
                    <Option value="none">不填充</Option>
                  </Select>
                </Form.Item>

                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.outlier_method !== currentValues.outlier_method}>
                  {({ getFieldValue }) => {
                    const method = getFieldValue('outlier_method');
                    if (method === 'zscore' || method === 'window') {
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
                    return null;
                  }}
                </Form.Item>

                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.outlier_method !== currentValues.outlier_method}>
                  {({ getFieldValue }) => {
                    const method = getFieldValue('outlier_method');
                    if (method === 'window') {
                      return (
                        <Form.Item
                          label="窗口大小"
                          name="window_size"
                        >
                          <InputNumber
                            min={3}
                            max={100}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      );
                    }
                    return null;
                  }}
                </Form.Item>

                <Form.Item
                  label="输出文件名"
                  name="output_name"
                >
                  <Input
                    placeholder="例如: cleaned_data.csv（可选）"
                    allowClear
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                  >
                    开始数据清洗
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Spin>
        </Sider>
        <Content style={{ background: '#fff', padding: '20px', overflow: 'auto', height: '100%' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" tip="清洗中..." />
            </div>
          ) : cleanData ? (
            <Card title="清洗结果">
              <Typography.Paragraph>
                <Typography.Text strong>状态：</Typography.Text>
                <Typography.Text type="success"> {cleanData.message}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph>
                <Typography.Text strong>输出文件：</Typography.Text>
                <br />
                <Typography.Text code>{cleanData.data.output_path}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph>
                <Typography.Text strong>异常值报告：</Typography.Text>
              </Typography.Paragraph>
              {Object.entries(cleanData.data.outlier_report).map(([col, count]) => (
                <Typography.Text key={col} style={{ display: 'block', marginLeft: '20px', marginBottom: '8px' }}>
                  • <Typography.Text strong>{col}:</Typography.Text> {count} 个异常值被处理
                </Typography.Text>
              ))}
            </Card>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
              <SafetyCertificateOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <Typography.Title level={4} style={{ color: '#999' }}>
                请配置参数并开始数据清洗
              </Typography.Title>
              <Typography.Text>
                配置 CSV 文件路径、异常值检测方法和缺失值填补策略，然后点击"开始数据清洗"按钮
              </Typography.Text>
            </div>
          )}
        </Content>
      </Layout>
    </>
  );
};

export default DataProcessingView;
