import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GridData, Cell, CorrectionMode } from '../lib/types';
import { getGrids } from '../lib/data';
import { useUser } from '../lib/userState';
import { GridBoard } from '../components/GridBoard';
import { NumberDock } from '../components/NumberDock';
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
        const found: Equation[] = [];

        // Scan for horizontal equations: num op num = res
        const gridRows = gridData.rows;
        const gridCols = gridData.cols;

        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c <= gridCols - 5; c++) {
                const slice = [0, 1, 2, 3, 4].map(dc => cells.find(cell => cell.row === r && cell.col === c + dc));
                if (slice.every(x => x) &&
                    (slice[1]?.type === 'operator') &&
                    (slice[3]?.type === 'equal') &&
                    (slice[0]?.type.startsWith('number') && slice[2]?.type.startsWith('number') && slice[4]?.type.startsWith('number'))) {
                    found.push({
                        operand1: slice[0]!.id,
                        operator: slice[1]!.value,
                        operand2: slice[2]!.id,
                        result: slice[4]!.id
                    });
                }
            }
        }

        // Scan for vertical equations
        for (let c = 0; c < gridCols; c++) {
            for (let r = 0; r <= gridRows - 5; r++) {
                const slice = [0, 1, 2, 3, 4].map(dr => cells.find(cell => cell.row === r + dr && cell.col === c));
                if (slice.every(x => x) &&
                    (slice[1]?.type === 'operator') &&
                    (slice[3]?.type === 'equal') &&
                    (slice[0]?.type.startsWith('number') && slice[2]?.type.startsWith('number') && slice[4]?.type.startsWith('number'))) {
                    found.push({
                        operand1: slice[0]!.id,
                        operator: slice[1]!.value,
                        operand2: slice[2]!.id,
                        result: slice[4]!.id
                    });
                }
            }
        }
        return found;
    }, [gridData, cells.length]); // Only recalc on initial load or if structure changes (unlikely)

    // Result cell IDs for expert mode
    const resultCellIds = useMemo(() => new Set(equations.map(eq => eq.result)), [equations]);

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

    const validateMath = (v1: string, op: string, v2: string, res: string): boolean => {
        if (!v1 || !v2 || !res) return false;
        const n1 = parseInt(v1);
        const n2 = parseInt(v2);
        const nr = parseInt(res);
        if (isNaN(n1) || isNaN(n2) || isNaN(nr)) return false;

        switch (op) {
            case '+': return n1 + n2 === nr;
            case '-': return n1 - n2 === nr;
            case '×': case '*': return n1 * n2 === nr;
            case '÷': case '/': return n1 / n2 === nr;
            default: return false;
        }
    };

    const handleNumberSelect = (num: number) => {
        if (!selectedCellId || gameStatus !== 'playing') return;

        const cellIndex = cells.findIndex(c => c.id === selectedCellId);
        if (cellIndex === -1) return;

        const newCells = [...cells];
        const cell = newCells[cellIndex];
        const valStr = num.toString();
        cell.value = valStr;

        // Perform validation
        if (correctionMode === 'beginner') {
            // Beginner: Immediate feedback against solution
            const isCorrect = valStr === cell.solution;
            cell.isCorrect = isCorrect;
            cell.isError = !isCorrect;
            if (!isCorrect) setErrors(prev => prev + 1);
        } else {
            // Expert: Feedback ONLY for result cells, based on current mathematical logic
            // We need to re-evaluate all equations this cell belongs to
            newCells.forEach(c => {
                c.isCorrect = false;
                c.isError = false;
            });

            equations.forEach(eq => {
                const c1 = newCells.find(c => c.id === eq.operand1);
                const c2 = newCells.find(c => c.id === eq.operand2);
                const cr = newCells.find(c => c.id === eq.result);

                if (c1?.value && c2?.value && cr?.value) {
                    const ok = validateMath(c1.value, eq.operator, c2.value, cr.value);
                    cr.isCorrect = ok;
                    cr.isError = !ok;
                    // Note: If result cell is a shared cell, it might be correct for one eq and wrong for another.
                    // In that case, we mark it error if ANY eq it belongs to is wrong.
                }
            });

            // Increment error if the newly placed number makes an equation mathematicaly wrong
            // (Only for result cells in expert mode?) 
            // Actually, let's keep errors simple or skip for expert if it's too complex.
        }

        setSelectedCellId(null);
        setCells(newCells);
        checkVictory(newCells);
    };

    const checkVictory = (currentCells: Cell[]) => {
        const inputs = currentCells.filter(c => c.type === 'number_input');

        let allCorrect = false;
        if (correctionMode === 'beginner') {
            allCorrect = inputs.every(c => c.isCorrect);
        } else {
            // Expert victory: All inputs filled AND all equations mathematically correct
            const allFilled = inputs.every(c => c.value !== '');
            if (allFilled) {
                allCorrect = equations.every(eq => {
                    const c1 = currentCells.find(c => c.id === eq.operand1);
                    const c2 = currentCells.find(c => c.id === eq.operand2);
                    const cr = currentCells.find(c => c.id === eq.result);
                    return validateMath(c1!.value, eq.operator, c2!.value, cr!.value);
                });
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
            <header className="flex-none p-4 flex items-center justify-between z-10">
                <button className="btn btn-secondary p-2" onClick={() => navigate('/level')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-bold text-center capitalize leading-tight">{t(`level_select.${levelKey}`)}</h2>
                    <div className="text-[10px] text-center text-[hsl(var(--color-text-muted))] uppercase tracking-widest font-medium">
                        {t(`level_select.${correctionMode}`)}
                    </div>
                </div>
                <button className="btn btn-secondary p-2" onClick={loadGrid}>
                    <RotateCcw size={20} />
                </button>
            </header>

            {/* Zone 2: GridBoard (Center) - Flexible and Centered */}
            <main className="flex-1 flex items-center justify-center overflow-auto p-4 md:p-8 min-h-0">
                <div className="transform scale-[0.8] sm:scale-90 md:scale-100 transition-transform duration-300">
                    <GridBoard
                        cells={cells}
                        selectedCellId={selectedCellId}
                        onSelectCell={handleCellSelect}
                        gameStatus={gameStatus}
                    />
                </div>
            </main>

            {/* Zone 3: Numbers & Info (Bottom) - Fixed to bottom */}
            <footer className="flex-none w-full flex flex-col items-center p-4 md:p-6 bg-[hsl(var(--color-background)/0.9)] backdrop-blur-md border-t border-[hsl(var(--color-text-muted)/0.15)] z-10">
                <div className="w-full max-w-md flex flex-col items-center">
                    <div className="text-center mb-3 font-bold text-[10px] tracking-[0.2em] uppercase opacity-70">
                        {t('game.candidates')}
                    </div>
                    <NumberDock
                        numbers={gridData.availableNumbers}
                        onSelectNumber={handleNumberSelect}
                        disabled={gameStatus === 'won'}
                    />
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
