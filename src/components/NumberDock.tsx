import React from 'react';
import styles from './GridBoard.module.css';
import { motion } from 'framer-motion';

interface NumberDockProps {
    numbers: number[];
    onSelectNumber: (num: number) => void;
    disabled?: boolean;
}

export const NumberDock: React.FC<NumberDockProps> = ({ numbers, onSelectNumber, disabled }) => {
    return (
        <div className={styles.dock}>
            {numbers.map((num, idx) => (
                <motion.button
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={styles.dockBtn}
                    onClick={() => !disabled && onSelectNumber(num)}
                >
                    {num}
                </motion.button>
            ))}
        </div>
    );
};
