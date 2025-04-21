import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Check, Search } from 'lucide-react';

interface DeviceTypePromptProps {
  onSubmit: (deviceType: string) => void;
  onSkip: () => void;
}

const DEVICE_TYPES = [
  'Smartphone',
  'Laptop',
  'Tablet',
  'Desktop Computer',
  'Monitor',
  'Printer',
  'TV',
  'Game Console',
  'Camera',
  'Headphones',
  'Speaker',
  'Router',
  'External Hard Drive',
  'Keyboard',
  'Mouse',
  'Microwave',
  'Refrigerator',
  'Other'
];

const DeviceTypePrompt: React.FC<DeviceTypePromptProps> = ({ onSubmit, onSkip }) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [customType, setCustomType] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredTypes, setFilteredTypes] = useState<string[]>(DEVICE_TYPES);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in when component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = DEVICE_TYPES.filter(type => 
        type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTypes(filtered);
    } else {
      setFilteredTypes(DEVICE_TYPES);
    }
  }, [searchTerm]);

  const handleSubmit = () => {
    if (showCustomInput && customType.trim()) {
      onSubmit(customType.trim());
    } else if (selectedType) {
      onSubmit(selectedType);
    } else {
      onSkip();
    }
  };

  const handleTypeSelect = (type: string) => {
    if (type === 'Other') {
      setShowCustomInput(true);
      setSelectedType('');
    } else {
      setShowCustomInput(false);
      setSelectedType(type);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div 
        className={`bg-white rounded-lg overflow-hidden w-full max-w-md transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
          <div className="flex items-center">
            <HelpCircle size={20} className="mr-2 animate-pulse" />
            <h3 className="text-lg font-medium">What device are you scanning?</h3>
          </div>
          <button 
            onClick={onSkip}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Identifying the device type helps our AI provide more accurate recyclability information.
          </p>
          
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search device types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {showCustomInput ? (
            <div className="mb-4 animate-[fadeIn_0.3s_ease-in-out]">
              <label htmlFor="customType" className="block text-sm font-medium text-gray-700 mb-1">
                Enter device type:
              </label>
              <input
                type="text"
                id="customType"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="e.g., Smart Watch, Air Purifier"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-4 max-h-60 overflow-y-auto">
              {filteredTypes.map((type, index) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={`p-2 border rounded text-left transition-all duration-300 ${
                    selectedType === type 
                      ? 'bg-blue-100 border-blue-500 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex justify-between mt-4">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center transform hover:scale-105 transition-transform duration-300 ${
                (selectedType || (showCustomInput && customType.trim())) ? 'animate-[pulse_2s_infinite]' : 'opacity-50'
              }`}
              disabled={!selectedType && !customType.trim()}
            >
              <Check size={18} className="mr-1" />
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceTypePrompt;