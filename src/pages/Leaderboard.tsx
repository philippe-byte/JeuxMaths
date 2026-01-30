import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Award, PlayCircle, Hash } from 'lucide-react';
import { useUser } from '../lib/userState';

export const Leaderboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { getAllUsers } = useUser();

    const usersMap = getAllUsers();
    const playerList = Object.values(usersMap).map(u => {
        const totalWins = u.stats.simple.wins + u.stats.advanced.wins + u.stats.expert.wins;
        const totalPlays = u.stats.simple.plays + u.stats.advanced.plays + u.stats.expert.plays;
        const bestStreak = Math.max(u.stats.simple.bestStreak, u.stats.advanced.bestStreak, u.stats.expert.bestStreak);

        return {
            email: u.email,
            wins: totalWins,
            plays: totalPlays,
            streak: bestStreak
        };
    }).sort((a, b) => b.wins - a.wins); // Sort by total wins

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="w-full max-w-lg px-4 sm:px-0">
                <button className="btn btn-secondary mb-8" onClick={() => navigate('/')}>
                    <ArrowLeft size={16} /> {t('level_select.back')}
                </button>

                <h1 className="text-center text-3xl sm:text-4xl font-bold mb-8">{t('leaderboard.title')}</h1>

                <div className="flex-col gap-4 sm:gap-6">
                    {playerList.map((p, index) => (
                        <div key={p.email} className="card glass-panel p-4 sm:p-6 flex items-center gap-4 animate-in slide-in-from-bottom duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-lg sm:text-xl bg-[hsl(var(--color-primary)/0.2)] text-[hsl(var(--color-primary))] flex-shrink-0">
                                #{index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-base sm:text-lg truncate" title={p.email}>{p.email}</div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[hsl(var(--color-text-muted))]">
                                        <Award size={14} /> <span className="whitespace-nowrap">{p.wins} {t('leaderboard.total_wins')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[hsl(var(--color-text-muted))]">
                                        <PlayCircle size={14} /> <span className="whitespace-nowrap">{p.plays} {t('leaderboard.total_plays')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {playerList.length === 0 && (
                        <div className="text-center p-12 text-[hsl(var(--color-text-muted))]">
                            {t('leaderboard.no_players')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
