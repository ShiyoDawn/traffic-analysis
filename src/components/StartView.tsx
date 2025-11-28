import React from 'react';
import { Layout, Button, Typography } from 'antd';
import HyperSpeed from './HyperSpeed';
import MapChart from './MapChart';

const { Title } = Typography;

interface StartViewProps {
    onStart?: () => void; // 提供回调
}


const StartView: React.FC<StartViewProps> = ({ onStart }) => {

    return (
        <Layout
            style={{
                minWidth: '900px',
                minHeight: '600px',
                width: '100vw',
                height: `calc(100vh - 70px)`,
                display: 'flex',
                flexDirection: 'column',
                background: '#ffffffff',
            }}
        >

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    width: '100vw',
                    minWidth: '900px',
                    height: 'calc(100vh - 65px)',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 65,
                        left: 0,
                        zIndex: 0,
                        width: '100vw',
                        height: 'calc(100vh - 65px)',
                        // border: "5px solid #000000ff",
                        // borderRadius: borderRadius,
                        overflow: "hidden",
                        display: "inline-block"
                    }}
                >
                    <HyperSpeed />
                </div>

                <div
                    style={{
                        position: 'relative',
                        top: 0,
                        left: 0,
                        width: '900px',
                        minWidth: '900px',
                        height: '400px',
                        zIndex: 2,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        // border: "5px solid #000000ff",
                        padding:'40px',
                    }}
                >
                    <h1 style={{ fontSize: '60px', fontWeight: 'bold' }}>
                        Welcome to <br /> Traffic Analysis System
                    </h1>
                    <p style={{ fontSize: '40px' }}>
                        Milan or Trentino
                    </p>
                    <Button type="primary" onClick={onStart}
                        style={{ width: '240px', height: '50px', fontSize: '30px', borderRadius: '24px' }}
                    >
                        开始 Start
                    </Button>
                    <p style={{ fontSize: '20px' }}>
                        Select the corresponding city above.
                    </p>
                </div>

                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        flex: 1,
                        top: 0,
                        right: 0,
                        width: '800px',
                        height: '550px',
                        // border: "5px solid #000000ff",
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '800px',
                            height: '550px',
                            // background: '#cbe5ff',
                            borderRadius: '8px',
                        }}>
                        <MapChart/>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default StartView;