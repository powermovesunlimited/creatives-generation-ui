import React from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb } from 'react-icons/fa';

interface ProductsServicesCarouselProps {
  items: string[] | undefined;
}

const ProductsServicesCarousel: React.FC<ProductsServicesCarouselProps> = ({ items }) => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <FaLightbulb className="mr-2 text-yellow-500" />
        Key Products or Services
      </h2>
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4">
          {items?.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-48 h-32 bg-white rounded-lg shadow-md flex items-center justify-center p-4 text-center cursor-pointer hover:shadow-lg transition-shadow duration-300"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsServicesCarousel;