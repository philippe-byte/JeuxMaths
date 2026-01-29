import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../lib/userState';
import { ArrowLeft, Trash2 } from 'lucide-react';

export const Stats: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, resetStats } = useUser();

    if (!user) return null;

    const handleReset = () => {
        if (confirm(t('options.confirm_reset'))) {
            resetStats();
        }
    };

    return (
        <div className="container px-4" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <button className="btn btn-secondary mb-10" onClick={() => navigate('/')}>
                <ArrowLeft size={16} /> {t('level_select.back')}
            </button>
            <h1 className="text-3xl font-bold mb-10">{t('stats.title')}</h1>

            <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
                <div className="card glass-panel p-6">
                    <h3 className="text-xl font-bold mb-4 text-[hsl(var(--color-primary))]">Simple</h3>
                    <div className="flex justify-between items-center mb-2">
                        <span>{t('stats.games_played')}:</span>
                        <span className="font-bold">{user.stats.simple.plays}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Wins:</span>
                        <span className="font-bold text-[hsl(var(--color-success))]">{user.stats.simple.wins}</span>
                    </div>
                </div>

                <div className="card glass-panel p-6">
                    <h3 className="text-xl font-bold mb-4 text-[hsl(var(--color-secondary))]">Advanced</h3>
                    <div className="flex justify-between items-center mb-2">
                        <span>{t('stats.games_played')}:</span>
                        <span className="font-bold">{user.stats.advanced.plays}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Wins:</span>
                        <span className="font-bold text-[hsl(var(--color-success))]">{user.stats.advanced.wins}</span>
                    </div>
                </div>

                <div className="card glass-panel p-6">
                    <h3 className="text-xl font-bold mb-4 text-purple-500">Expert</h3>
                    <div className="flex justify-between items-center mb-2">
                        <span>{t('stats.games_played')}:</span>
                        <span className="font-bold">{user.stats.expert.plays}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Wins:</span>
                        <span className="font-bold text-[hsl(var(--color-success))]">{user.stats.expert.wins}</span>
                    </div>
                </div>

                {/* Reset Stats Section moved here */}
                <div className="card glass-panel p-6 mt-4 border-[hsl(var(--color-error)/0.3)] bg-[hsl(var(--color-error)/0.02)]">
                    <button
                        className="btn w-full py-4 text-[hsl(var(--color-error))] font-bold flex items-center justify-center gap-2 border border-[hsl(var(--color-error)/0.2)] hover:bg-[hsl(var(--color-error)/0.05)] transition-colors"
                        onClick={handleReset}
                    >
                        <Trash2 size={20} />
                        {t('options.reset_stats')}
                    </button>
                    <p className="text-xs text-center mt-3 opacity-60 text-[hsl(var(--color-error))] lowercase">
                        * cette action supprimera définitivement tous vos progrès
                    </p>
                </div>
            </div>
        </div>
    );
};
