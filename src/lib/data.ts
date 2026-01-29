import { GridData, Cell } from './types.ts';
import { v4 as uuidv4 } from 'uuid';

const createCell = (r: number, c: number, type: 'number_fixed' | 'number_input' | 'operator' | 'equal' | 'empty', value: string, solution?: string, isResult?: boolean): Cell => ({
    id: uuidv4(),
    row: r,
    col: c,
    type: type as any,
    value: type === 'number_input' ? '' : value,
    solution: type === 'number_input' ? solution : undefined,
    isResult
});

/**
 * Grid Builder ensuring no more than 2 unknowns per row and column.
 */
export const buildBalancedGrid = (
    id: string,
    level: 'simple' | 'advanced' | 'expert',
    rows: number,
    cols: number,
    matrix: number[][],
    opsH: string[][],
    opsV: string[][]
): GridData => {
    const cells: Cell[] = [];
    const availableNumbers: number[] = [];

    const numRows = matrix.length;
    const numCols = matrix[0].length;

    // Constraint: min 1, max 2 unknowns per row AND per column.
    let inputMask: boolean[][] = [];
    let success = false;
    let attempts = 0;

    while (!success && attempts < 100) {
        attempts++;
        inputMask = Array.from({ length: numRows }, () => Array(numCols).fill(false));
        const rowUsage = new Array(numRows).fill(0);
        const colUsage = new Array(numCols).fill(0);

        // 1. Pass 1: Ensure every row has at least 1
        for (let i = 0; i < numRows; i++) {
            const availableCols = [];
            for (let j = 0; j < numCols; j++) {
                if (colUsage[j] < 1) availableCols.push(j);
            }
            if (availableCols.length === 0) {
                for (let j = 0; j < numCols; j++) {
                    if (colUsage[j] < 2) availableCols.push(j);
                }
            }

            if (availableCols.length > 0) {
                const j = availableCols[Math.floor(Math.random() * availableCols.length)];
                inputMask[i][j] = true;
                rowUsage[i]++;
                colUsage[j]++;
            }
        }

        // 2. Pass 2: Ensure every column has at least 1
        for (let j = 0; j < numCols; j++) {
            if (colUsage[j] === 0) {
                const availableRows = [];
                for (let i = 0; i < numRows; i++) {
                    if (rowUsage[i] < 2) availableRows.push(i);
                }
                if (availableRows.length > 0) {
                    const i = availableRows[Math.floor(Math.random() * availableRows.length)];
                    inputMask[i][j] = true;
                    rowUsage[i]++;
                    colUsage[j]++;
                }
            }
        }

        // 3. Optional: Add a second input to rows/cols that only have 1
        for (let i = 0; i < numRows; i++) {
            if (rowUsage[i] < 2 && Math.random() > 0.5) {
                const potentialCols = [];
                for (let j = 0; j < numCols; j++) {
                    if (!inputMask[i][j] && colUsage[j] < 2) potentialCols.push(j);
                }
                if (potentialCols.length > 0) {
                    const j = potentialCols[Math.floor(Math.random() * potentialCols.length)];
                    inputMask[i][j] = true;
                    rowUsage[i]++;
                    colUsage[j]++;
                }
            }
        }

        const allRowsCheck = rowUsage.every(count => count >= 1 && count <= 2);
        const allColsCheck = colUsage.every(count => count >= 1 && count <= 2);
        if (allRowsCheck && allColsCheck) success = true;
    }

    // Build the Grid
    for (let i = 0; i < numRows; i++) {
        const r = i * 2;
        if (r >= rows) break;

        for (let j = 0; j < numCols; j++) {
            const c = j * 2;
            if (c >= cols) break;

            const val = matrix[i][j];
            const isInput = inputMask[i][j];
            const isResult = j === numCols - 1 || i === numRows - 1;

            const type = isInput ? 'number_input' : 'number_fixed';
            cells.push(createCell(r, c, type, val.toString(), val.toString(), isResult));
            if (isInput) availableNumbers.push(val);

            // Horizontal Ops / Equals
            if (j < numCols - 1) {
                const isBeforeResult = j === numCols - 2;
                cells.push(createCell(r, c + 1, isBeforeResult ? 'equal' : 'operator', isBeforeResult ? '=' : opsH[i][j]));
            }
        }

        // Vertical Ops / Equals
        if (i < numRows - 1) {
            for (let j = 0; j < numCols; j++) {
                const c = j * 2;
                if (c >= cols) break;
                const isLastRow = i === numRows - 2;
                cells.push(createCell(r + 1, c, isLastRow ? 'equal' : 'operator', isLastRow ? '=' : opsV[i][j]));
            }
        }
    }

    return {
        id,
        level,
        rows,
        cols,
        availableNumbers: availableNumbers.sort((a, b) => a - b),
        cells,
        equations: []
    };
};
