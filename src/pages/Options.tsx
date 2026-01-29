import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Palette, Languages, Settings, Info, Copy, Check } from 'lucide-react';
import { getAvailableLanguages } from '../i18n/config';

export const Options: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const languages = getAvailableLanguages();
    const [theme, setTheme] = React.useState(localStorage.getItem('app-theme') || 'winter');
    const [copied, setCopied] = useState(false);

    const initialPrompt = `"Je travaille sur le fichier src/lib/grid.ts. Je souhaite ajouter [X] nouvelles grilles pour chaque niveau (Simple, Advanced, Expert).\n\nSTRUCTURE DU FICHIER :\nLes grilles sont définies par une matrice 'm' de nombres, un tableau 'oh' (opérateurs horizontaux) et 'ov' (opérateurs verticaux).\n- Simple : Matrice m de 3x4 (3 lignes, 4 colonnes). 4ème colonne = résultat ligne, 3ème ligne = résultat colonne.\n- Advanced : Matrice m de 4x6. RÈGLE : Utilise +, -, * (PAS DE DIVISION).\n- Expert : Matrice m de 5x6. RÈGLE : Utilise obligatoirement les 4 opérateurs (+, -, *, /).\n\nCONSIGNES DE SÉCURITÉ MATHÉMATIQUE (CRITIQUE) :\n1. COHÉRENCE TOTALE : Le nombre m[last][last] doit valider les deux équations croisées.\n2. CALCULS ENTIERS : Toutes les divisions (/) doivent donner des résultats sans virgule.\n3. RÈGLE DE LECTURE : Les opérations se lisent strictement de gauche à droite et de haut en bas (aucune priorité multiplicative).\n4. VARIÉTÉ : Mélange bien les opérateurs pour éviter les répétitions.\n\nPROCÉDURE DE GÉNÉRATION :\n- Génère d'abord les nombres internes, puis déduis les résultats.\n- Vérifie deux fois le croisement final avant de répondre.\n\nFORMAT DE SORTIE :\nDonne-moi uniquement les objets TypeScript à ajouter aux tableaux seeds : { m: [[...]], oh: [[...]], ov: [[...]] }."`;

    const [promptText, setPromptText] = useState(initialPrompt);

    React.useEffect(() => {
        applyTheme(theme);
    }, []);

    const applyTheme = (newTheme: string) => {
        document.documentElement.classList.remove('theme-spring', 'theme-summer', 'theme-autumn');
        if (newTheme !== 'winter') {
            document.documentElement.classList.add(`theme-${newTheme}`);
        }
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);
    };

    const changeTheme = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('app-theme', newTheme);
        applyTheme(newTheme);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mx-auto px-4 sm:px-6" style={{ paddingTop: '1.5rem', paddingBottom: '3rem', width: '95%', maxWidth: '900px' }}>
            <button className="btn btn-secondary mb-8 py-2 px-4 text-sm" onClick={() => navigate('/')}>
                <ArrowLeft size={14} /> {t('level_select.back')}
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold mb-10 flex items-center gap-2">
                <Settings size={22} className="text-[hsl(var(--color-primary))]" />
                {t('options.title')}
            </h1>

            <div className="flex flex-col gap-8 w-full">
                {/* Language Selection */}
                <div className="card glass-panel p-6 sm:p-8 w-full">
                    <h3 className="text-xl font-bold mb-10 flex items-center gap-2">
                        <Languages size={20} className="text-[hsl(var(--color-primary))]" />
                        {t('options.language')}
                    </h3>

                    <div className="flex flex-col gap-6">
                        <select
                            className="input-field w-full h-12 text-base"
                            value={i18n.language}
                            onChange={(e) => changeLanguage(e.target.value)}
                        >
                            {languages.map(l => (
                                <option key={l.code} value={l.code}>{l.name}</option>
                            ))}
                        </select>

                        <button className="btn btn-secondary w-full flex items-center justify-center gap-2 h-12 text-base bg-white/50" onClick={() => navigate('/options/add-language')}>
                            <Plus size={18} /> {t('options.add_language')}
                        </button>
                    </div>
                </div>

                {/* Theme Selection */}
                <div className="card glass-panel p-6 sm:p-8 w-full">
                    <h3 className="text-xl font-bold mb-10 flex items-center gap-2">
                        <Palette size={20} className="text-[hsl(var(--color-primary))]" />
                        Thème visuel
                    </h3>
                    <div className="flex justify-center">
                        <div className="grid grid-cols-2 gap-6 w-full max-w-lg mx-auto">
                            {[
                                { id: 'winter', color: '210 80% 50%' },
                                { id: 'spring', color: '150 45% 30%' },
                                { id: 'summer', color: '15 90% 55%' },
                                { id: 'autumn', color: '25 70% 45%' }
                            ].map((tInfo) => (
                                <button
                                    key={tInfo.id}
                                    className="btn text-sm py-5 px-2 rounded-xl transition-all active:scale-95"
                                    style={{
                                        backgroundColor: `hsl(${tInfo.color})`,
                                        color: 'white',
                                        border: theme === tInfo.id ? '4px solid white' : '1px solid rgba(255,255,255,0.2)',
                                        boxShadow: theme === tInfo.id ? `0 6px 16px hsl(${tInfo.color} / 0.5)` : 'none',
                                        fontWeight: 'bold',
                                        opacity: theme === tInfo.id ? 1 : 0.85
                                    }}
                                    onClick={() => changeTheme(tInfo.id)}
                                >
                                    {t(`options.${tInfo.id}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Prompt Section */}
                <div className="card glass-panel p-6 sm:p-8 w-full">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Info size={20} className="text-[hsl(var(--color-primary))]" />
                        Instructions IA (Grilles)
                    </h3>

                    <div className="bg-black/5 rounded-xl border border-black/10 overflow-hidden">
                        <div className="pt-6 px-6 pb-10 border-b border-black/10 bg-black/5 flex items-center justify-between">
                            <p className="font-bold text-sm text-[hsl(var(--color-primary))] flex items-center gap-2">
                                <Plus size={16} className="text-[hsl(var(--color-primary))]" />
                                Prompt pour l'ajout de nouvelles grilles par une IA
                            </p>
                            <button
                                onClick={handleCopy}
                                className={`btn btn-secondary py-2 px-5 text-xs transition-all flex items-center gap-2 h-10 ${copied ? 'bg-[hsl(var(--color-success)/0.1)] border-[hsl(var(--color-success)/0.5)] text-[hsl(var(--color-success))] shadow-inner' : 'hover:bg-white shadow-sm'}`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? "Copié !" : "Copier"}
                            </button>
                        </div>
                        <div className="p-6">
                            <textarea
                                className="w-full bg-transparent border-none outline-none text-sm sm:text-base leading-relaxed italic opacity-85 resize-none font-mono scrollbar-thin overflow-y-auto"
                                style={{ height: '30rem', minHeight: '30rem' }}
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                            />

                            <div className="mt-8 pt-4 border-t border-black/5">
                                <p className="text-xs sm:text-sm opacity-60">
                                    <span className="font-bold text-[hsl(var(--color-primary))]">N.B. :</span> Pensez à remplacer <span className="font-mono bg-black/5 px-1 rounded">[X]</span> par le nombre de grilles souhaité directement dans le texte ci-dessus avant de copier.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
