import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, X, CameraOff, RefreshCw } from 'lucide-react';

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  const handleUserMedia = () => {
    setIsCameraReady(true);
    setCameraError(false);
    
    // Show scanning overlay animation
    setTimeout(() => {
      setShowOverlay(true);
    }, 500);
  };

  const handleCameraError = () => {
    setCameraError(true);
    setIsCameraReady(false);
  };

  const startCountdown = () => {
    setCountdown(3);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        capture();
        setCountdown(null);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, capture]);

  const retryCamera = () => {
    setCameraError(false);
    // Force webcam to remount by toggling a key
    if (webcamRef.current) {
      const videoTrack = webcamRef.current.video?.srcObject as MediaStream;
      if (videoTrack) {
        videoTrack.getTracks().forEach(track => track.stop());
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="bg-white rounded-lg overflow-hidden w-full max-w-md transform transition-transform duration-300 animate-[scaleIn_0.3s_ease-in-out]">
        <div className="p-4 bg-green-600 text-white flex justify-between items-center">
          <h3 className="text-lg font-medium">Scan Device</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="relative">
          {!cameraError ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "environment"
                }}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleCameraError}
                className="w-full h-auto"
              />
              
              {showOverlay && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-green-500 border-dashed rounded-md animate-[pulse_2s_infinite]"></div>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 animate-[scanLine_3s_ease-in-out_infinite]"></div>
                </div>
              )}
              
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="text-white text-6xl font-bold animate-[pulse_1s_infinite]">
                    {countdown}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center bg-gray-900 p-12">
              <CameraOff size={48} className="text-red-500 mb-4" />
              <p className="text-white text-center mb-4">Unable to access camera</p>
              <button
                onClick={retryCamera}
                className="bg-green-600 text-white rounded-full p-2 flex items-center"
              >
                <RefreshCw size={24} className="mr-1" />
                Retry
              </button>
            </div>
          )}
          
          {!isCameraReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white">Loading camera...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 flex justify-center">
          {!cameraError && (
            <button
              onClick={startCountdown}
              disabled={!isCameraReady || countdown !== null}
              className={`bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 transform hover:scale-110 transition-transform duration-300 ${
                countdown !== null ? 'animate-pulse' : ''
              }`}
            >
              <CameraIcon size={32} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Camera;