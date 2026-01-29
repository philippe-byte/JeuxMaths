import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileJson, Edit3, Save, X } from 'lucide-react';
import { addCustomLanguage } from '../i18n/config';
import { flattenObject, unflattenObject } from '../lib/i18nUtils';

export const AddLanguage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [addMode, setAddMode] = useState<'none' | 'file' | 'manual'>('none');

    // Manual creation state
    const [newLangName, setNewLangName] = useState('');
    const [newLangCode, setNewLangCode] = useState('');
    const [manualTranslations, setManualTranslations] = useState<Record<string, string>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                const name = file.name.split('.')[0];
                const code = name.slice(0, 2).toLowerCase();

                addCustomLanguage(code, name.charAt(0).toUpperCase() + name.slice(1), json);
                alert(t('options.success'));
                navigate('/options');
            } catch (err) {
                alert(t('options.file_error'));
            }
        };
        reader.readAsText(file);
    };

    const startManual = () => {
        const currentRes = i18n.getResourceBundle(i18n.language, 'translation');
        const flat = flattenObject(currentRes);
        const initialManual: Record<string, string> = {};
        Object.keys(flat).forEach(k => initialManual[k] = '');
        setManualTranslations(initialManual);
        setAddMode('manual');
    };

    const saveManual = () => {
        if (!newLangName || !newLangCode) {
            alert("Veuillez fournir un nom et un code pour la langue.");
            return;
        }
        const nested = unflattenObject(manualTranslations);
        addCustomLanguage(newLangCode, newLangName, nested);
        alert(t('options.success'));
        navigate('/options');
    };

    const currentTranslations = flattenObject(i18n.getResourceBundle(i18n.language, 'translation'));

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <button className="btn btn-secondary mb-8" onClick={() => navigate('/options')}>
                <ArrowLeft size={16} /> {t('options.title')}
            </button>

            <h1 className="text-4xl font-bold mb-16">{t('options.add_language')}</h1>

            <div className="flex-col gap-12">
                {/* 1. Choice area with large spacing */}
                <div className="card glass-panel p-10 flex flex-col items-center">
                    <p className="text-lg opacity-70 mb-12 text-center max-w-lg">
                        Choisissez une méthode pour ajouter une nouvelle langue à l'application. Vous pouvez importer un fichier de traduction existant ou en créer un nouveau manuellement.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl mt-24">
                        <button
                            className={`btn flex-1 py-6 flex flex-col items-center justify-center gap-4 text-lg ${addMode === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FileJson size={32} />
                            <span>{t('options.add_file')}</span>
                        </button>

                        <button
                            className={`btn flex-1 py-6 flex flex-col items-center justify-center gap-4 text-lg ${addMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={startManual}
                        >
                            <Edit3 size={32} />
                            <span>{t('options.add_manual')}</span>
                        </button>
                    </div>

                    <input type="file" hidden ref={fileInputRef} accept=".json" onChange={handleFileChange} />
                </div>

                {/* 2. Manual Table area (visible if manual mode) */}
                {addMode === 'manual' && (
                    <div className="card glass-panel p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col sm:flex-row gap-6 mb-10">
                            <div className="flex-1">
                                <label className="text-xs uppercase tracking-widest opacity-60 mb-2 block font-bold">{t('options.lang_name')}</label>
                                <input className="input-field" value={newLangName} onChange={e => setNewLangName(e.target.value)} placeholder="ex: Allemand" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs uppercase tracking-widest opacity-60 mb-2 block font-bold">{t('options.lang_code')}</label>
                                <input className="input-field" value={newLangCode} onChange={e => setNewLangCode(e.target.value)} placeholder="ex: de" />
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-[hsl(var(--color-text-muted)/0.1)] mb-16">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[hsl(var(--color-primary)/0.05)]">
                                    <tr>
                                        <th className="p-4 font-bold text-sm border-b border-[hsl(var(--color-text-muted)/0.1)]">{t('options.col_key')}</th>
                                        <th className="p-4 font-bold text-sm border-b border-[hsl(var(--color-text-muted)/0.1)]">{t('options.col_current')}</th>
                                        <th className="p-4 font-bold text-sm border-b border-[hsl(var(--color-text-muted)/0.1)]">{t('options.col_new')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(manualTranslations).map((key) => (
                                        <tr key={key} className="hover:bg-[hsl(var(--color-text-muted)/0.02)]">
                                            <td className="p-4 text-xs font-mono opacity-50 border-b border-[hsl(var(--color-text-muted)/0.05)]">{key}</td>
                                            <td className="p-4 text-sm border-b border-[hsl(var(--color-text-muted)/0.05)]">{currentTranslations[key]}</td>
                                            <td className="p-4 border-b border-[hsl(var(--color-text-muted)/0.05)]">
                                                <input
                                                    className="input-field py-2 text-sm"
                                                    value={manualTranslations[key]}
                                                    onChange={e => setManualTranslations({ ...manualTranslations, [key]: e.target.value })}
                                                    placeholder="..."
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="h-10"></div> {/* Reduced Spacer */}

                        <div className="flex gap-4 mt-6">
                            <button className="btn btn-primary flex-1 py-4 flex items-center justify-center gap-2" onClick={saveManual}>
                                <Save size={20} /> {t('options.save')}
                            </button>
                            <button className="btn btn-secondary px-10 py-4" onClick={() => setAddMode('none')}>
                                <X size={20} /> {t('options.cancel')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
