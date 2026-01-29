import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus } from 'lucide-react';
import { useUser } from '../lib/userState';
import { getAvailableLanguages } from '../i18n/config';

export const Options: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { resetStats } = useUser();

    const languages = getAvailableLanguages();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);
    };

    const handleReset = () => {
        if (confirm(t('options.confirm_reset'))) {
            resetStats();
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <button className="btn btn-secondary mb-8" onClick={() => navigate('/')}>
                <ArrowLeft size={16} /> {t('level_select.back')}
            </button>

            <h1 className="text-4xl font-bold mb-10">{t('options.title')}</h1>

            <div className="flex-col gap-8">
                {/* Language Selection */}
                <div className="card glass-panel p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        {t('options.language')}
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                        <select
                            className="input-field flex-1"
                            value={i18n.language}
                            onChange={(e) => changeLanguage(e.target.value)}
                            style={{ minWidth: '200px' }}
                        >
                            {languages.map(l => (
                                <option key={l.code} value={l.code}>{l.name}</option>
                            ))}
                        </select>

                        <button className="btn btn-secondary flex items-center gap-2" onClick={() => navigate('/options/add-language')}>
                            <Plus size={18} /> {t('options.add_language')}
                        </button>
                    </div>
                </div>

                {/* Reset Stats */}
                <div className="card glass-panel p-8">
                    <button className="btn btn-secondary w-full py-4 text-[hsl(var(--color-error))] border-[hsl(var(--color-error)/0.2)] hover:bg-[hsl(var(--color-error)/0.05)]" onClick={handleReset}>
                        {t('options.reset_stats')}
                    </button>
                </div>
            </div>
        </div>
    );
};
