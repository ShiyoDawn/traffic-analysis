import { Layout, Typography, Menu, Form, Select, Input, InputNumber, Button, Card, Spin, message, Progress, Tabs, Checkbox } from 'antd';
import { useState, useEffect } from 'react';
import { RocketOutlined, ThunderboltOutlined, ExperimentOutlined, FunctionOutlined, BulbOutlined, ToolOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import type { CityConfig } from '../App';

const { Sider, Content } = Layout;

interface TrainingResult {
  model_path: string;
  metrics: {
    mae: number;
    rmse: number;
    r2: number;
    smape: number;
  };
  line_data: {
    total_points: number;
    x: number[];
    y_pred: number[];
    y_true: number[];
  };
  error_data: {
    x: number[];
    y_error: number[];
  };
  curve_path: string | null;
  error_path: string | null;
}

interface TrainingStatus {
  task_id: string;
  status: 'waiting' | 'running' | 'finished' | 'failed' | 'error';
  progress: number;
  epoch: number;
  message: string;
  result: TrainingResult | null;
}

interface ModelTrainingViewProps {
  dlTrainingStatus: TrainingStatus | null;
  setDlTrainingStatus: (status: TrainingStatus | null) => void;
  dlTaskId: string | null;
  setDlTaskId: (id: string | null) => void;
  mlTrainingStatus: TrainingStatus | null;
  setMlTrainingStatus: (status: TrainingStatus | null) => void;
  mlTaskId: string | null;
  setMlTaskId: (id: string | null) => void;
  mathTrainingStatus: TrainingStatus | null;
  setMathTrainingStatus: (status: TrainingStatus | null) => void;
  mathTaskId: string | null;
  setMathTaskId: (id: string | null) => void;
  bertTrainingStatus: TrainingStatus | null;
  setBertTrainingStatus: (status: TrainingStatus | null) => void;
  bertTaskId: string | null;
  setBertTaskId: (id: string | null) => void;
  feTrainingStatus: TrainingStatus | null;
  setFeTrainingStatus: (status: TrainingStatus | null) => void;
  feTaskId: string | null;
  setFeTaskId: (id: string | null) => void;
  cityConfig: CityConfig;
}

const ModelTrainingView: React.FC<ModelTrainingViewProps> = ({
  dlTrainingStatus,
  setDlTrainingStatus,
  dlTaskId,
  setDlTaskId,
  mlTrainingStatus,
  setMlTrainingStatus,
  mlTaskId,
  setMlTaskId,
  mathTrainingStatus,
  setMathTrainingStatus,
  mathTaskId,
  setMathTaskId,
  bertTrainingStatus,
  setBertTrainingStatus,
  bertTaskId,
  setBertTaskId,
  feTrainingStatus,
  setFeTrainingStatus,
  feTaskId,
  setFeTaskId,
  cityConfig,
}) => {
  const [currentMenu, setCurrentMenu] = useState('dl_training');
  
  // 为每个模型创建独立的表单实例
  const [dlForm] = Form.useForm();
  const [mlForm] = Form.useForm();
  const [mathForm] = Form.useForm();
  const [bertForm] = Form.useForm();
  const [feForm] = Form.useForm();
  
  // 为每个模型创建独立的 loading 状态
  const [dlLoading, setDlLoading] = useState(false);
  const [mlLoading, setMlLoading] = useState(false);
  const [mathLoading, setMathLoading] = useState(false);
  const [bertLoading, setBertLoading] = useState(false);
  const [feLoading, setFeLoading] = useState(false);
  
  // 为每个模型创建训练中状态（用于控制按钮禁用和持续轮询）
  const [dlTraining, setDlTraining] = useState(false);
  const [mlTraining, setMlTraining] = useState(false);
  const [mathTraining, setMathTraining] = useState(false);
  const [bertTraining, setBertTraining] = useState(false);
  const [feTraining, setFeTraining] = useState(false);
  
  const [messageApi, contextHolder] = message.useMessage();

  // 监听训练状态变化，训练完成或失败时重置训练中状态
  useEffect(() => {
    if (dlTrainingStatus?.status === 'finished' || dlTrainingStatus?.status === 'failed' || dlTrainingStatus?.status === 'error') {
      setDlTraining(false);
    }
  }, [dlTrainingStatus]);

  useEffect(() => {
    if (mlTrainingStatus?.status === 'finished' || mlTrainingStatus?.status === 'failed' || mlTrainingStatus?.status === 'error') {
      setMlTraining(false);
    }
  }, [mlTrainingStatus]);

  useEffect(() => {
    if (mathTrainingStatus?.status === 'finished' || mathTrainingStatus?.status === 'failed' || mathTrainingStatus?.status === 'error') {
      setMathTraining(false);
    }
  }, [mathTrainingStatus]);

  useEffect(() => {
    if (bertTrainingStatus?.status === 'finished' || bertTrainingStatus?.status === 'failed' || bertTrainingStatus?.status === 'error') {
      setBertTraining(false);
    }
  }, [bertTrainingStatus]);

  useEffect(() => {
    if (feTrainingStatus?.status === 'finished' || feTrainingStatus?.status === 'failed' || feTrainingStatus?.status === 'error') {
      setFeTraining(false);
    }
  }, [feTrainingStatus]);

  // 提交深度学习训练任务
  const handleTrainDL = async () => {
    try {
      const values = await dlForm.validateFields();
      setDlLoading(true);
      setDlTrainingStatus(null);

      const response = await fetch('http://localhost:5000/api/train_dl_model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const result = await response.json();

      if (result.status === 'success' && result.data?.task_id) {
        const tid = result.data.task_id;
        setDlTaskId(tid);
        setDlTraining(true); // 设置为训练中状态
        messageApi.success(result.message || '深度学习训练任务已启动');
        setDlLoading(false);
        // 轮询逻辑已移至 App.tsx，通过 useEffect 自动触发
      } else {
        setDlLoading(false);
        messageApi.error(result.message || '启动训练任务失败');
      }
    } catch (error) {
      setDlLoading(false);
      console.error('训练失败:', error);
      messageApi.error('训练请求失败');
    }
  };

  // 提交机器学习训练任务
  const handleTrainML = async () => {
    try {
      const values = await mlForm.validateFields();
      setMlLoading(true);
      setMlTrainingStatus(null);

      const response = await fetch('http://localhost:5000/api/train_ml_model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const result = await response.json();

      if (result.status === 'success' && result.data?.task_id) {
        const tid = result.data.task_id;
        setMlTaskId(tid);
        setMlTraining(true); // 设置为训练中状态
        messageApi.success(result.message || '机器学习训练任务已启动');
        setMlLoading(false);
        // 轮询逻辑已移至 App.tsx
      } else {
        setMlLoading(false);
        messageApi.error(result.message || '启动训练任务失败');
      }
    } catch (error) {
      setMlLoading(false);
      console.error('训练失败:', error);
      messageApi.error('训练请求失败');
    }
  };

  // 提交数学模型训练任务
  const handleTrainMath = async () => {
    try {
      const values = await mathForm.validateFields();
      setMathLoading(true);
      setMathTrainingStatus(null);

      const response = await fetch('http://localhost:5000/api/train_math_model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const result = await response.json();

      if (result.status === 'success' && result.data?.task_id) {
        const tid = result.data.task_id;
        setMathTaskId(tid);
        setMathTraining(true); // 设置为训练中状态
        messageApi.success(result.message || '数学模型训练任务已启动');
        setMathLoading(false);
        // 轮询逻辑已移至 App.tsx
      } else {
        setMathLoading(false);
        messageApi.error(result.message || '启动训练任务失败');
      }
    } catch (error) {
      setMathLoading(false);
      console.error('训练失败:', error);
      messageApi.error('训练请求失败');
    }
  };

  // 提交BERT模型训练任务
  const handleTrainBert = async () => {
    try {
      const values = await bertForm.validateFields();
      setBertLoading(true);
      setBertTrainingStatus(null);

      const response = await fetch('http://localhost:5000/api/train_bert_model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const result = await response.json();

      if (result.status === 'success' && result.data?.task_id) {
        const tid = result.data.task_id;
        setBertTaskId(tid);
        setBertTraining(true); // 设置为训练中状态
        messageApi.success(result.message || '模型训练任务已启动');
        setBertLoading(false);
        // 轮询逻辑已移至 App.tsx
      } else {
        setBertLoading(false);
        messageApi.error(result.message || '启动训练任务失败');
      }
    } catch (error) {
      setBertLoading(false);
      console.error('训练失败:', error);
      messageApi.error('训练请求失败');
    }
  };

  // 特征工程训练
  const handleTrainFeature = async (values: any) => {
    try {
      setFeLoading(true);
      message.loading('正在构建地理特征...', 0);
      
      // 第一步：构建地理特征
      const geoResponse = await fetch('http://localhost:5000/api/build_geo_features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          train_csv: values.train_csv,
          test_csv: values.test_csv,
          output_dir: values.output_dir || "../data/samples/",
          geojson_path: values.geojson_path || "../data/milano.geojson"
        })
      });

      message.destroy();
      
      if (!geoResponse.ok) {
        throw new Error('地理特征构建失败');
      }

      const geoResult = await geoResponse.json();
      if (geoResult.status !== 'success') {
        throw new Error(geoResult.message || '地理特征构建失败');
      }

      message.success('地理特征构建成功，开始训练...');

      // 修改路径：将 /output 改为 /samples，并在 _train.csv 或 _test.csv 前加上 "_code11111111111"
      const modifyPath = (path: string) => {
        // 先替换 /output/ 为 /samples/
        let modifiedPath = path.replace('/output/', '/samples/');
        
        // 再在 _train.csv 前加上 _code11111111111
        if (modifiedPath.includes('.csv')) {
          modifiedPath = modifiedPath.replace('.csv', '_code11111111111.csv');
        }
        // 在 _test.csv 前加上 _code11111111111
        if (modifiedPath.includes('_test.csv')) {
          modifiedPath = modifiedPath.replace('_test.csv', '_code11111111111_test.csv');
        }
        
        return modifiedPath;
      };

      // 第二步：训练特征模型
      const trainResponse = await fetch('http://localhost:5000/api/train_feature_model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_name: values.model_name || 'lgb',
          features: {
            time_basic: values.time_basic ?? true,
            weekend: values.weekend ?? true,
            season: values.season ?? true,
            holiday: values.holiday ?? false,
            cyclic_hour: values.cyclic_hour ?? true,
            duration: values.duration ?? true,
            cross_flags: values.cross_flags ?? true,
            lag: values.lag ?? true,
            rolling: values.rolling ?? true,
            diff: values.diff ?? true,
            geo: values.geo ?? true,
          },
          train_csv: modifyPath(values.train_csv),
          test_csv: modifyPath(values.test_csv),
          plot_figures: values.plot_figures ?? false,
          verbose: values.verbose ?? true,
          save_dir: values.save_dir || "./figures",
          bins: values.bins || 50
        })
      });

      if (!trainResponse.ok) {
        throw new Error('特征工程训练请求失败');
      }

      const result = await trainResponse.json();
      if (result.status === 'success' && result.data?.task_id) {
        const taskId = result.data.task_id;
        setFeTaskId(taskId);
        setFeTrainingStatus({
          task_id: taskId,
          status: 'running',
          progress: 0,
          epoch: 0,
          message: '特征工程训练已启动',
          result: null
        });
        setFeTraining(true); // 设置为训练中状态
        message.success('特征工程训练已启动');
        setFeLoading(false);
        // 轮询逻辑已移至 App.tsx
      } else {
        setFeLoading(false);
        throw new Error(result.message || '特征工程训练启动失败');
      }
    } catch (error: any) {
      setFeLoading(false);
      message.error(`特征工程训练失败: ${error.message}`);
      console.error('特征工程训练失败:', error);
    }
  };

  // 渲染侧边栏配置内容
  const renderSiderContent = () => {
    switch (currentMenu) {
      case 'dl_training':
        return (
          <Card title="深度学习模型训练配置">
            <Form
              key="dl_form"
              form={dlForm}
              layout="vertical"
              autoComplete="off"
              initialValues={{
                lr: 0.001,
                batch_size: 32,
                epochs: 3,
                early_stop: true,
                patience: 3,
                plot_figures: false,
                save_dir: './figures',
                bins: 50
              }}
            >
              <Form.Item label="模型名称" name="model_name" rules={[{ required: true }]}>
                <Select placeholder="请选择模型" allowClear>
                   <Select.Option value="mlp">MLP</Select.Option>
                  <Select.Option value="cnn1d">CNN1D</Select.Option>
                  <Select.Option value="rnn">RNN</Select.Option>
                  <Select.Option value="lstm">LSTM</Select.Option>
                  <Select.Option value="gru">GRU</Select.Option>
                  <Select.Option value="tcn">TCN</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="训练数据路径" name="train_csv" rules={[{ required: true }]}>
                <Input placeholder="训练数据CSV文件路径" allowClear/>
              </Form.Item>

              <Form.Item label="测试数据路径" name="test_csv" rules={[{ required: true }]}>
                <Input placeholder="测试数据CSV文件路径" />
              </Form.Item>

              <Form.Item label="优化器" name="optimizer_name" rules={[{ required: true }]}>
                <Select placeholder="请选择优化器" allowClear>
                  <Select.Option value="adam">Adam</Select.Option>
                  <Select.Option value="adamw">AdamW</Select.Option>
                  <Select.Option value="sgd">SGD</Select.Option>
                  <Select.Option value="rmsprop">RMSprop</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="损失函数" name="loss_name" rules={[{ required: true }]}>
                <Select placeholder="请选择损失函数" allowClear>
                  <Select.Option value="mse">MSE</Select.Option>
                  <Select.Option value="mae">MAE</Select.Option>
                  <Select.Option value="huber">Huber</Select.Option>
                  <Select.Option value="smoothl1">Smoothl1</Select.Option>
                  <Select.Option value="smape">SMAPE</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="学习率" name="lr" rules={[{ required: true }]}>
                <InputNumber min={0.0001} max={0.1} step={0.0001} style={{ width: '100%' }} 
                    placeholder="请输入0.0001-0.1之间的数字"/>
              </Form.Item>

              <Form.Item label="批次大小" name="batch_size" rules={[{ required: true }]}>
                <InputNumber min={1} max={256} style={{ width: '100%' }} 
                    placeholder="请输入1-256之间的数字"/>
              </Form.Item>

              <Form.Item label="训练轮数" name="epochs" rules={[{ required: true }]}>
                <InputNumber min={1} max={1000} style={{ width: '100%' }}
                    placeholder="请输入1-1000之间的数字"/>
              </Form.Item>

              <Form.Item label="早停策略" name="early_stop" valuePropName="checked" >
                <Select placeholder="请选择早停策略（默认启用）" allowClear>
                  <Select.Option value={true}>启用</Select.Option>
                  <Select.Option value={false}>禁用</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="早停耐心值" name="patience" rules={[{ required: true }]}>
                <InputNumber min={1} max={50} style={{ width: '100%' }} 
                    placeholder="请输入1-50之间的数字"/>
              </Form.Item>

              <Form.Item label="保存图表" name="plot_figures" valuePropName="checked">
                <Select placeholder="请选择是否保存图表（默认不保存）" allowClear>
                  <Select.Option value={true}>是</Select.Option>
                  <Select.Option value={false}>否</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="保存目录" name="save_dir">
                <Input placeholder="图表保存目录" />
              </Form.Item>

              <Form.Item label="直方图bins" name="bins">
                <InputNumber min={10} max={200} style={{ width: '100%' }} 
                    placeholder="请输入10-200之间的数字"/>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  onClick={handleTrainDL} 
                  loading={dlLoading} 
                  disabled={dlTraining}
                  block
                >
                  {dlTraining ? '训练中...' : '开始训练'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );
      case 'ml_training':
        return (
          <Card title="机器学习模型训练配置">
            <Form
              key="ml_form"
              form={mlForm}
              layout="vertical"
              autoComplete="off"
              initialValues={{
                model_name: 'ridge',
                batch_size: 64,
                verbose: true,
                plot_figures: false,
                save_dir: './figures',
                bins: 50,
                save_preds_path: './results/ridge_preds.csv'
              }}
            >
              <Form.Item label="模型名称" name="model_name" rules={[{ required: true }]}>
                <Select placeholder="请选择模型" allowClear>
                  <Select.Option value="linear">Linear</Select.Option>
                  <Select.Option value="ridge">Ridge</Select.Option>
                  <Select.Option value="lasso">Lasso</Select.Option>
                  <Select.Option value="elasticnet">Elasticnet</Select.Option>
                  <Select.Option value="rf">Random Forest</Select.Option>
                  <Select.Option value="extratrees">Extratrees</Select.Option>
                  <Select.Option value="gboost">GBOOST</Select.Option>
                  <Select.Option value="lightgbm">LightGBM</Select.Option>
                  <Select.Option value="xgboost">Xgboost</Select.Option>
                  <Select.Option value="catboost">Catboost</Select.Option>
                  <Select.Option value="svr">SVR</Select.Option>
                  <Select.Option value="mlp">MLP</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="训练数据路径" name="train_csv" rules={[{ required: true }]}>
                <Input placeholder="训练数据CSV文件路径" />
              </Form.Item>

              <Form.Item label="测试数据路径" name="test_csv" rules={[{ required: true }]}>
                <Input placeholder="测试数据CSV文件路径" />
              </Form.Item>

              <Form.Item label="批次大小" name="batch_size" rules={[{ required: true }]}>
                <InputNumber min={1} max={1024} style={{ width: '100%' }} 
                    placeholder="请输入1-1024之间的数字"/>
              </Form.Item>

              <Form.Item label="详细输出" name="verbose" valuePropName="checked">
                <Select placeholder="请选择是否详细（默认详细输出）" allowClear>
                  <Select.Option value={true}>是</Select.Option>
                  <Select.Option value={false}>否</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="保存图表" name="plot_figures" valuePropName="checked">
                <Select placeholder="请选择是否保存图表（默认不保存）" allowClear>
                  <Select.Option value={true}>是</Select.Option>
                  <Select.Option value={false}>否</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="图表保存目录" name="save_dir">
                <Input placeholder="图表保存目录" />
              </Form.Item>

              <Form.Item label="直方图bins" name="bins">
                <InputNumber min={10} max={200} style={{ width: '100%' }} 
                    placeholder="请输入10-200之间的数字"/>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  onClick={handleTrainML} 
                  loading={mlLoading} 
                  disabled={mlTraining}
                  block
                >
                  {mlTraining ? '训练中...' : '开始训练'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );
      case 'math_training':
        return (
          <Card title="数学模型训练配置">
            <Form
              key="math_form"
              form={mathForm}
              layout="vertical"
              autoComplete="off"
              initialValues={{
                model_name: 'persistence',
                batch_size: 64,
                verbose: true,
                max_display_points: 8000,
                plot_figures: false,
                save_dir: './figures',
                bins: 50
              }}
            >
              <Form.Item label="模型名称" name="model_name" rules={[{ required: true }]}>
                <Select placeholder="请选择模型" allowClear>
                  <Select.Option value="persistence">Persistence (持续性)</Select.Option>
                  <Select.Option value="moving_avg">Moving Average (移动平均)</Select.Option>
                  <Select.Option value="exp_smooth">Exponential Smoothing (指数平滑)</Select.Option>
                  <Select.Option value="ar">AR (自回归)</Select.Option>
                  <Select.Option value="arima">ARIMA (差分自回归移动平均)</Select.Option>
                  <Select.Option value="kalman">Kalman Filter (卡尔曼滤波)</Select.Option>
                  <Select.Option value="fourier">Fourier (傅里叶变换)</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="训练数据路径" name="train_csv" rules={[{ required: true }]}>
                <Input placeholder="训练数据CSV文件路径" />
              </Form.Item>

              <Form.Item label="测试数据路径" name="test_csv" rules={[{ required: true }]}>
                <Input placeholder="测试数据CSV文件路径" />
              </Form.Item>

              <Form.Item label="批次大小" name="batch_size" rules={[{ required: true }]}>
                <InputNumber min={1} max={1024} style={{ width: '100%' }} 
                    placeholder="请输入1-1024之间的数字"/>
              </Form.Item>

              <Form.Item label="详细输出" name="verbose" valuePropName="checked">
                <Select placeholder="请选择是否保存图表（默认详细输出）" allowClear>
                  <Select.Option value={true}>是</Select.Option>
                  <Select.Option value={false}>否</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="保存图表" name="plot_figures" valuePropName="checked">
                <Select placeholder="请选择是否保存图表（默认不保存图表）" allowClear>
                  <Select.Option value={true}>是</Select.Option>
                  <Select.Option value={false}>否</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="图表保存目录" name="save_dir">
                <Input placeholder="图表保存目录" />
              </Form.Item>

              <Form.Item label="直方图bins" name="bins">
                <InputNumber min={10} max={200} style={{ width: '100%' }} 
                    placeholder="请输入10-200之间的数字"/>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  onClick={handleTrainMath} 
                  loading={mathLoading} 
                  disabled={mathTraining}
                  block
                >
                  {mathTraining ? '训练中...' : '开始训练'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );
      case 'bert_training':
        return (
          <Card title="大模型微调配置">
            <Form
              key="bert_form"
              form={bertForm}
              layout="vertical"
              autoComplete="off"
              initialValues={{
                train_csv: 'D:/article/software_engineering/data/train.csv',
                test_csv: 'D:/article/software_engineering/data/test.csv',
                bert_path: 'D:/article/software_engineering/bert',
                epochs: 3,
                batch_size: 8,
                lr: 0.0001,
                sample_size: 5000,
                plot_figures: true,
                bins: 50,
                max_points: 8000
              }}
            >
              <Form.Item label="训练数据路径" name="train_csv" rules={[{ required: true }]}>
                <Input placeholder="训练数据CSV文件路径" />
              </Form.Item>

              <Form.Item label="测试数据路径" name="test_csv" rules={[{ required: true }]}>
                <Input placeholder="测试数据CSV文件路径" />
              </Form.Item>

             <Form.Item label="选择模型" name="model_type" valuePropName="checked">
                <Select placeholder="请选择训练使用模型" allowClear>
                  <Select.Option value={'bert'}>BERT</Select.Option>
                  <Select.Option value={'qwen'}>QWEN</Select.Option>
                  <Select.Option value={'llm_embed'}>LLM_embed</Select.Option>
                  <Select.Option value={'joint'}>Joint</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="训练轮次" name="epochs" rules={[{ required: true }]}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item label="批次大小" name="batch_size" rules={[{ required: true }]}>
                <InputNumber min={1} max={128} style={{ width: '100%' }} 
                    placeholder="请输入1-128之间的数字"/>
              </Form.Item>

              <Form.Item label="学习率" name="lr" rules={[{ required: true }]}>
                <InputNumber min={0.00001} max={0.01} step={0.00001} style={{ width: '100%' }} 
                    placeholder="请输入0.00001-0.01之间的数字"/>
              </Form.Item>

              <Form.Item label="保存图表" name="plot_figures" valuePropName="checked">
                <Select placeholder="请选择是否保存图表（默认不保存图表）" allowClear>
                  <Select.Option value={true}>是</Select.Option>
                  <Select.Option value={false}>否</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="直方图bins" name="bins">
                <InputNumber min={10} max={200} style={{ width: '100%' }} 
                    placeholder="请输入10-200之间的数字"/>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  onClick={handleTrainBert} 
                  loading={bertLoading} 
                  disabled={bertTraining}
                  block
                >
                  {bertTraining ? '训练中...' : '开始训练'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );
      
      case 'feature_engineering':
        return (
          <Card title="特征工程配置">
            <Form
              key="fe_form"
              form={feForm}
              layout="vertical"
              autoComplete="off"
              onFinish={handleTrainFeature}
              initialValues={{
                model_name: 'lgb',
                time_basic: true,
                weekend: true,
                season: true,
                holiday: false,
                cyclic_hour: true,
                duration: true,
                cross_flags: true,
                lag: true,
                rolling: true,
                diff: true,
                geo: true,
                output_dir: "../data/samples/",
                geojson_path: "../data/milano.geojson",
                plot_figures: false,
                verbose: true,
                save_dir: "./figures",
                bins: 50
              }}
            >
              <Form.Item label="模型名称" name="model_name" rules={[{ required: true }]}>
                <Select placeholder="请选择模型" allowClear>
                  <Select.Option value="lgb">LGB</Select.Option>
                  <Select.Option value="xgb">XGB</Select.Option>
                  <Select.Option value="cat">CatBoost</Select.Option>
                  <Select.Option value="rf">RandomForest</Select.Option>
                  <Select.Option value="linear">Linear</Select.Option>
                </Select>
              </Form.Item>

              <Typography.Title level={5}>特征选择</Typography.Title>
              
              <Form.Item name="time_basic" valuePropName="checked">
                <Checkbox>time_basic (时间基础特征)</Checkbox>
              </Form.Item>

              <Form.Item name="weekend" valuePropName="checked">
                <Checkbox>weekend (周末特征)</Checkbox>
              </Form.Item>

              <Form.Item name="season" valuePropName="checked">
                <Checkbox>season (季节特征)</Checkbox>
              </Form.Item>

              <Form.Item name="holiday" valuePropName="checked">
                <Checkbox>holiday (假期特征)</Checkbox>
              </Form.Item>

              <Form.Item name="cyclic_hour" valuePropName="checked">
                <Checkbox>cyclic_hour (循环小时特征)</Checkbox>
              </Form.Item>

              <Form.Item name="duration" valuePropName="checked">
                <Checkbox>duration (持续时间特征)</Checkbox>
              </Form.Item>

              <Form.Item name="cross_flags" valuePropName="checked">
                <Checkbox>cross_flags (交叉特征)</Checkbox>
              </Form.Item>

              <Form.Item name="lag" valuePropName="checked">
                <Checkbox>lag (滞后特征)</Checkbox>
              </Form.Item>

              <Form.Item name="rolling" valuePropName="checked">
                <Checkbox>rolling (滚动窗口特征)</Checkbox>
              </Form.Item>

              <Form.Item name="diff" valuePropName="checked">
                <Checkbox>diff (差分特征)</Checkbox>
              </Form.Item>

              <Form.Item name="geo" valuePropName="checked">
                <Checkbox>geo (地理特征)</Checkbox>
              </Form.Item>

              <Typography.Title level={5} style={{ marginTop: 16 }}>数据配置</Typography.Title>

              <Form.Item label="原训练数据路径" name="train_csv" rules={[{ required: true }]}>
                <Input placeholder="../data/output/train_samples_seq200_out5_overlap1_testevery5.csv" />
              </Form.Item>

              <Form.Item label="原测试数据路径" name="test_csv" rules={[{ required: true }]}>
                <Input placeholder="../data/output/test_samples_seq200_out5_overlap1_testevery5.csv" />
              </Form.Item>

              <Form.Item label="输出目录" name="output_dir">
                <Input placeholder="../data/samples/" />
              </Form.Item>

              <Form.Item label="GeoJSON路径" name="geojson_path">
                <Input placeholder="../data/milano.geojson" />
              </Form.Item>

              <Typography.Title level={5} style={{ marginTop: 16 }}>其他配置</Typography.Title>

              <Form.Item name="plot_figures" valuePropName="checked">
                <Checkbox>plot_figures (绘制图表)</Checkbox>
              </Form.Item>

              <Form.Item name="verbose" valuePropName="checked">
                <Checkbox>verbose (详细输出)</Checkbox>
              </Form.Item>

              <Form.Item label="保存目录" name="save_dir">
                <Input placeholder="./figures" />
              </Form.Item>

              <Form.Item label="Bins数量" name="bins">
                <InputNumber min={1} placeholder="50" style={{ width: '100%' }} 
                    // placeholder="请输入1-50之间的数字"
                    />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={feLoading} 
                  disabled={feTraining}
                  block
                >
                  {feTraining ? '训练中...' : '开始训练'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );
      
      default:
        return null;
    }
  };

  // 获取预测曲线图配置
  const getLineChartOption = (data: TrainingResult['line_data']) => {
    if (!data || !data.x || data.x.length === 0) return {};

    // 采样数据以减少渲染点数
    const sampleRate = Math.ceil(data.x.length / 2000);
    const sampledX = data.x.filter((_, i) => i % sampleRate === 0);
    const sampledYPred = data.y_pred.filter((_, i) => i % sampleRate === 0);
    const sampledYTrue = data.y_true.filter((_, i) => i % sampleRate === 0);

    return {
      title: {
        text: '预测结果对比图',
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
        formatter: (params: any) => {
          let result = `样本索引: ${params[0].axisValue}<br/>`;
          params.forEach((param: any) => {
            result += `${param.marker}${param.seriesName}: ${param.value.toFixed(2)}<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: ['真实值', '预测值'],
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
        data: sampledX,
        name: '样本索引',
        nameLocation: 'center',
        nameGap: 30,
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: '交通流量',
        nameLocation: 'center',
        nameGap: 50,
      },
      series: [
        {
          name: '真实值',
          type: 'line',
          data: sampledYTrue,
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#1890ff',
          },
          itemStyle: {
            color: '#1890ff',
          },
          symbol: 'circle',
          symbolSize: 4,
          showSymbol: false,
        },
        {
          name: '预测值',
          type: 'line',
          data: sampledYPred,
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#ff4d4f',
          },
          itemStyle: {
            color: '#ff4d4f',
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

  // 获取误差分布直方图配置
  const getErrorHistogramOption = (data: TrainingResult['error_data']) => {
    if (!data || !data.x || data.x.length === 0) return {};

    return {
      title: {
        text: '预测误差分布图',
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
        formatter: (params: any) => {
          const param = params[0];
          return `误差范围: ${param.name}<br/>${param.marker}样本数量: ${param.value}`;
        },
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
        data: data.x.map(x => x.toFixed(1)),
        name: '预测误差',
        nameLocation: 'center',
        nameGap: 30,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: '样本数量',
        nameLocation: 'center',
        nameGap: 50,
      },
      series: [
        {
          name: '样本数量',
          type: 'bar',
          data: data.y_error,
          itemStyle: {
            color: '#52c41a',
            opacity: 0.7,
          },
          emphasis: {
            itemStyle: {
              opacity: 1,
            },
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
          magicType: {
            type: ['bar', 'line'],
            title: {
              bar: '切换为柱状图',
              line: '切换为折线图',
            },
          },
        },
        right: 20,
        top: 10,
      },
    };
  };

  const renderContent = () => {
    switch (currentMenu) {
      case 'dl_training':
        return (
          <>
            {(dlTraining || dlTrainingStatus?.status === 'running' || dlTrainingStatus?.status === 'waiting') && dlTrainingStatus && (
              <Card title="训练进度" style={{ marginBottom: 20 }}>
                <Spin spinning={dlTrainingStatus.status === 'running' || dlTrainingStatus.status === 'waiting'}>
                  <div style={{ marginBottom: 16 }}>
                    <div>任务ID: {dlTaskId}</div>
                    <div>状态: {dlTrainingStatus.message}</div>
                  </div>
                  <Progress percent={dlTrainingStatus.progress} status={dlTrainingStatus.status === 'running' || dlTrainingStatus.status === 'waiting' ? 'active' : 'success'} />
                </Spin>
              </Card>
            )}

            {dlTrainingStatus?.status === 'finished' && dlTrainingStatus.result ? (
              <>
                <Card title="训练指标" style={{ marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><strong>MAE:</strong> {dlTrainingStatus.result.metrics.mae.toFixed(4)}</div>
                    <div><strong>RMSE:</strong> {dlTrainingStatus.result.metrics.rmse.toFixed(4)}</div>
                    <div><strong>R²:</strong> {dlTrainingStatus.result.metrics.r2.toFixed(6)}</div>
                    <div><strong>SMAPE:</strong> {dlTrainingStatus.result.metrics.smape.toFixed(6)}</div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <strong>模型路径:</strong> {dlTrainingStatus.result.model_path}
                  </div>
                </Card>

                <Tabs
                  defaultActiveKey="line_chart"
                  style={{ height: '100%' }}
                  items={[
                    {
                      key: 'line_chart',
                      label: '预测结果对比',
                      children: (
                        <ReactECharts
                          option={getLineChartOption(dlTrainingStatus.result.line_data)}
                          style={{ height: 'calc(100vh - 400px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                    {
                      key: 'error_histogram',
                      label: '误差分布',
                      children: (
                        <ReactECharts
                          option={getErrorHistogramOption(dlTrainingStatus.result.error_data)}
                          style={{ height: 'calc(100vh - 400px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                  ]}
                />
              </>
            ) : !dlTraining && !dlTrainingStatus ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                <RocketOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <Typography.Title level={4} style={{ color: '#999' }}>
                  请配置参数并开始训练
                </Typography.Title>
                <Typography.Text>
                  配置模型参数，然后点击"开始训练"按钮
                </Typography.Text>
              </div>
            ) : null}
          </>
        );
      case 'ml_training':
        return (
          <>
            {(mlTraining || mlTrainingStatus?.status === 'running' || mlTrainingStatus?.status === 'waiting') && mlTrainingStatus && (
              <Card title="训练进度" style={{ marginBottom: 20 }}>
                <Spin spinning={mlTrainingStatus.status === 'running' || mlTrainingStatus.status === 'waiting'}>
                  <div style={{ marginBottom: 16 }}>
                    <div>任务ID: {mlTaskId}</div>
                    <div>状态: {mlTrainingStatus.message}</div>
                  </div>
                  <Progress percent={mlTrainingStatus.progress} status={mlTrainingStatus.status === 'running' ? 'active' : 'success'} />
                </Spin>
              </Card>
            )}

            {mlTrainingStatus?.status === 'finished' && mlTrainingStatus.result ? (
              <>
                <Card title="训练指标" style={{ marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><strong>MAE:</strong> {mlTrainingStatus.result.metrics.mae.toFixed(4)}</div>
                    <div><strong>RMSE:</strong> {mlTrainingStatus.result.metrics.rmse ? mlTrainingStatus.result.metrics.rmse.toFixed(4) : 'N/A'}</div>
                    <div><strong>R²:</strong> {mlTrainingStatus.result.metrics.r2.toFixed(6)}</div>
                    <div><strong>SMAPE:</strong> {mlTrainingStatus.result.metrics.smape.toFixed(6)}</div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <strong>模型路径:</strong> {mlTrainingStatus.result.model_path}
                  </div>
                </Card>

                <Tabs
                  defaultActiveKey="line_chart"
                  style={{ height: '100%' }}
                  items={[
                    {
                      key: 'line_chart',
                      label: '预测结果对比',
                      children: (
                        <ReactECharts
                          option={getLineChartOption(mlTrainingStatus.result.line_data)}
                          style={{ height: 'calc(100vh - 400px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                    {
                      key: 'error_histogram',
                      label: '误差分布',
                      children: (
                        <ReactECharts
                          option={getErrorHistogramOption(mlTrainingStatus.result.error_data)}
                          style={{ height: 'calc(100vh - 400px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                  ]}
                />
              </>
            ) : !mlLoading ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                <ThunderboltOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <Typography.Title level={4} style={{ color: '#999' }}>
                  请配置参数并开始训练
                </Typography.Title>
                <Typography.Text>
                  配置模型参数，然后点击"开始训练"按钮
                </Typography.Text>
              </div>
            ) : null}
          </>
        );
      case 'math_training':
        return (
          <>
            {(mathTraining || mathTrainingStatus?.status === 'running' || mathTrainingStatus?.status === 'waiting') && mathTrainingStatus && (
              <Card title="训练进度" style={{ marginBottom: 20 }}>
                <Spin spinning={mathTrainingStatus.status === 'running' || mathTrainingStatus.status === 'waiting'}>
                  <div style={{ marginBottom: 16 }}>
                    <div>任务ID: {mathTaskId}</div>
                    <div>状态: {mathTrainingStatus.message}</div>
                  </div>
                  <Progress percent={mathTrainingStatus.progress || 0} status={mathTrainingStatus.status === 'running' ? 'active' : 'success'} />
                </Spin>
              </Card>
            )}

            {mathTrainingStatus?.status === 'finished' && mathTrainingStatus.result ? (
              <>
                <Card title="训练指标" style={{ marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><strong>MAE:</strong> {mathTrainingStatus.result.metrics.mae.toFixed(4)}</div>
                    <div><strong>RMSE:</strong> {mathTrainingStatus.result.metrics.rmse ? mathTrainingStatus.result.metrics.rmse.toFixed(4) : 'N/A'}</div>
                    <div><strong>R²:</strong> {mathTrainingStatus.result.metrics.r2.toFixed(6)}</div>
                    <div><strong>SMAPE:</strong> {mathTrainingStatus.result.metrics.smape.toFixed(6)}</div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <strong>模型路径:</strong> {mathTrainingStatus.result.model_path}
                  </div>
                </Card>

                <Tabs
                  defaultActiveKey="line_chart"
                  style={{ height: '100%' }}
                  items={[
                    {
                      key: 'line_chart',
                      label: '预测结果对比',
                      children: (
                        <ReactECharts
                          option={getLineChartOption(mathTrainingStatus.result.line_data)}
                          style={{ height: 'calc(100vh - 400px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                    {
                      key: 'error_histogram',
                      label: '误差分布',
                      children: (
                        <ReactECharts
                          option={getErrorHistogramOption(mathTrainingStatus.result.error_data)}
                          style={{ height: 'calc(100vh - 400px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                  ]}
                />
              </>
            ) : !mathTraining && !mathTrainingStatus ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                <ExperimentOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <Typography.Title level={4} style={{ color: '#999' }}>
                  请配置参数并开始训练
                </Typography.Title>
                <Typography.Text>
                  配置模型参数，然后点击"开始训练"按钮
                </Typography.Text>
              </div>
            ) : null}
          </>
        );
      case 'bert_training':
        return (
          <>
            {bertLoading && !bertTrainingStatus && (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <Typography.Title level={4} style={{ marginTop: 20 }}>
                  正在启动大模型训练任务...
                </Typography.Title>
              </div>
            )}

            {(bertTraining || bertTrainingStatus) && bertTrainingStatus && (
              <Card title="训练进度" style={{ marginBottom: 20 }}>
                <Progress 
                  percent={bertTrainingStatus.progress} 
                  status={bertTrainingStatus.status === 'failed' ? 'exception' : bertTrainingStatus.status === 'finished' ? 'success' : 'active'}
                />
                <div style={{ marginTop: 10 }}>
                  <div><strong>状态:</strong> {bertTrainingStatus.message}</div>
                  <div><strong>任务ID:</strong> {bertTrainingStatus.task_id}</div>
                  {bertTrainingStatus.epoch !== undefined && (
                    <div><strong>当前轮次:</strong> {bertTrainingStatus.epoch}</div>
                  )}
                </div>
              </Card>
            )}

            {bertTrainingStatus?.status === 'finished' && bertTrainingStatus.result ? (
              <>
                <Card title="训练指标" style={{ marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><strong>MAE:</strong> {bertTrainingStatus.result.metrics.mae.toFixed(4)}</div>
                    <div><strong>RMSE:</strong> {bertTrainingStatus.result.metrics.rmse ? bertTrainingStatus.result.metrics.rmse.toFixed(4) : 'N/A'}</div>
                    <div><strong>R²:</strong> {bertTrainingStatus.result.metrics.r2.toFixed(6)}</div>
                    <div><strong>SMAPE:</strong> {bertTrainingStatus.result.metrics.smape.toFixed(6)}</div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <strong>模型路径:</strong> {bertTrainingStatus.result.model_path}
                  </div>
                </Card>

                <Tabs
                  defaultActiveKey="line_chart"
                  style={{ height: '100%' }}
                  items={[
                    {
                      key: 'line_chart',
                      label: '预测结果对比',
                      children: (
                        <ReactECharts
                          option={getLineChartOption(bertTrainingStatus.result.line_data)}
                          style={{ height: 'calc(100vh - 400px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                    {
                      key: 'error_histogram',
                      label: '误差分布',
                      children: (
                        <ReactECharts
                          option={getErrorHistogramOption(bertTrainingStatus.result.error_data)}
                          style={{ height: 'calc(100vh - 400px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                  ]}
                />
              </>
            ) : !bertTraining && !bertTrainingStatus ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                <BulbOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <Typography.Title level={4} style={{ color: '#999' }}>
                  请配置参数并开始训练
                </Typography.Title>
                <Typography.Text>
                  配置BERT模型参数，然后点击"开始训练"按钮
                </Typography.Text>
              </div>
            ) : null}
          </>
        );
      
      case 'feature_engineering':
        return (
          <>
            {feTrainingStatus && feTrainingStatus.status === 'running' ? (
              <>
                <Card title="特征工程训练进度" style={{ marginBottom: 16 }}>
                  <Progress
                    percent={feTrainingStatus.progress || 0}
                    status="active"
                    strokeColor={{ from: '#108ee9', to: '#87d068' }}
                  />
                  <Typography.Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                    {feTrainingStatus.message || '训练中...'}
                  </Typography.Text>
                </Card>
              </>
            ) : feTrainingStatus && feTrainingStatus.status === 'finished' && feTrainingStatus.result ? (
              <>
                <Card title="特征工程训练结果" style={{ marginBottom: 16 }}>
                  <Typography.Text strong>模型保存路径：</Typography.Text>
                  <Typography.Text copyable>{feTrainingStatus.result.model_path}</Typography.Text>
                  <div style={{ marginTop: 16 }}>
                    <Typography.Text strong>评估指标：</Typography.Text>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: 8 }}>
                      <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                          <Typography.Text type="secondary">MAE</Typography.Text>
                          <Typography.Title level={4} style={{ margin: '8px 0', color: '#1890ff' }}>
                            {feTrainingStatus.result.metrics.mae.toFixed(4)}
                          </Typography.Title>
                        </div>
                      </Card>
                      <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                          <Typography.Text type="secondary">RMSE</Typography.Text>
                          <Typography.Title level={4} style={{ margin: '8px 0', color: '#52c41a' }}>
                            {feTrainingStatus.result.metrics.rmse?.toFixed(4) || 'N/A'}
                          </Typography.Title>
                        </div>
                      </Card>
                      <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                          <Typography.Text type="secondary">R²</Typography.Text>
                          <Typography.Title level={4} style={{ margin: '8px 0', color: '#722ed1' }}>
                            {feTrainingStatus.result.metrics.r2.toFixed(4)}
                          </Typography.Title>
                        </div>
                      </Card>
                      <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                          <Typography.Text type="secondary">SMAPE</Typography.Text>
                          <Typography.Title level={4} style={{ margin: '8px 0', color: '#fa8c16' }}>
                            {feTrainingStatus.result.metrics.smape.toFixed(4)}
                          </Typography.Title>
                        </div>
                      </Card>
                    </div>
                  </div>
                </Card>

                <Tabs
                  defaultActiveKey="prediction_curve"
                  items={[
                    {
                      key: 'prediction_curve',
                      label: '预测曲线',
                      children: (
                        <ReactECharts
                          option={getLineChartOption(feTrainingStatus.result.line_data)}
                          style={{ height: 'calc(100vh - 400px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                    {
                      key: 'error_histogram',
                      label: '误差分布',
                      children: (
                        <ReactECharts
                          option={getErrorHistogramOption(feTrainingStatus.result.error_data)}
                          style={{ height: 'calc(100vh - 400px)', width: '100%' }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      ),
                    },
                  ]}
                />
              </>
            ) : feTrainingStatus && feTrainingStatus.status === 'error' ? (
              <Card title="训练错误" style={{ marginTop: 16 }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Typography.Title level={4} type="danger">
                    训练失败
                  </Typography.Title>
                  <Typography.Text type="danger" style={{ fontSize: '16px' }}>
                    {feTrainingStatus.message}
                  </Typography.Text>
                </div>
              </Card>
            ) : feTrainingStatus && feTrainingStatus.status === 'failed' ? (
              <Card title="训练失败" style={{ marginTop: 16 }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Typography.Title level={4} type="danger">
                    训练失败
                  </Typography.Title>
                  <Typography.Text type="danger" style={{ fontSize: '16px' }}>
                    {feTrainingStatus.message || '训练过程中发生错误'}
                  </Typography.Text>
                </div>
              </Card>
            ) : !feTraining && !feTrainingStatus ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                <ToolOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <Typography.Title level={4} style={{ color: '#999' }}>
                  请配置参数并开始训练
                </Typography.Title>
                <Typography.Text>
                  配置特征工程参数，然后点击"开始训练"按钮
                </Typography.Text>
              </div>
            ) : null}
          </>
        );
      
      default:
        return null;
    }
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
            { key: 'dl_training', label: '深度学习训练', icon: <RocketOutlined /> },
            { key: 'ml_training', label: '机器学习训练', icon: <ThunderboltOutlined /> },
            { key: 'math_training', label: '数学模型训练', icon: <FunctionOutlined /> },
            { key: 'bert_training', label: '大模型训练', icon: <BulbOutlined /> },
            { key: 'feature_engineering', label: '特征工程', icon: <ToolOutlined /> },
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
            {renderSiderContent()}
          </Sider>
          <Content style={{ background: '#fff', padding: '20px', overflow: 'auto', height: '75%' }}>
            {(dlLoading || mlLoading || mathLoading || bertLoading || feLoading) && !dlTrainingStatus && !mlTrainingStatus && !mathTrainingStatus && !bertTrainingStatus && !feTrainingStatus ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="训练中..." />
              </div>
            ) : (
              renderContent()
            )}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default ModelTrainingView;
