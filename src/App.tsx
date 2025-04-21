import React, { useState, useEffect } from 'react';
import { Camera, Scan, History, Upload, Info, Gift, Shield } from 'lucide-react';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import CameraComponent from './components/Camera';
import ScanResult from './components/ScanResult';
import ScanHistory from './components/ScanHistory';
import DeviceTypePrompt from './components/DeviceTypePrompt';
import RecyclingCenters from './components/RecyclingCenters';
import SimilarDevices from './components/SimilarDevices';
import DeviceGiveaway from './components/DeviceGiveaway';
import Chat from './components/Chat';
import { RecyclabilityResult, ScanHistory as ScanHistoryType } from './types';
import { analyzeImage } from './services/aiService';
import { useSoundEffects } from './hooks/useSoundEffects';
import * as tf from '@tensorflow/tfjs';
import { ADMIN_CREDENTIALS } from './lib/supabase';

function App() {
  const [session, setSession] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<RecyclabilityResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
  const [scanHistory, setScanHistory] = useState<ScanHistoryType[]>([]);
  const [deviceName, setDeviceName] = useState('');
  const [modelLoading, setModelLoading] = useState(true);
  const [showDevicePrompt, setShowDevicePrompt] = useState(false);
  const [pendingImageAnalysis, setPendingImageAnalysis] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const { playSound } = useSoundEffects();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkIfAdmin(session?.user?.email);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkIfAdmin(session?.user?.email);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkIfAdmin = (email?: string) => {
    setIsAdmin(email === ADMIN_CREDENTIALS.email);
  };

  useEffect(() => {
    const initTensorFlow = async () => {
      try {
        await tf.ready();
        console.log('TensorFlow.js initialized');
        setModelLoading(false);
      } catch (error) {
        console.error('Failed to initialize TensorFlow.js:', error);
      }
    };

    initTensorFlow();
  }, []);

  const processImage = async (imageSrc: string, deviceType?: string) => {
    setIsAnalyzing(true);
    playSound('scan');
    
    try {
      const result = await analyzeImage(imageSrc, deviceType);
      setScanResult(result);
      playSound(result.recyclable ? 'success' : 'error');
      
      const newScan: ScanHistoryType = {
        id: Date.now().toString(),
        timestamp: new Date(),
        imageUrl: imageSrc,
        result: result,
        deviceName: deviceName || deviceType || 'Unknown Device'
      };
      
      setScanHistory(prev => [newScan, ...prev]);
    } catch (error) {
      console.error('Error analyzing image:', error);
      playSound('error');
    } finally {
      setIsAnalyzing(false);
      setPendingImageAnalysis(null);
    }
  };

  const handleCapture = async (imageSrc: string) => {
    playSound('click');
    setShowCamera(false);
    setCapturedImage(imageSrc);
    setPendingImageAnalysis(imageSrc);
    setShowDevicePrompt(true);
  };

  const handleDeviceTypeSubmit = (deviceType: string) => {
    playSound('click');
    setShowDevicePrompt(false);
    if (pendingImageAnalysis) {
      setDeviceName(deviceType);
      processImage(pendingImageAnalysis, deviceType);
    }
  };

  const handleDeviceTypeSkip = () => {
    playSound('click');
    setShowDevicePrompt(false);
    if (pendingImageAnalysis) {
      processImage(pendingImageAnalysis);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      playSound('click');
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        handleCapture(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectHistory = (scan: ScanHistoryType) => {
    playSound('click');
    setCapturedImage(scan.imageUrl);
    setScanResult(scan.result);
    setDeviceName(scan.deviceName || '');
    setActiveTab('scan');
  };

  const handleDeleteHistory = (id: string) => {
    playSound('notification');
    setScanHistory(prev => prev.filter(scan => scan.id !== id));
  };

  const handleTabChange = (tab: string) => {
    playSound('click');
    setActiveTab(tab);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  if (!session) {
    return <Auth onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center mb-4">
              <Info size={20} className="text-gray-500 mr-2" />
              <p className="text-gray-700">Scan electronic devices to check their recyclability and get disposal instructions.</p>
            </div>
            
            {modelLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <p className="text-blue-700 text-sm">Loading AI model...</p>
                </div>
              </div>
            )}
            
            {capturedImage && (
              <div className="mb-4">
                <div className="relative">
                  <img 
                    src={capturedImage} 
                    alt="Captured device" 
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        playSound('click');
                        setShowCamera(true);
                      }}
                      className="bg-white text-gray-800 rounded-full p-2"
                    >
                      <Camera size={24} />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Device name (optional)"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  playSound('click');
                  setShowCamera(true);
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors transform hover:scale-105"
                disabled={modelLoading}
              >
                <Camera size={20} className="mr-2" />
                <span>Scan Device</span>
              </button>
              
              <label className={`flex-1 bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer transform hover:scale-105 ${modelLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload size={20} className="mr-2" />
                <span>Upload Image</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden"
                  disabled={modelLoading}
                />
              </label>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'scan' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('scan')}
            >
              <div className="flex items-center">
                <Scan size={20} className="mr-2" />
                <span>Scan Results</span>
              </div>
            </button>
            <button
              className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'history' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('history')}
            >
              <div className="flex items-center">
                <History size={20} className="mr-2" />
                <span>History</span>
              </div>
            </button>
            <button
              className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'giveaway' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('giveaway')}
            >
              <div className="flex items-center">
                <Gift size={20} className="mr-2" />
                <span>Device Giveaway</span>
              </div>
            </button>
            {isAdmin && (
              <button
                className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'admin' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleTabChange('admin')}
              >
                <div className="flex items-center">
                  <Shield size={20} className="mr-2" />
                  <span>Admin</span>
                </div>
              </button>
            )}
          </div>
        </div>
        
        {activeTab === 'scan' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ScanResult result={scanResult} isLoading={isAnalyzing} />
              
              {scanResult && deviceName && (
                <div className="mt-6">
                  <SimilarDevices deviceType={deviceName} />
                </div>
              )}
            </div>
            
            <div>
              <RecyclingCenters userLocation={userLocation} />
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <ScanHistory 
            history={scanHistory} 
            onSelect={handleSelectHistory} 
            onDelete={handleDeleteHistory} 
          />
        )}
        
        {activeTab === 'giveaway' && <DeviceGiveaway />}
        
        {activeTab === 'admin' && isAdmin && <AdminPanel />}
      </main>
      
      {session && <Chat />}
      
      {showCamera && (
        <CameraComponent 
          onCapture={handleCapture} 
          onClose={() => {
            playSound('click');
            setShowCamera(false);
          }} 
        />
      )}

      {showDevicePrompt && (
        <DeviceTypePrompt 
          onSubmit={handleDeviceTypeSubmit}
          onSkip={handleDeviceTypeSkip}
        />
      )}
    </div>
  );
};

export default App;