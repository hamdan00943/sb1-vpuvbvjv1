import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, ChevronDown, ExternalLink } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  link: string;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Eco-Friendly Phone Case',
    description: 'Biodegradable phone case made from plant-based materials',
    price: 24.99,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1609692814858-f7cd2f0afa4f',
    category: 'Accessories',
    link: 'https://example.com/phone-case'
  },
  {
    id: '2',
    name: 'Solar Power Bank',
    description: 'Portable solar charger for all your devices',
    price: 49.99,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1594002348772-bc0f9cc9c68f',
    category: 'Electronics',
    link: 'https://example.com/solar-bank'
  },
  {
    id: '3',
    name: 'Recycled Laptop Sleeve',
    description: 'Stylish laptop sleeve made from recycled materials',
    price: 34.99,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302',
    category: 'Accessories',
    link: 'https://example.com/laptop-sleeve'
  }
];

const categories = ['All', 'Electronics', 'Accessories', 'Eco-Friendly'];

const Shop: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const { playSound } = useSoundEffects();

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory);

  const handleCategoryChange = (category: string) => {
    playSound('click');
    setSelectedCategory(category);
  };

  const handleProductClick = (productId: string) => {
    playSound('click');
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const handleBuyClick = (link: string) => {
    playSound('notification');
    window.open(link, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center text-green-700">
          <ShoppingBag className="mr-2" />
          Eco Shop
        </h2>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${product.image})` }}
              />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                  </div>
                </div>
                <p className="text-green-600 font-bold mt-2">${product.price}</p>
                <button
                  onClick={() => handleProductClick(product.id)}
                  className="mt-2 text-sm text-gray-500 flex items-center"
                >
                  Details
                  <ChevronDown
                    className={`ml-1 transform transition-transform ${
                      expandedProduct === product.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <AnimatePresence>
                  {expandedProduct === product.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2"
                    >
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBuyClick(product.link)}
                        className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Buy Now
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Shop;