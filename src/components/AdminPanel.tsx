import React, { useState, useEffect } from 'react';
import { supabase, getAdminCredits } from '../lib/supabase';
import { Shield, Users, Package, Trash2, Check, X, Info, Mail, MapPin, Phone, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'devices' | 'credits'>('users');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [adminCredits, setAdminCredits] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, devicesResponse, adminCreditsData] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('devices').select('*, profiles(*)'),
        getAdminCredits()
      ]);

      if (usersResponse.data) setUsers(usersResponse.data);
      if (devicesResponse.data) setDevices(devicesResponse.data);
      if (adminCreditsData) setAdminCredits(adminCreditsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      await supabase.from('devices').delete().eq('id', id);
      setDevices(devices.filter(device => device.id !== id));
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3
      }
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center mb-6">
        <Shield className="w-6 h-6 text-green-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      </div>

      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Users className="w-5 h-5 mr-2" />
          Users
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('devices')}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'devices'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Package className="w-5 h-5 mr-2" />
          Devices
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('credits')}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'credits'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Info className="w-5 h-5 mr-2" />
          Admin Info
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  selectedUser === user.id ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{user.email}</h3>
                    <p className="text-sm text-gray-500">
                      Phone: {user.phone || 'Not provided'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Joined: {format(new Date(user.created_at), 'PPP')}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: selectedUser === user.id ? 180 : 0 }}
                    className="text-gray-400"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {selectedUser === user.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t"
                    >
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">User Activity</h4>
                        <p className="text-sm text-gray-600">
                          Last updated: {format(new Date(user.updated_at), 'PPP')}
                        </p>
                        <div className="flex space-x-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Active User
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'devices' && (
          <motion.div
            key="devices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {devices.map((device, index) => (
              <motion.div
                key={device.id}
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900">{device.name}</h3>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                          device.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {device.available ? 'Available' : 'Taken'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{device.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Owner: {device.profiles?.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      Added: {format(new Date(device.created_at), 'PPP')}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteDevice(device.id)}
                    className="text-red-500 hover:text-red-700 transition-colors ml-4"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'credits' && adminCredits && (
          <motion.div
            key="credits"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-earth-50 to-sage-50 rounded-lg p-6"
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-sage-600 rounded-full flex items-center justify-center text-white">
                  <Building className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-sage-700">{adminCredits.name}</h3>
                  <p className="text-earth-600">{adminCredits.organization}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className="flex items-center text-earth-700 mb-2">
                    <Phone className="w-4 h-4 mr-2" />
                    <h4 className="font-medium">Contact</h4>
                  </div>
                  <p className="text-earth-600">{adminCredits.contact}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className="flex items-center text-earth-700 mb-2">
                    <Mail className="w-4 h-4 mr-2" />
                    <h4 className="font-medium">Email</h4>
                  </div>
                  <p className="text-earth-600">{adminCredits.email}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-4 rounded-lg shadow-sm md:col-span-2"
                >
                  <div className="flex items-center text-earth-700 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <h4 className="font-medium">Location</h4>
                  </div>
                  <p className="text-earth-600">{adminCredits.location}</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminPanel;