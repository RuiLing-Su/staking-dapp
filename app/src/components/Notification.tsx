import React from 'react';
import { motion } from 'framer-motion';
import {AlertCircle} from "lucide-react";

/**
 * 通知组件
 * @param message
 * @param type
 * @param onClose
 * @constructor
 */
const Notification = ({ message, type, onClose }) => (
    <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
            type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}
    >
        <div className="flex items-center space-x-2">
            <AlertCircle size={20} />
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
                ×
            </button>
        </div>
    </motion.div>
);

export default Notification;