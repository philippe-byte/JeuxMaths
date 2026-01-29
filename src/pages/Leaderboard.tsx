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
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="w-full max-w-2xl">
                <button className="btn btn-secondary mb-10" onClick={() => navigate('/')}>
                    <ArrowLeft size={16} /> {t('level_select.back')}
                </button>

                <h1 className="text-center text-4xl font-bold mb-12">{t('leaderboard.title')}</h1>

                <div className="flex-col gap-6">
                    {playerList.map((p, index) => (
                        <div key={p.email} className="card glass-panel p-6 flex items-center gap-6 animate-in slide-in-from-bottom duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl bg-[hsl(var(--color-primary)/0.2)] text-[hsl(var(--color-primary))]">
                                #{index + 1}
                            </div>

                            <div className="flex-1">
                                <div className="font-bold text-lg truncate" title={p.email}>{p.email}</div>
                                <div className="flex gap-6 mt-2">
                                    <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--color-text-muted))]">
                                        <Award size={14} /> <span>{p.wins} {t('leaderboard.total_wins')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--color-text-muted))]">
                                        <PlayCircle size={14} /> <span>{p.plays} {t('leaderboard.total_plays')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--color-text-muted))]">
                                        <Hash size={14} /> <span>{p.streak} {t('leaderboard.best_streak')}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="btn btn-secondary p-3 text-xs" onClick={() => {
                                // Potentially auto-login as this user? 
                                // For now just showing stats.
                            }} style={{ visibility: 'hidden' }}>
                                View Stats
                            </button>
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
