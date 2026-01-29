import React from 'react';
import { Cell } from '../lib/types';
import styles from './GridBoard.module.css';
import { motion } from 'framer-motion';

interface GridBoardProps {
    cells: Cell[];
    selectedCellId: string | null;
    onSelectCell: (id: string) => void;
    gameStatus: 'playing' | 'won';
}

export const GridBoard: React.FC<GridBoardProps> = ({ cells, selectedCellId, onSelectCell, gameStatus }) => {
    // Calculate grid dimensions dynamically
    const maxRow = Math.max(...cells.map(c => c.row), 0);
    const maxCol = Math.max(...cells.map(c => c.col), 0);

    return (
        <div
            className={styles.boardContainer}
            style={{
                gridTemplateRows: `repeat(${maxRow + 1}, 2.75rem)`,
                gridTemplateColumns: `repeat(${maxCol + 1}, 2.75rem)`,
            }}
        >
            {cells.map((cell) => {
                const isInput = cell.type === 'number_input';
                const isSelected = cell.id === selectedCellId;
                const isCorrect = cell.isCorrect;
                const isError = cell.isError;

                let className = styles.cell;
                if (cell.type === 'number_fixed' || isInput) className += ` ${styles.cellNumber}`;
                if (isInput) className += ` ${styles.input}`;
                if (cell.isResult) className += ` ${styles.result}`;
                if (isSelected) className += ` ${styles.inputSelected}`;
                if (isCorrect) className += ` ${styles.inputCorrect}`;
                if (isError) className += ` ${styles.inputError}`;
                if (cell.type === 'operator' || cell.type === 'equal') className += ` ${styles.operator}`;

                return (
                    <motion.div
                        key={cell.id}
                        layout
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={className}
                        style={{
                            gridRow: cell.row + 1,
                            gridColumn: cell.col + 1
                        }}
                        onClick={() => isInput && gameStatus === 'playing' ? onSelectCell(cell.id) : undefined}
                    >
                        {cell.value}
                    </motion.div>
                );
            })}
        </div>
    );
};
