import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GridData, Cell, CorrectionMode } from '../lib/types';
import { getGrids } from '../lib/grid';
import { useUser } from '../lib/userState';
import { GridBoard } from '../components/GridBoard';
import { NumberDock } from '../components/NumberDock';
import { Numpad } from '../components/Numpad';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Equation {
    operand1: string;
    operator: string;
    operand2: string;
    result: string;
}

export const Game: React.FC = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, addGameResult } = useUser();

    const [gridData, setGridData] = useState<GridData | null>(null);
    const [cells, setCells] = useState<Cell[]>([]);
    const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [errors, setErrors] = useState<number>(0);
    const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing');

    const correctionMode: CorrectionMode = user?.correctionMode || 'beginner';

    // Extract equations from the grid structure
    const equations = useMemo(() => {
        if (!gridData) return [];
        const found: { cellIds: string[] }[] = [];

        const gridRows = gridData.rows;
        const gridCols = gridData.cols;

        // Horizontal Equations
        for (let ri = 0; ri <= gridRows; ri += 2) {
            const rowCells = cells.filter(c => c.row === ri).sort((a, b) => a.col - b.col);
            if (rowCells.length > 0) {
                const types = rowCells.map(c => c.type);
                const lastEqualIdx = types.lastIndexOf('equal');
                if (lastEqualIdx !== -1 && lastEqualIdx < rowCells.length - 1) {
                    const eqCellIds = rowCells.slice(0, lastEqualIdx + 2).map(c => c.id);
                    found.push({ cellIds: eqCellIds });
                }
            }
        }

        // Vertical Equations
        for (let ci = 0; ci <= gridCols; ci += 2) {
            const colCells = cells.filter(c => c.col === ci).sort((a, b) => a.row - b.row);
            if (colCells.length > 0) {
                const types = colCells.map(c => c.type);
                const lastEqualIdx = types.lastIndexOf('equal');
                if (lastEqualIdx !== -1 && lastEqualIdx < colCells.length - 1) {
                    const eqCellIds = colCells.slice(0, lastEqualIdx + 2).map(c => c.id);
                    found.push({ cellIds: eqCellIds });
                }
            }
        }
        return found;
    }, [gridData, cells]);

    // Result cell IDs for expert mode
    const resultCellIds = useMemo(() => new Set(equations.map(eq => eq.cellIds[eq.cellIds.length - 1])), [equations]);

    useEffect(() => {
        loadGrid();
    }, [id]);

    const loadGrid = () => {
        const grids = getGrids();
        let g: GridData | undefined;
        if (['simple', 'advanced', 'expert'].includes(id || '')) {
            const levelGrids = grids.filter(x => x.level === id);
            g = levelGrids[Math.floor(Math.random() * levelGrids.length)];
        } else {
            g = grids.find(x => x.id === id);
        }

        if (!g && grids.length > 0) g = grids[0];

        if (g) {
            setGridData(g);
            setCells(g.cells.map(c => ({
                ...c,
                value: c.type === 'number_input' ? '' : c.value,
                isCorrect: false,
                isError: false
            })));
            setStartTime(Date.now());
            setErrors(0);
            setGameStatus('playing');
            setSelectedCellId(null);
        }
    };

    const handleCellSelect = (cellId: string) => {
        setSelectedCellId(cellId);
    };

    const validateFullEquation = (cellIds: string[], currentCells: Cell[]): boolean => {
        const eqCells = cellIds.map(id => currentCells.find(c => c.id === id)).filter(Boolean) as Cell[];
        if (eqCells.length < 3) return false;

        // Last cell is the result
        const resultCell = eqCells[eqCells.length - 1];
        if (!resultCell.value) return false;
        const resultValue = parseInt(resultCell.value);

        // Evaluate Left-To-Right
        let currentTotal = parseInt(eqCells[0].value);
        if (isNaN(currentTotal)) return false;

        for (let i = 1; i < eqCells.length - 2; i += 2) {
            const op = eqCells[i].value;
            const nextVal = parseInt(eqCells[i + 1].value);
            if (isNaN(nextVal)) return false;

            switch (op) {
                case '+': currentTotal += nextVal; break;
                case '-': currentTotal -= nextVal; break;
                case '×': case '*': currentTotal *= nextVal; break;
                case '÷': case '/':
                    if (nextVal === 0) return false;
                    currentTotal /= nextVal;
                    break;
                default: return false;
            }
        }

        return currentTotal === resultValue;
    };

    const updateEquationStatus = (newCells: Cell[]) => {
        if (correctionMode === 'beginner') return;

        equations.forEach(eq => {
            const resCellId = eq.cellIds[eq.cellIds.length - 1];
            const resCell = newCells.find(c => c.id === resCellId);
            if (resCell) {
                const allFilled = eq.cellIds.every(id => {
                    const c = newCells.find(x => x.id === id);
                    return c && c.value !== '';
                });

                if (allFilled) {
                    const ok = validateFullEquation(eq.cellIds, newCells);
                    resCell.isCorrect = ok;
                    resCell.isError = !ok;
                } else {
                    resCell.isCorrect = false;
                    resCell.isError = false;
                }
            }
        });
    };

    const handleNumberSelect = (num: number) => {
        if (!selectedCellId || gameStatus !== 'playing') return;

        const cellIndex = cells.findIndex(c => c.id === selectedCellId);
        if (cellIndex === -1) return;

        const newCells = [...cells];
        const cell = newCells[cellIndex];
        const valStr = num.toString();
        cell.value = valStr;

        if (correctionMode === 'beginner') {
            const isCorrect = valStr === cell.solution;
            cell.isCorrect = isCorrect;
            cell.isError = !isCorrect;
            if (!isCorrect) setErrors(prev => prev + 1);
        } else {
            updateEquationStatus(newCells);
        }

        setSelectedCellId(null);
        setCells(newCells);
        checkVictory(newCells);
    };

    const handleDigitEntry = (digit: string) => {
        if (!selectedCellId || gameStatus !== 'playing') return;
        const cellIndex = cells.findIndex(c => c.id === selectedCellId);
        if (cellIndex === -1) return;

        const newCells = [...cells];
        const cell = newCells[cellIndex];

        if (cell.value.length < 4) {
            cell.value = cell.value + digit;
            setCells(newCells);
        }
    };

    const handleDeleteDigit = () => {
        if (!selectedCellId || gameStatus !== 'playing') return;
        const cellIndex = cells.findIndex(c => c.id === selectedCellId);
        if (cellIndex === -1) return;

        const newCells = [...cells];
        const cell = newCells[cellIndex];
        cell.value = cell.value.slice(0, -1);
        setCells(newCells);
    };

    const handleClearCell = () => {
        if (!selectedCellId || gameStatus !== 'playing') return;
        const cellIndex = cells.findIndex(c => c.id === selectedCellId);
        if (cellIndex === -1) return;

        const newCells = [...cells];
        const cell = newCells[cellIndex];
        cell.value = '';
        setCells(newCells);
    };

    const handleConfirm = () => {
        if (!selectedCellId) return;

        const newCells = [...cells];
        updateEquationStatus(newCells);
        setCells(newCells);
        checkVictory(newCells);
        setSelectedCellId(null);
    };

    const checkVictory = (currentCells: Cell[]) => {
        const inputs = currentCells.filter(c => c.type === 'number_input');

        let allCorrect = false;
        if (correctionMode === 'beginner') {
            allCorrect = inputs.every(c => c.isCorrect);
        } else {
            // Expert victory: All inputs filled AND all equations mathematically correct
            const allFilled = currentCells.filter(c => c.type.startsWith('number')).every(c => c.value !== '');
            if (allFilled) {
                allCorrect = equations.every(eq => validateFullEquation(eq.cellIds, currentCells));
            }
        }

        if (allCorrect) {
            setGameStatus('won');
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            if (gridData) {
                addGameResult({
                    gridId: gridData.id,
                    level: gridData.level,
                    startTime,
                    endTime: Date.now(),
                    errors: errors,
                    status: 'won'
                });
            }
        }
    };

    if (!gridData) return <div className="text-center p-8">{t('game.loading')}</div>;

    const levelKey = gridData.id.includes('excel') ? (gridData.level === 'simple' ? 'simple' : gridData.level === 'advanced' ? 'advanced' : 'expert_grid') : gridData.level;

    return (
        <div className="flex flex-col relative bg-[hsl(var(--color-background))]" style={{ height: '100dvh', maxHeight: '100dvh', overflow: 'hidden' }}>
            {/* Zone 1: Header (Top) - Fixed size */}
            {/* Zone 1: Header (Top) - Fixed size */}
            <header className="flex-none p-2 sm:p-4 flex items-center justify-between z-10 max-w-5xl mx-auto w-full">
                <button className="btn btn-secondary py-2 px-3 text-sm h-10 w-10 sm:w-auto sm:h-auto flex items-center justify-center" onClick={() => navigate('/level')}>
                    <ArrowLeft size={18} /> <span className="hidden md:inline ml-2">{t('level_select.back')}</span>
                </button>
                <div className="flex flex-col items-center flex-1 mx-2">
                    <h2 className="text-base sm:text-xl font-bold text-center capitalize leading-tight">{t(`level_select.${levelKey}`)}</h2>
                    <div className="text-[9px] sm:text-[10px] text-center text-[hsl(var(--color-text-muted))] uppercase tracking-widest font-medium mt-0.5">
                        {correctionMode === 'beginner' && t('level_select.beginner')}
                        {correctionMode === 'advanced' && t('level_select.advanced_level')}
                        {correctionMode === 'expert' && t('level_select.expert_level')}
                    </div>
                </div>
                <button className="btn btn-secondary py-2 px-3 text-sm h-10 w-10 sm:w-auto sm:h-auto flex items-center justify-center" onClick={loadGrid}>
                    <RotateCcw size={18} /> <span className="hidden md:inline ml-2">{t('game.reset')}</span>
                </button>
            </header>

            {/* Zone 1.5: Instruction Message */}
            <div className="flex-none px-4 text-center">
                <p className="text-[10px] sm:text-sm font-medium text-[hsl(var(--color-text-muted))] italic opacity-80">
                    {t('game.instruction')}
                </p>
            </div>

            {/* Zone 2: GridBoard (Center) - Flexible and Centered */}
            <main className="flex-1 flex items-center justify-center overflow-auto p-1 min-h-0 w-full">
                <div className="w-full h-full flex items-center justify-center overflow-auto">
                    <div className="transform origin-center scale-[0.55] sm:scale-75 md:scale-90 lg:scale-100 transition-transform duration-300">
                        <GridBoard
                            cells={cells}
                            selectedCellId={selectedCellId}
                            onSelectCell={handleCellSelect}
                            gameStatus={gameStatus}
                        />
                    </div>
                </div>
            </main>

            {/* Zone 3: Numbers & Info (Bottom) - Fixed to bottom */}
            <footer className="flex-none w-full flex flex-col items-center p-4 md:p-6 bg-[hsl(var(--color-background)/0.9)] backdrop-blur-md border-t border-[hsl(var(--color-text-muted)/0.15)] z-10">
                <div className="w-full max-w-sm flex flex-col items-center overflow-auto max-h-[40vh]">
                    <div className="text-center mb-3 font-bold text-[10px] tracking-[0.2em] uppercase opacity-70">
                        {correctionMode === 'expert' ? t('game.keyboard') : t('game.candidates')}
                    </div>

                    {correctionMode === 'expert' ? (
                        <Numpad
                            onDigit={handleDigitEntry}
                            onDelete={handleDeleteDigit}
                            onClear={handleClearCell}
                            onConfirm={handleConfirm}
                            disabled={gameStatus === 'won'}
                        />
                    ) : (
                        <NumberDock
                            numbers={gridData.availableNumbers}
                            onSelectNumber={handleNumberSelect}
                            disabled={gameStatus === 'won'}
                        />
                    )}

                    <div className="mt-4 text-[10px] font-medium text-[hsl(var(--color-text-muted))] uppercase tracking-tight">
                        {t('game.errors')}: <span className={errors > 0 ? "text-[hsl(var(--color-error))]" : ""}>{errors}</span>
                    </div>
                </div>
            </footer>

            {gameStatus === 'won' && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md">
                    <div className="card glass-panel p-8 text-center max-w-sm m-4 animate-in fade-in zoom-in">
                        <h2 className="text-4xl font-bold mb-4 text-[hsl(var(--color-primary))]">{t('game.victory')}</h2>
                        <p className="mb-8 text-lg">{t('game.victory_desc')}</p>
                        <div className="flex flex-col gap-4">
                            <button className="btn btn-primary w-full p-4" onClick={loadGrid}>
                                {t('game.next')}
                            </button>
                            <button className="btn btn-secondary w-full p-4" onClick={() => navigate('/')}>
                                {t('game.menu')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
