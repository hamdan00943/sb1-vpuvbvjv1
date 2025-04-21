import React, { useEffect, useState } from 'react';
import { RecyclabilityResult } from '../types';
import { Recycle, AlertTriangle, Check, X, Info, Cpu } from 'lucide-react';

interface ScanResultProps {
  result: RecyclabilityResult | null;
  isLoading: boolean;
}

const ScanResult: React.FC<ScanResultProps> = ({ result, isLoading }) => {
  const [showAiBadge, setShowAiBadge] = useState(false);
  const [animateMaterials, setAnimateMaterials] = useState(false);
  
  useEffect(() => {
    if (result) {
      // Show AI badge animation when result is received
      setShowAiBadge(true);
      const timer = setTimeout(() => {
        setShowAiBadge(false);
      }, 3000);
      
      // Animate materials list
      setAnimateMaterials(true);
      
      return () => clearTimeout(timer);
    }
  }, [result]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center justify-center h-32">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 animate-pulse">AI analyzing image...</p>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mt-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mt-4"></div>
        <div className="h-24 bg-gray-200 rounded w-full mt-6"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center justify-center text-gray-500 h-64">
          <Info size={48} className="mb-4" />
          <p className="text-center text-lg">Scan a device to see recyclability information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative transition-all duration-300 hover:shadow-lg">
      {showAiBadge && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full flex items-center animate-pulse">
          <Cpu size={16} className="mr-1" />
          <span className="text-sm font-medium">AI Analyzed</span>
        </div>
      )}
      
      <div className="flex items-center justify-center mb-6">
        {result.recyclable ? (
          <div className="bg-green-100 p-4 rounded-full transform transition-transform duration-500 hover:scale-110 animate-[bounce_1s_ease-in-out]">
            <Recycle size={48} className="text-green-600" />
          </div>
        ) : (
          <div className="bg-red-100 p-4 rounded-full transform transition-transform duration-500 hover:scale-110 animate-[bounce_1s_ease-in-out]">
            <AlertTriangle size={48} className="text-red-600" />
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-center mb-2 transition-all duration-300 transform hover:scale-105">
        {result.recyclable ? 'Recyclable' : 'Not Recyclable'}
      </h2>
      
      <div className="flex justify-center mb-4">
        <div className="bg-gray-200 w-full max-w-xs h-4 rounded-full overflow-hidden">
          <div 
            className={`h-full ${result.recyclable ? 'bg-green-600' : 'bg-red-600'} transition-all duration-1000 ease-out`}
            style={{ width: `${result.confidence * 100}%`, transitionProperty: 'width' }}
          ></div>
        </div>
        <span className="ml-2 text-sm text-gray-600">{Math.round(result.confidence * 100)}%</span>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Materials</h3>
        <div className="space-y-2">
          {result.materials.map((material, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-2 rounded-md transition-all duration-300 ${
                material.recyclable ? 'hover:bg-green-50' : 'hover:bg-red-50'
              } ${animateMaterials ? 'animate-[fadeIn_0.5s_ease-in-out_forwards]' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center">
                {material.recyclable ? (
                  <Check size={16} className="text-green-600 mr-2" />
                ) : (
                  <X size={16} className="text-red-600 mr-2" />
                )}
                <span>{material.name}</span>
              </div>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 h-2 rounded-full mr-2 overflow-hidden">
                  <div 
                    className={`h-full ${material.recyclable ? 'bg-green-500' : 'bg-red-500'} transition-all duration-1000 ease-out`}
                    style={{ width: `${material.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{material.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 p-4 border border-gray-200 rounded-lg transition-all duration-300 hover:border-green-300 hover:bg-green-50">
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          <Info size={18} className="mr-2 text-green-600" />
          Disposal Instructions
        </h3>
        <p className="text-gray-700">{result.disposalInstructions}</p>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg transition-all duration-300 hover:border-blue-300 hover:bg-blue-50">
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          <Info size={18} className="mr-2 text-blue-600" />
          Environmental Impact
        </h3>
        <p className="text-gray-700">{result.environmentalImpact}</p>
      </div>
    </div>
  );
};

export default ScanResult;