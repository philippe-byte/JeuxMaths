
import React from 'react';
import styles from './Numpad.module.css';
import { motion } from 'framer-motion';
import { Delete, X, Check } from 'lucide-react';

interface NumpadProps {
    onDigit: (digit: string) => void;
    onDelete: () => void;
    onClear: () => void;
    onConfirm: () => void;
    disabled?: boolean;
}

export const Numpad: React.FC<NumpadProps> = ({ onDigit, onDelete, onClear, onConfirm, disabled }) => {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    return (
        <div className={styles.numpad}>
            {digits.map((d) => (
                <motion.button
                    key={d}
                    whileTap={{ scale: 0.95 }}
                    className={styles.key}
                    onClick={() => !disabled && onDigit(d)}
                >
                    {d}
                </motion.button>
            ))}
            <motion.button
                whileTap={{ scale: 0.95 }}
                className={`${styles.key} ${styles.keySpecial}`}
                onClick={() => !disabled && onClear()}
            >
                <X size={20} />
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.95 }}
                className={styles.key}
                onClick={() => !disabled && onDigit('0')}
            >
                0
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.95 }}
                className={`${styles.key} ${styles.keySpecial} ${styles.keyDelete}`}
                onClick={() => !disabled && onDelete()}
            >
                <Delete size={20} />
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.95 }}
                className={`${styles.key} ${styles.keyOk}`}
                onClick={() => !disabled && onConfirm()}
            >
                <Check size={20} style={{ marginRight: '8px' }} /> Valider
            </motion.button>
        </div>
    );
};
