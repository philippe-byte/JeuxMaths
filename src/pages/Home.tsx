import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../lib/userState';
import styles from './Home.module.css';
import { Play, Calendar, Settings, LogOut, Users } from 'lucide-react';

export const Home: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, login, logout } = useUser();
    const [email, setEmail] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            login(email.trim());
        }
    };

    if (!user) {
        return (
            <div className={styles.container}>
                <h1 className={styles.logo}>JeuxMaths</h1>
                <div className="card glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                    <form onSubmit={handleLogin} className="flex-col gap-6">
                        <h2 className="text-center mb-8">{t('home.welcome')}</h2>
                        <div className="flex-col gap-4">
                            <input
                                type="email"
                                className="input-field"
                                placeholder={t('home.email_placeholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn btn-primary w-full mt-4">
                                {t('home.play')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.logo}>JeuxMaths</h1>
            <p className="text-xs text-center text-opacity-50 mb-4">v1.0.1</p>
            <p className={styles.welcome}>{t('home.welcome')}, {user.email}</p>

            <div className={styles.menu}>
                <button className="btn btn-primary" onClick={() => navigate('/level')}>
                    <Play size={20} /> {t('home.play')}
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/stats')}>
                    <Calendar size={20} /> {t('home.stats')}
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/leaderboard')}>
                    <Users size={20} /> {t('leaderboard.title')}
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/options')}>
                    <Settings size={20} /> {t('home.options')}
                </button>
                <button className="btn btn-secondary" style={{ marginTop: '1rem', borderColor: 'hsl(var(--color-error) / 0.3)' }} onClick={logout}>
                    <LogOut size={20} /> {t('home.change_player')}
                </button>
            </div>
        </div>
    );
};
