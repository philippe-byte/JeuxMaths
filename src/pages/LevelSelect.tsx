import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useUser } from '../lib/userState';
import { CorrectionMode } from '../lib/types';

export const LevelSelect: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, setCorrectionMode } = useUser();

    if (!user) return null;

    const options = [
        { id: 'simple', label: t('level_select.simple'), desc: t('level_select.simple_desc'), isRandom: false },
        { id: 'advanced', label: t('level_select.advanced'), desc: t('level_select.advanced_desc'), isRandom: false },
        { id: 'expert', label: t('level_select.expert_grid'), desc: t('level_select.complex_desc'), isRandom: false },
        { id: 'random', label: t('level_select.random_grid'), desc: t('level_select.random_desc'), isRandom: true },
    ];

    const handleModeChange = (mode: CorrectionMode) => {
        setCorrectionMode(mode);
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="w-full max-w-md flex-col gap-8">
                <button className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/')}>
                    <ArrowLeft size={16} /> {t('level_select.back')}
                </button>

                {/* Difficulty Selection */}
                <h1 className="text-center text-3xl font-bold">{t('level_select.difficulty_title')}</h1>

                <div className="card glass-panel p-6 flex-col gap-4">
                    <div className="flex-col gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="difficulty"
                                checked={user.correctionMode === 'beginner'}
                                onChange={() => handleModeChange('beginner')}
                                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'hsl(var(--color-primary))' }}
                            />
                            <div className="flex-1">
                                <div className="font-bold">{t('level_select.beginner')}</div>
                                <div className="text-sm text-[hsl(var(--color-text-muted))]">{t('level_select.beginner_desc')}</div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="difficulty"
                                checked={user.correctionMode === 'expert'}
                                onChange={() => handleModeChange('expert')}
                                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'hsl(var(--color-primary))' }}
                            />
                            <div className="flex-1">
                                <div className="font-bold">{t('level_select.expert')}</div>
                                <div className="text-sm text-[hsl(var(--color-text-muted))]">{t('level_select.expert_desc')}</div>
                            </div>
                        </label>
                    </div>
                </div>

                <h1 className="text-center text-3xl font-bold">{t('level_select.title')}</h1>

                {options.map(l => (
                    <div key={l.id} className="flex-col gap-2">
                        <button
                            className="btn btn-primary w-full p-6 text-xl"
                            onClick={() => navigate(`/game/${l.id}`)}
                        >
                            {l.label}
                        </button>
                        <p className="text-center text-sm text-[hsl(var(--color-text-muted))] px-2">{l.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
