import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../lib/userState';
import { ArrowLeft } from 'lucide-react';

export const Stats: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useUser();

    if (!user) return null;

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <button className="btn btn-secondary mb-10" onClick={() => navigate('/')}>
                <ArrowLeft size={16} /> {t('level_select.back')}
            </button>
            <h1 className="text-3xl font-bold mb-10">{t('stats.title')}</h1>

            <div className="flex-col gap-8 w-full max-w-2xl pb-10">
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
            </div>
        </div>
    );
};
