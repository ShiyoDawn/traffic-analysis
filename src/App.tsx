import { useState, useRef } from 'react';
import { Layout, Form, Typography, Space, Upload, message, Button, Steps, Radio } from 'antd';
import { GithubOutlined, MailOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import DataAnalysisView from './components/DataAnalysisView';
import DataProcessingView from './components/DataProcessingView';
import DataGenerationView from './components/DataGenerationView';
import ModelTrainingView from './components/ModelTrainingView';
import ModelPredictionView from './components/ModelPredictionView';
import './App.css';
import StartView from './components/StartView';

export type CityType = 'milan' | 'trento';

export interface CityConfig {
  type: CityType;
  cities: string[];
  geoJsonPath: string;
  displayName: string;
  geoJsonPropertyName: string; // GeoJSON中地区名称的属性名
}

const { Header } = Layout;
const { Title } = Typography;

// 城市数据配置
export const MILAN_CITIES = [
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

export const TRENTO_CITIES = [
  'Ala', 'Albiano', 'Aldeno', 'Amblar', 'Andalo', 'Arco', 'Avio', 'Baselga di Pinè', 'Bedollo',
  'Bersone', 'Besenello', 'Bezzecca', 'Bieno', 'Bleggio Inferiore', 'Bleggio Superiore', 'Bocenago',
  'Bolbeno', 'Bondo', 'Bondone', 'Borgo Valsugana', 'Bosentino', 'Breguzzo', 'Brentonico', 'Bresimo',
  'Brez', 'Brione', 'Caderzone', 'Cagnò', 'Calavino', 'Calceranica Al Lago', 'Caldes', 'Caldonazzo',
  'Calliano', 'Campitello Di Fassa', 'Campodenno', 'Canal San Bovo', 'Canazei', 'Capriana', 'Carano',
  'Carisolo', 'Carzano', 'Castel Condino', 'Castelfondo', 'Castello Tesino', 'Castello-Molina Di Fiemme',
  'Castelnuovo', 'Cavalese', 'Cavareno', 'Cavedago', 'Cavedine', 'Cavizzana', 'Cembra', 'Centa San Nicolò',
  'Cimego', 'Cimone', 'Cinte Tesino', 'Cis', 'Civezzano', 'Cles', 'Cloz', 'Commezzadura', 'Concei',
  'Condino', 'Coredo', 'Croviana', 'Cunevo', 'Daiano', 'Dambel', 'Daone', 'Darè', 'Denno', 'Dimaro',
  'Don', 'Dorsino', 'Drena', 'Dro', 'Faedo', 'Fai Della Paganella', 'Faver', 'Fiavè', 'Fiera Di Primiero',
  'Fierozzo', 'Flavon', 'Folgaria', 'Fondo', 'Fornace', 'Frassilongo', 'Garniga Terme', 'Giovo', 'Giustino',
  'Grauno', 'Grigno', 'Grumes', 'Imer', 'Isera', 'Ivano-Fracena', 'Lardaro', 'Lasino', 'Lavarone', 'Lavis',
  'Levico Terme', 'Lisignago', 'Livo', 'Lomaso', 'Lona-Lases', 'Luserna', 'Malosco', 'Malè', 'Massimeno',
  'Mazzin', 'Mezzana', 'Mezzano', 'Mezzocorona', 'Mezzolombardo', 'Moena', 'Molina Di Ledro', 'Molveno',
  'Monclassico', 'Montagne', 'Mori', 'Nago-Torbole', 'Nanno', 'Nave San Rocco', 'Nogaredo', 'Nomi',
  'Novaledo', 'Ospedaletto', 'Ossana', 'Padergnone', 'Palù del Fersina', 'Panchià', 'Peio', 'Pellizzano',
  'Pelugo', 'Pergine Valsugana', 'Pieve Di Bono', 'Pieve Di Ledro', 'Pieve Tesino', 'Pinzolo', 'Pomarolo',
  'Pozza Di Fassa', 'Praso', 'Predazzo', 'Preore', 'Prezzo', 'Rabbi', 'Ragoli', 'Revò', 'Riva Del Garda',
  'Romallo', 'Romeno', 'Roncegno', 'Ronchi Valsugana', 'Roncone', 'Ronzo-Chienis', 'Ronzone', 'Rovereto',
  'Roverè della Luna', 'Ruffrè', 'Rumo', 'Sagron Mis', 'Samone', 'San Lorenzo In Banale',
  'San Michele all\' Adige', 'Sant\' Orsola Terme', 'Sanzeno', 'Sarnonico', 'Scurelle', 'Segonzano',
  'Sfruz', 'Siror', 'Smarano', 'Soraga', 'Sover', 'Spera', 'Spiazzo', 'Spormaggiore', 'Sporminore',
  'Stenico', 'Storo', 'Strembo', 'Strigno', 'Taio', 'Tassullo', 'Telve', 'Telve Di Sopra', 'Tenna',
  'Tenno', 'Terlago', 'Terragnolo', 'Terres', 'Terzolas', 'Tesero', 'Tiarno Di Sopra', 'Tiarno Di Sotto',
  'Tione Di Trento', 'Ton', 'Tonadico', 'Torcegno', 'Trambileno', 'Transacqua', 'Trento', 'Tres', 'Tuenno',
  'Valda', 'Valfloriana', 'Vallarsa', 'Varena', 'Vattaro', 'Vermiglio', 'Vervò', 'Vezzano', 'Vignola-Falesina',
  'Vigo Di Fassa', 'Vigo Rendena', 'Vigolo Vattaro', 'Villa Agnedo', 'Villa Lagarina', 'Villa Rendena',
  'Volano', 'Zambana', 'Ziano Di Fiemme', 'Zuclo'
];

const chromosome_lengths: Record<string, number> = {
  'chr1': 248956422,
  'chr2': 242193529,
  'chr3': 198295559,
  'chr4': 190214555,
  'chr5': 181538259,
  'chr6': 170805979,
  'chr7': 159345973,
  'chr8': 145138636,
  'chr9': 138394717,
  'chr10': 133797422,
  'chr11': 135086622,
  'chr12': 133275309,
  'chr13': 114364328,
  'chr14': 107043718,
  'chr15': 101991189,
  'chr16': 90338345,
  'chr17': 83257441,
  'chr18': 80373285,
  'chr19': 58617616,
  'chr20': 64444167,
  'chr21': 46709983,
  'chr22': 50818468,
  'chrX': 156040895,
  'chrY': 57227415
};

interface PredictionData {
  pred: number[];
  seq: string;
  success: boolean;
  end: string;
  start: string;
}

// 数据分析响应
interface AnalysisResponse {
  status: string;
  message: string;
  data: {
    points: Record<string, any>;
    stats: Record<string, any>;
  };
}

// 聚类分析响应
interface ClusterResponse {
  status: string;
  message: string;
  data: {
    labels: number[];
    result: any;
    cluster_stats: Record<string, any>;
  };
}

// 数据清洗响应
interface CleanResponse {
  status: string;
  message: string;
  data: {
    output_path: string;
    outlier_report: Record<string, number>;
  };
}

// 样本生成响应
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

// 训练状态响应
interface TrainingStatus {
  task_id: string;
  status: 'waiting' | 'running' | 'finished' | 'failed' | 'error';
  progress: number;
  epoch: number;
  message: string;
  result: {
    model_path: string;
    metrics: {
      mae: number;
      mse: number;
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
  } | null;
}

// 模拟预测数据
const generateMockPredictionData = (): PredictionData => {
  return {
    "end": "101000",
    "pred": [
    ],
    "seq": "",
    "start": "100000",
    "success": true
  };
};

function App() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [predictionData, setPredictionData] = useState<PredictionData | undefined>(generateMockPredictionData());
  const [maxLength, setMaxLength] = useState<number>(chromosome_lengths['chr1']);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [connectionTimeout, setConnectionTimeout] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [isStarted, setIsStarted] = useState(false);


  // 城市选择状态
  const [selectedCity, setSelectedCity] = useState<CityType>('milan');

  // 获取当前城市配置
  const getCityConfig = (): CityConfig => {
    if (selectedCity === 'milan') {
      return {
        type: 'milan',
        cities: MILAN_CITIES,
        geoJsonPath: '/milano.geojson',
        displayName: '米兰 (Milan)',
        geoJsonPropertyName: 'NIL'
      };
    } else {
      return {
        type: 'trento',
        cities: TRENTO_CITIES,
        geoJsonPath: '/trento.geojson',
        displayName: '特伦蒂诺 (Trentino)',
        geoJsonPropertyName: 'NAME_3'
      };
    }
  };

  const cityConfig = getCityConfig();

  // 保存每个步骤的数据状态
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [clusterData, setClusterData] = useState<ClusterResponse | null>(null);
  const [cleanData, setCleanData] = useState<CleanResponse | null>(null);
  const [generationData, setGenerationData] = useState<GenerationResponse | null>(null);

  // 分别保存深度学习和机器学习的训练状态
  const [dlTrainingStatus, setDlTrainingStatus] = useState<TrainingStatus | null>(null);
  const [dlTaskId, setDlTaskId] = useState<string | null>(null);
  const [mlTrainingStatus, setMlTrainingStatus] = useState<TrainingStatus | null>(null);
  const [mlTaskId, setMlTaskId] = useState<string | null>(null);
  const [mathTrainingStatus, setMathTrainingStatus] = useState<TrainingStatus | null>(null);
  const [mathTaskId, setMathTaskId] = useState<string | null>(null);
  const [bertTrainingStatus, setBertTrainingStatus] = useState<TrainingStatus | null>(null);
  const [bertTaskId, setBertTaskId] = useState<string | null>(null);
  const [feTrainingStatus, setFeTrainingStatus] = useState<TrainingStatus | null>(null);
  const [feTaskId, setFeTaskId] = useState<string | null>(null);

  // 模型预测数据状态
  const [dlPredictionData, setDlPredictionData] = useState<any>(null);
  const [mlPredictionData, setMlPredictionData] = useState<any>(null);
  const [mathPredictionData, setMathPredictionData] = useState<any>(null);

  const handleChromosomeChange = (value: string) => {
    setMaxLength(chromosome_lengths[value]);
    // 重置start和end
    form.setFieldsValue({
      start: 10000,
      end: Math.min(10100, chromosome_lengths[value])
    });
  };

  const handleSubmit = async (values: any) => {
    console.log('param:', values);

    if (!uploadedFile) {
      messageApi.error('Please upload .h5ad file！');
      return;
    }

    setLoading(true);
    setProgress(0);
    setConnectionTimeout(false);

    // 清除之前的超时计时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 设置5秒超时，如果进度仍为0则显示 Binning data
    timeoutRef.current = window.setTimeout(() => {
      if (progress === 0) {
        setConnectionTimeout(true);
      }
    }, 5000);

    // 关闭之前的 EventSource 连接（如果存在）
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // 创建 SSE 连接监听进度
    const evtSource = new EventSource("http://211.87.232.152:13333/melody/getDataProgress");
    eventSourceRef.current = evtSource;

    evtSource.onmessage = (event) => {
      const currentProgress = parseFloat(event.data);
      console.log(`进度：${currentProgress}%`);
      setProgress(currentProgress);

      // 如果收到进度更新，清除超时计时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (currentProgress >= 100) {
        evtSource.close();
        eventSourceRef.current = null;
      }
    };

    evtSource.onerror = (error) => {
      console.error('SSE 连接错误:', error);
      evtSource.close();
      eventSourceRef.current = null;
    };

    try {
      // 准备表单数据
      const formData = new FormData();
      formData.append('chr', values.chromosome);
      formData.append('start', values.start.toString());
      formData.append('end', values.end.toString());
      formData.append('h5ad', uploadedFile);

      // 发送POST请求
      const response = await fetch('http://211.87.232.152:13333/melody/getData', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PredictionData = await response.json();

      if (data.success) {
        setPredictionData(data);
        messageApi.success('Data loaded！');
        setProgress(100); // 确保进度达到100%
      } else {
        messageApi.error('Data loading failed');
      }
    } catch (error) {
      console.error('Request failed:', error);
      messageApi.error('Failed to request, please check your network or server status');
    } finally {
      setLoading(false);
      // 清理超时计时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // 清理 EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  };

  const handleContactUs = () => {
    window.open('mailto:contact@example.com', '_blank');
  };

  const handleGitHub = () => {
    window.open('https://github.com', '_blank');
  };

  const uploadProps: UploadProps = {
    name: 'file',
    maxCount: 1,
    beforeUpload: (file) => {
      const isH5ad = file.name.endsWith('.h5ad');
      if (!isH5ad) {
        messageApi.error('Accept .h5ad File Only！');
        return Upload.LIST_IGNORE;
      }
      // 保存文件到state
      setUploadedFile(file);
      messageApi.success(`${file.name} File uploaded`);
      return false; // 阻止自动上传，手动处理
    },
    onChange: (info) => {
      // 只保留 .h5ad 文件
      const validFiles = info.fileList.filter(file =>
        file.name && file.name.endsWith('.h5ad')
      );

      if (validFiles.length === 0) {
        setUploadedFile(null);
      } else if (validFiles.length > 0) {
        // 只保留最后一个有效文件
        setUploadedFile(validFiles[validFiles.length - 1].originFileObj || null);
      }
    },
    onRemove: () => {
      setUploadedFile(null);
      messageApi.info('File removed');
    }
  };

  // 渲染不同步骤的内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // 数据分析
        return (
          <DataAnalysisView
            analysisData={analysisData}
            setAnalysisData={setAnalysisData}
            clusterData={clusterData}
            setClusterData={setClusterData}
            cityConfig={cityConfig}
          />
        );

      case 1: // 数据处理
        return (
          <DataProcessingView
            cleanData={cleanData}
            setCleanData={setCleanData}
            cityConfig={cityConfig}
          />
        );

      case 2: // 数据生成
        return (
          <DataGenerationView
            generationData={generationData}
            setGenerationData={setGenerationData}
            cityConfig={cityConfig}
          />
        );

      case 3: // 模型训练
        return (
          <ModelTrainingView
            dlTrainingStatus={dlTrainingStatus}
            setDlTrainingStatus={setDlTrainingStatus}
            dlTaskId={dlTaskId}
            setDlTaskId={setDlTaskId}
            mlTrainingStatus={mlTrainingStatus}
            setMlTrainingStatus={setMlTrainingStatus}
            mlTaskId={mlTaskId}
            setMlTaskId={setMlTaskId}
            mathTrainingStatus={mathTrainingStatus}
            setMathTrainingStatus={setMathTrainingStatus}
            mathTaskId={mathTaskId}
            setMathTaskId={setMathTaskId}
            bertTrainingStatus={bertTrainingStatus}
            setBertTrainingStatus={setBertTrainingStatus}
            bertTaskId={bertTaskId}
            setBertTaskId={setBertTaskId}
            feTrainingStatus={feTrainingStatus}
            setFeTrainingStatus={setFeTrainingStatus}
            feTaskId={feTaskId}
            setFeTaskId={setFeTaskId}
            cityConfig={cityConfig}
          />
        );

      case 4: // 模型加载与预测
        return (
          <ModelPredictionView
            dlPredictionData={dlPredictionData}
            setDlPredictionData={setDlPredictionData}
            mlPredictionData={mlPredictionData}
            setMlPredictionData={setMlPredictionData}
            mathPredictionData={mathPredictionData}
            setMathPredictionData={setMathPredictionData}
            cityConfig={cityConfig}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {contextHolder}
      <Layout style={{ minHeight: '100vh', maxHeight: '100vh', minWidth: '900px', overflow: 'hidden' }}>
        {/* Navigation Bar */}
        <Header style={{
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0',
          height: '65px',
          minWidth: '900px',
          zIndex:'10'
        }}>
          <Space size="large" align="center">
            <Title level={3} style={{ color: '#1890ff', margin: 0 }} onClick={() => { setIsStarted(false); setCurrentStep(0); }} >
              Traffic Analysis
            </Title>
            <Radio.Group
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              buttonStyle="solid"
              size="middle"
            >
              <Radio.Button value="milan">米兰 Milan</Radio.Button>
              <Radio.Button value="trento">特伦蒂诺 Trentino</Radio.Button>
            </Radio.Group>
          </Space>
          <Space size="middle">
            <Button
              icon={<MailOutlined />}
              onClick={handleContactUs}
            >
              Contact Us
            </Button>
            <Button
              icon={<GithubOutlined />}
              onClick={handleGitHub}
            >
              GitHub
            </Button>
          </Space>
        </Header>

        {!isStarted ? (
             <StartView onStart={() => setIsStarted(true)} /> 
        ) : (
          <>
            <Steps
              current={currentStep}
              onChange={(step) => setCurrentStep(step)}
              style={{ padding: '10px 20px', background: '#fff', cursor: 'pointer' }}
              items={[
                {
                  title: '数据分析',
                  description: 'Data Analysis',
                },
                {
                  title: '数据处理',
                  description: 'Data Processing',
                },
                {
                  title: '数据生成',
                  description: 'Data Generation',
                },
                {
                  title: '模型训练',
                  description: 'Model Training',
                },
                {
                  title: '模型加载与预测',
                  description: 'Model Loading & Prediction',
                },
              ]}
            />
            <Layout style={{ height: `calc(100vh - 65px)`, overflow: 'hidden' }}>
              {renderStepContent()}
            </Layout>
          </>
        )}
      </Layout >

    </>
  );
}

export default App;
