import { useState } from 'react';
import {
  Layout,
  Typography,
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  message,
  Spin,
  Select,
  Switch,
  DatePicker,
} from 'antd';
import { DownloadOutlined} from '@ant-design/icons';
import type { CityConfig } from '../App';

const { Sider, Content } = Layout;
const { RangePicker } = DatePicker;

interface GenerationResponse {
  status: string;
  message: string;
  data: {
    train_samples: number;
    test_samples: number;
    output_dir: string;
    selected_cities: string[];
    train_path: string;
    test_path: string;
    map_path: string;
  };
}

interface DataGenerationViewProps {
  generationData: GenerationResponse | null;
  setGenerationData: (data: GenerationResponse | null) => void;
  cityConfig: CityConfig;
}

const DataGenerationView: React.FC<DataGenerationViewProps> = ({
  generationData,
  setGenerationData,
  cityConfig,
}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (values: any) => {
    if (!values.csv_path) {
      messageApi.error('请输入 CSV 文件路径！');
      return;
    }

    setLoading(true);

    try {
      const requestBody: any = {
        csv_path: values.csv_path,
        output_dir: values.output_dir,
        seq_len: values.seq_len || 200,
        output_len: values.output_len || 5,
        num_samples_total: values.num_samples_total || null,
        allow_overlap: values.allow_overlap !== false,
        step: values.step || 1,
        train_ratio: values.train_ratio || 0.8,
        shuffle: values.shuffle !== false,
        random_seed: values.random_seed || 42,
      };

      if (values.test_every) {
        requestBody.test_every = values.test_every;
      }

      if (values.selected_city_ids && values.selected_city_ids.length > 0) {
        requestBody.selected_city_ids = values.selected_city_ids;
      }

      if (values.time_range) {
        requestBody.time_range = [
          values.time_range[0].format('YYYY-MM-DD HH:mm:ss'),
          values.time_range[1].format('YYYY-MM-DD HH:mm:ss'),
        ];
      }

      const response = await fetch('http://localhost:5000/api/preprocess_city_samples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GenerationResponse = await response.json();

      if (data.status === 'success') {
        setGenerationData(data);
        messageApi.success('样本生成完成！');
      } else {
        messageApi.error(data.message || '样本生成失败');
      }
    } catch (error) {
      console.error('生成请求失败:', error);
      messageApi.error('生成请求失败，请检查网络或服务器状态');
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
            height: '80%',
            borderRight: '1px solid #f0f0f0',
          }}
        >
          <Spin spinning={loading}>
            <Card title="样本生成配置" style={{ marginBottom: '20px' }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleGenerate}
                initialValues={{
                  seq_len: 200,
                  output_len: 5,
                  allow_overlap: true,
                  step: 1,
                  train_ratio: 0.8,
                  test_every: 5,
                  shuffle: true,
                  random_seed: 42,
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
                  label="输出目录"
                  name="output_dir"
                  rules={[{ required: true, message: '请输入输出目录路径' }]}
                >
                  <Input
                    placeholder="例如: /path/to/output"
                    allowClear
                  />
                </Form.Item>

                <Form.Item
                  label="输入序列长度"
                  name="seq_len"
                  tooltip="时间序列输入的窗口大小"
                >
                  <InputNumber
                    min={10}
                    max={1000}
                    style={{ width: '100%' }}
                    placeholder="请输入10-1000之间的数字"
                  />
                </Form.Item>

                <Form.Item
                  label="输出序列长度"
                  name="output_len"
                  tooltip="预测的未来时间步数"
                >
                  <InputNumber
                    min={1}
                    max={100}
                    style={{ width: '100%' }}
                    placeholder="请输入1-100之间的数字"
                  />
                </Form.Item>

                <Form.Item
                  label="选择城市"
                  name="selected_city_ids"
                  tooltip="选择要生成样本的城市（可选）"
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
                      label: `${index} - ${name}`,
                      value: index,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label="时间范围"
                  name="time_range"
                  tooltip="筛选特定时间段的数据"
                >
                  <RangePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  label="样本总数"
                  name="num_samples_total"
                  tooltip="限制生成的样本数量（留空则生成所有可能样本）"
                >
                  <InputNumber
                    min={1}
                    placeholder="留空生成所有样本"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  label="允许重叠"
                  name="allow_overlap"
                  valuePropName="checked"
                  tooltip="是否允许样本之间的时间窗口重叠"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="滑动步长"
                  name="step"
                  tooltip="生成样本时的滑动窗口步长"
                >
                  <InputNumber
                    min={1}
                    max={100}
                    style={{ width: '100%' }}
                    placeholder="请输入1-100之间的数字"
                  />
                </Form.Item>

                <Form.Item
                  label="训练集比例"
                  name="train_ratio"
                  tooltip="训练集占总样本的比例"
                >
                  <InputNumber
                    min={0.1}
                    max={0.9}
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="请输入0.1-0.9之间的数字"
                  />
                </Form.Item>

                <Form.Item
                  label="测试集采样间隔"
                  name="test_every"
                  tooltip="每多少个样本选一次作为测试集（保持时间序）"
                >
                  <InputNumber
                    min={1}
                    max={20}
                    style={{ width: '100%' }}
                    placeholder="请输入1-20之间的数字"
                  />
                </Form.Item>

                <Form.Item
                  label="随机打乱"
                  name="shuffle"
                  valuePropName="checked"
                  tooltip="是否随机打乱训练集样本顺序"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="随机种子"
                  name="random_seed"
                  tooltip="设置随机种子以确保结果可重复"
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="请输入大于0的数字"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                  >
                    开始生成样本
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Spin>
        </Sider>
        <Content style={{ background: '#fff', padding: '20px', overflow: 'auto', height: '100%' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" tip="生成中..." />
            </div>
          ) : generationData ? (
            <Card title="生成结果">
              <Typography.Paragraph>
                <Typography.Text strong>状态：</Typography.Text>
                <Typography.Text type="success"> {generationData.message}</Typography.Text>
              </Typography.Paragraph>

              <Typography.Paragraph>
                <Typography.Text strong>输出目录：</Typography.Text>
                <br />
                <Typography.Text code>{generationData.data.output_dir}</Typography.Text>
              </Typography.Paragraph>

              <Typography.Paragraph>
                <Typography.Text strong>样本统计：</Typography.Text>
                <br />
                <Typography.Text style={{ display: 'block', marginLeft: '20px', marginTop: '8px' }}>
                  • 训练样本数：<Typography.Text strong>{generationData.data.train_samples}</Typography.Text>
                </Typography.Text>
                <Typography.Text style={{ display: 'block', marginLeft: '20px' }}>
                  • 测试样本数：<Typography.Text strong>{generationData.data.test_samples}</Typography.Text>
                </Typography.Text>
              </Typography.Paragraph>

              {generationData.data.selected_cities && generationData.data.selected_cities.length > 0 && (
                <Typography.Paragraph>
                  <Typography.Text strong>选择的城市：</Typography.Text>
                  <br />
                  <Typography.Text style={{ marginLeft: '20px' }}>
                    {generationData.data.selected_cities.join(', ')}
                  </Typography.Text>
                </Typography.Paragraph>
              )}

              <Typography.Paragraph>
                <Typography.Text strong>生成的文件：</Typography.Text>
                <br />
                <Typography.Text style={{ display: 'block', marginLeft: '20px', marginTop: '8px' }}>
                  • 训练集：<Typography.Text code>{generationData.data.train_path}</Typography.Text>
                </Typography.Text>
                <Typography.Text style={{ display: 'block', marginLeft: '20px' }}>
                  • 测试集：<Typography.Text code>{generationData.data.test_path}</Typography.Text>
                </Typography.Text>
                <Typography.Text style={{ display: 'block', marginLeft: '20px' }}>
                  • 城市映射：<Typography.Text code>{generationData.data.map_path}</Typography.Text>
                </Typography.Text>
              </Typography.Paragraph>
            </Card>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
              <DownloadOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <Typography.Title level={4} style={{ color: '#999' }}>
                请配置参数并开始生成样本
              </Typography.Title>
              <Typography.Text>
                配置 CSV 文件路径、序列长度、城市选择等参数，然后点击"开始生成样本"按钮
              </Typography.Text>
            </div>
          )}
        </Content>
      </Layout>
    </>
  );
};

export default DataGenerationView;
