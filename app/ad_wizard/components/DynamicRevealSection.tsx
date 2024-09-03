import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBriefcase } from 'react-icons/fa';
import { Card, CardContent } from "@/components/ui/card";

interface BusinessInfo {
  business_name: string;
  business_type: string;
  description: string;
  key_products_or_services: string[];
}

interface DynamicRevealSectionProps {
  title: string;
  data: BusinessInfo | null;
}

const DynamicRevealSection: React.FC<DynamicRevealSectionProps> = ({ title, data }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <FaBriefcase className="mr-2 text-blue-500" />
        {title}
      </h2>
      <Card>
        <CardContent className="p-6">
          <AnimatePresence>
            {data && Object.entries(data).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-4"
              >
                <h3 className="font-semibold text-lg capitalize">{key.replace(/_/g, ' ')}</h3>
                <p className="text-gray-600">
                  {Array.isArray(value) ? value.join(', ') : value}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default DynamicRevealSection;