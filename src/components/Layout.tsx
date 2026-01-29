import React from 'react';
import { motion } from 'framer-motion';
import styles from './Layout.module.css';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className={styles.layoutContainer}>
            <div className={styles.backgroundBlob1} />
            <div className={styles.backgroundBlob2} />

            <motion.main
                className={styles.mainContent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {children}
            </motion.main>
        </div>
    );
};
