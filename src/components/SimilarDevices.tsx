import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface SimilarDevicesProps {
  deviceType: string;
}

const SimilarDevices: React.FC<SimilarDevicesProps> = ({ deviceType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in when component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  if (!deviceType) {
    return null;
  }

  const searchGoogle = () => {
    const searchQuery = encodeURIComponent(`${deviceType} recycling information`);
    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
  };

  const searchEbay = () => {
    const searchQuery = encodeURIComponent(`refurbished ${deviceType}`);
    window.open(`https://www.ebay.com/sch/i.html?_nkw=${searchQuery}`, '_blank');
  };

  const searchRecyclingInfo = () => {
    const searchQuery = encodeURIComponent(`how to recycle ${deviceType}`);
    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } hover:shadow-lg`}
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Search size={20} className="mr-2 text-blue-600" />
        Find Similar Devices & Information
      </h2>
      
      <div className="space-y-3">
        <button
          onClick={searchGoogle}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors flex items-center justify-center transform hover:scale-105 transition-transform duration-300"
        >
          <Search size={18} className="mr-2" />
          Search Google for {deviceType}
        </button>
        
        <div 
          className={`space-y-3 overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <button
            onClick={searchEbay}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors flex items-center justify-center transform hover:scale-105 transition-transform duration-300"
          >
            <ExternalLink size={18} className="mr-2" />
            Find Refurbished {deviceType}s
          </button>
          
          <button
            onClick={searchRecyclingInfo}
            className="w-full bg-green-100 text-green-800 py-2 px-4 rounded hover:bg-green-200 transition-colors flex items-center justify-center transform hover:scale-105 transition-transform duration-300"
          >
            <ExternalLink size={18} className="mr-2" />
            How to Recycle {deviceType}
          </button>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-blue-600 text-sm py-2 flex items-center justify-center group"
        >
          <span className="mr-1">{isExpanded ? 'Show Less' : 'Show More Options'}</span>
          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={16} className="text-blue-600 group-hover:animate-bounce" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default SimilarDevices;