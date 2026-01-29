export type Operator = '+' | '-' | '×' | '÷';
export type CellType = 'number_fixed' | 'number_input' | 'operator' | 'equal' | 'empty';
export type Level = 'simple' | 'advanced' | 'expert';
export type CorrectionMode = 'beginner' | 'expert';

export interface Cell {
    id: string;
    type: CellType;
    value: string; // The display value: '5', '+', '=', or '' (if input and empty)
    solution?: string; // The correct value for input cells
    row: number;
    col: number;
    isCorrect?: boolean; // For UI feedback
    isError?: boolean;   // For UI feedback
}

export interface GridData {
    id: string;
    level: Level;
    rows: number;
    cols: number;
    cells: Cell[];
    // We can derive equations dynamically or store them. 
    // Storing them as lists of IDs helps validation.
    equations: string[][];
    availableNumbers: number[];
}

export interface GameHistory {
    gridId: string;
    level: Level;
    startTime: number;
    endTime?: number;
    errors: number;
    status: 'won' | 'abandoned' | 'in_progress';
}

export interface PlayerProfile {
    email: string;
    history: GameHistory[];
}
