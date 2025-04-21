import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Phone, Loader2, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';

interface RecyclingCenter {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  position: {
    lat: number;
    lng: number;
  };
}

interface RecyclingCentersProps {
  userLocation?: { lat: number; lng: number };
}

// UAE recycling centers data
const UAE_RECYCLING_CENTERS: RecyclingCenter[] = [
  {
    id: 'manara',
    name: 'Al Manara Smart Recycling Center',
    address: 'Al Manara Street, next to Al Manara Center, Dubai',
    position: { lat: 25.2048, lng: 55.2708 }
  },
  {
    id: 'jumeirah',
    name: 'Smart Sustainability Oasis',
    address: 'Street 45A, Jumeirah 1, near Jumeirah Mosque, Dubai',
    position: { lat: 25.2285, lng: 55.2570 }
  },
  {
    id: 'alquoz',
    name: 'Green Truck Recycling Station',
    address: 'Warehouse 12, 27th Street, Al Quoz Industrial Area 4, Dubai',
    position: { lat: 25.1407, lng: 55.2272 }
  },
  {
    id: 'ecyclex',
    name: 'Ecyclex International Recycling',
    address: 'Warehouse Q3, Al Quoz Industrial Area 2, Dubai',
    website: 'https://ecyclex.com',
    position: { lat: 25.1375, lng: 55.2306 }
  },
  {
    id: 'shredex',
    name: 'Shredex Secure Recycling Facility',
    address: 'Plot 25, Sector M44, Mussafah Industrial Area, Abu Dhabi',
    website: 'https://shredex.ae',
    position: { lat: 24.3587, lng: 54.5312 }
  },
  {
    id: 'ecyclex-ad',
    name: 'Ecyclex Abu Dhabi',
    address: 'Plot 59, Sector M39, Mussafah Industrial Area, Abu Dhabi',
    position: { lat: 24.3522, lng: 54.5278 }
  },
  {
    id: 'beeah',
    name: "Bee'ah Waste Management Complex",
    address: "Al Saja'a Industrial Area, off Emirates Road E611, Sharjah",
    website: 'https://beeah.ae',
    position: { lat: 25.3141, lng: 55.5815 }
  },
  {
    id: 'rak-wma',
    name: 'Waste Management Agency – Al Kharaan',
    address: 'Al Kharaan Road, Al Faslayn, Ras Al Khaimah',
    phone: '800 81118',
    position: { lat: 25.7874, lng: 55.9816 }
  },
  {
    id: 'virogreen',
    name: 'VIROGREEN eWaste Facility',
    address: 'RAKEZ, Al Ghail Industrial Zone-FZ, Plots K253 & K255, RAK',
    website: 'https://virogreen.ae',
    position: { lat: 25.7914, lng: 55.9789 }
  }
];

// Dubai default location
const UAE_DEFAULT_LOCATION = {
  lat: 25.2048,
  lng: 55.2708
};

const RecyclingCenters: React.FC<RecyclingCentersProps> = ({ userLocation }) => {
  const [centers] = useState<RecyclingCenter[]>(UAE_RECYCLING_CENTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCenter, setExpandedCenter] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<tt.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const filteredCenters = selectedCity === 'all' 
    ? centers 
    : centers.filter(center => center.address.toLowerCase().includes(selectedCity.toLowerCase()));

  useEffect(() => {
    if (showMap && mapContainerRef.current && centers.length > 0) {
      const location = userLocation || UAE_DEFAULT_LOCATION;
      
      if (!mapRef.current) {
        mapRef.current = tt.map({
          key: import.meta.env.VITE_TOMTOM_API_KEY,
          container: mapContainerRef.current,
          center: [location.lng, location.lat],
          zoom: 11,
          language: 'en-GB',
          stylesVisibility: {
            trafficIncidents: true,
            trafficFlow: true
          }
        });

        // Add user location marker
        new tt.Marker()
          .setLngLat([location.lng, location.lat])
          .addTo(mapRef.current);

        // Add markers for recycling centers
        centers.forEach(center => {
          const marker = new tt.Marker()
            .setLngLat([center.position.lng, center.position.lat])
            .addTo(mapRef.current!);

          const popup = new tt.Popup({ offset: 30 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold">${center.name}</h3>
                <p class="text-sm">${center.address}</p>
                ${center.phone ? `<p class="text-sm text-blue-600">${center.phone}</p>` : ''}
                ${center.website ? `<a href="${center.website}" target="_blank" class="text-sm text-blue-600">Visit Website</a>` : ''}
              </div>
            `);

          marker.setPopup(popup);
        });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMap, centers, userLocation]);

  const openDirections = (center: RecyclingCenter) => {
    const location = userLocation || UAE_DEFAULT_LOCATION;
    window.open(
      `https://www.google.com/maps/dir/${location.lat},${location.lng}/${center.position.lat},${center.position.lng}`,
      '_blank'
    );
  };

  const callPhone = (phone: string) => {
    window.location.href = `tel:${phone.replace(/[^\d]/g, '')}`;
  };

  const visitWebsite = (website: string) => {
    window.open(website, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-lg bg-opacity-90"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center text-gray-800">
          <MapPin size={20} className="mr-2 text-green-600" />
          UAE Recycling Centers
        </h2>
        <div className="flex items-center space-x-2">
          {loading && <Loader2 size={20} className="animate-spin text-green-600" />}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMap(!showMap)}
            className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
          >
            <MapIcon size={20} />
          </motion.button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['all', 'dubai', 'abu dhabi', 'sharjah', 'ras al khaimah'].map((city) => (
          <motion.button
            key={city}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCity(city)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCity === city
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {city.charAt(0).toUpperCase() + city.slice(1)}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 300, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 rounded-xl overflow-hidden"
          >
            <div ref={mapContainerRef} className="w-full h-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"
        >
          <p className="text-red-700">{error}</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredCenters.map((center, index) => (
              <motion.div
                key={center.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "border rounded-xl overflow-hidden transition-all duration-300",
                  expandedCenter === center.id ? "bg-gray-50 shadow-md" : "hover:bg-gray-50"
                )}
              >
                <motion.div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedCenter(expandedCenter === center.id ? null : center.id)}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <motion.h3 
                        className="font-medium text-gray-900"
                        layoutId={`title-${center.id}`}
                      >
                        {center.name}
                      </motion.h3>
                      <p className="text-gray-600 text-sm mt-1">{center.address}</p>
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {expandedCenter === center.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-4 pb-4 space-y-3"
                    >
                      {center.phone && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => callPhone(center.phone!)}
                          className="w-full bg-white text-gray-700 text-sm py-2 px-3 rounded-xl border hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Phone size={14} />
                          <span>{center.phone}</span>
                        </motion.button>
                      )}

                      {center.website && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => visitWebsite(center.website!)}
                          className="w-full bg-white text-blue-600 text-sm py-2 px-3 rounded-xl border hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                        >
                          <span>Visit Website</span>
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openDirections(center)}
                        className="w-full bg-green-600 text-white text-sm py-2 px-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Navigation size={14} />
                        <span>Get Directions</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default RecyclingCenters;