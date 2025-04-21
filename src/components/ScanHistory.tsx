import React, { useState } from 'react';
import { ScanHistory as ScanHistoryType } from '../types';
import { Clock, Trash2, ChevronDown, ChevronUp, Calendar, Eye } from 'lucide-react';

interface ScanHistoryProps {
  history: ScanHistoryType[];
  onSelect: (scan: ScanHistoryType) => void;
  onDelete: (id: string) => void;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ history, onSelect, onDelete }) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Auto-reset after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center justify-center text-gray-500 py-8">
          <Clock size={32} className="mb-2" />
          <p>No scan history yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold p-4 border-b flex items-center">
        <Clock size={20} className="mr-2 text-blue-600" />
        Scan History
      </h2>
      <div className="divide-y">
        {history.map((scan, index) => (
          <div 
            key={scan.id} 
            className={`transition-all duration-300 hover:bg-gray-50 ${
              expandedItem === scan.id ? 'bg-gray-50' : ''
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleExpand(scan.id)}
            >
              <div className="flex items-start">
                <div 
                  className="w-16 h-16 bg-gray-200 rounded overflow-hidden mr-4 flex-shrink-0 transition-transform duration-300 hover:scale-110"
                  style={{ backgroundImage: `url(${scan.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                ></div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{scan.deviceName || 'Unknown Device'}</h3>
                    <button 
                      onClick={(e) => confirmDelete(scan.id, e)}
                      className={`transition-colors duration-300 ${
                        deleteConfirm === scan.id 
                          ? 'text-red-600 animate-pulse' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar size={14} className="mr-1" />
                    <span>{scan.timestamp.toLocaleDateString()} at {scan.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      scan.result.recyclable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {scan.result.recyclable ? 'Recyclable' : 'Not Recyclable'}
                    </span>
                  </div>
                </div>
                <div className={`ml-2 transition-transform duration-300 ${expandedItem === scan.id ? 'rotate-180' : ''}`}>
                  <ChevronDown size={16} className="text-gray-500" />
                </div>
              </div>
            </div>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedItem === scan.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Materials:</h4>
                  <ul className="text-sm text-gray-600">
                    {scan.result.materials.slice(0, 2).map((material, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-1 ${material.recyclable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {material.name} ({material.percentage}%)
                      </li>
                    ))}
                    {scan.result.materials.length > 2 && (
                      <li className="text-gray-500 text-xs">+ {scan.result.materials.length - 2} more</li>
                    )}
                  </ul>
                </div>
                
                <button 
                  onClick={() => onSelect(scan)}
                  className="w-full mt-2 text-sm bg-blue-600 text-white py-2 rounded flex items-center justify-center hover:bg-blue-700 transition-colors transform hover:scale-105 transition-transform duration-300"
                >
                  <Eye size={16} className="mr-1" />
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScanHistory;