import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Gift, Phone, Upload, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface Device {
  id: string;
  name: string;
  description: string;
  condition: string;
  image_url: string;
  user_id: string;
  available: boolean;
  profiles: {
    phone: string;
  };
}

const DeviceGiveaway: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPhone, setUserPhone] = useState('');
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    description: '',
    condition: '',
    image_url: '',
  });
  const { playSound } = useSoundEffects();

  useEffect(() => {
    fetchDevices();
    fetchUserPhone();
  }, []);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*, profiles(phone)')
        .eq('available', true);
      
      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPhone = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data) {
          setUserPhone(data.phone || '');
        }
      }
    } catch (error) {
      console.error('Error fetching user phone:', error);
    }
  };

  const handlePhoneUpdate = async () => {
    try {
      playSound('click');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ phone: userPhone })
        .eq('id', user.id);

      if (error) throw error;
      playSound('success');
    } catch (error) {
      console.error('Error updating phone:', error);
      playSound('error');
    }
  };

  const handleAddDevice = async () => {
    try {
      playSound('click');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('devices')
        .insert({
          ...newDevice,
          user_id: user.id,
          available: true,
        });

      if (error) throw error;

      setShowAddDevice(false);
      setNewDevice({ name: '', description: '', condition: '', image_url: '' });
      fetchDevices();
      playSound('success');
    } catch (error) {
      console.error('Error adding device:', error);
      playSound('error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Gift className="w-6 h-6 text-green-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Device Giveaway</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSound('click');
            setShowAddDevice(!showAddDevice);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Upload className="w-5 h-5 mr-2" />
          Add Device
        </motion.button>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePhoneUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg h-[42px] mt-8"
          >
            Update
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showAddDevice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-gray-50 p-4 rounded-lg"
          >
            <h3 className="text-lg font-medium mb-4">Add New Device</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Name
                </label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter device name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newDevice.description}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe the device"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={newDevice.condition}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, condition: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select condition</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newDevice.image_url}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, image_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter image URL"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddDevice}
                className="w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center"
              >
                <Check className="w-5 h-5 mr-2" />
                Add Device
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {device.image_url && (
              <img
                src={device.image_url}
                alt={device.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-medium mb-2">{device.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{device.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Condition: {device.condition}
                </span>
                <button
                  onClick={() => {
                    playSound('notification');
                    window.location.href = `tel:${device.profiles.phone}`;
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No devices available for giveaway</p>
        </div>
      )}
    </div>
  );
};

export default DeviceGiveaway;