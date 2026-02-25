import React, { useState } from 'react';
import { useTheme, THEMES, FONTS } from '../context/ThemeContext';

const AccessibilityPanel = () => {
    const { theme, setTheme, font, setFont } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    // Toggle the panel visibility
    const togglePanel = () => setIsOpen(!isOpen);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Panel Content (Slide-in animation) */}
            <div
                className={`bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-6 mb-4 w-72 border border-slate-200 dark:border-slate-700 transition-all duration-300 ease-out transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none hidden'
                    }`}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Accessibility</h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        aria-label="Close accessibility panel"
                    >
                        ✕
                    </button>
                </div>

                {/* Theme Selection */}
                <div className="mb-6">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                        Color Theme
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setTheme(THEMES.CREAM)}
                            className={`h-12 rounded-lg border-2 flex items-center justify-center transition-all ${theme === THEMES.CREAM
                                ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                                : 'border-slate-200 hover:border-indigo-300'
                                }`}
                            style={{ backgroundColor: '#FFF4E6' }}
                            aria-label="Cream Theme"
                            title="Cream (Recommended)"
                        >
                            <span className="text-xs font-bold text-[#111111]">Aa</span>
                        </button>
                        <button
                            onClick={() => setTheme(THEMES.GRAY)}
                            className={`h-12 rounded-lg border-2 flex items-center justify-center transition-all ${theme === THEMES.GRAY
                                ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                                : 'border-slate-200 hover:border-indigo-300'
                                }`}
                            style={{ backgroundColor: '#F2F2F2' }}
                            aria-label="Soft Gray Theme"
                            title="Soft Gray"
                        >
                            <span className="text-xs font-bold text-[#111111]">Aa</span>
                        </button>
                        <button
                            onClick={() => setTheme(THEMES.YELLOW)}
                            className={`h-12 rounded-lg border-2 flex items-center justify-center transition-all ${theme === THEMES.YELLOW
                                ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                                : 'border-slate-200 hover:border-indigo-300'
                                }`}
                            style={{ backgroundColor: '#FFF9C4' }}
                            aria-label="Soft Yellow Theme"
                            title="Soft Yellow"
                        >
                            <span className="text-xs font-bold text-[#111111]">Aa</span>
                        </button>
                    </div>
                </div>

                {/* Font Selection */}
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                        Font Style
                    </p>
                    <div className="space-y-2">
                        <button
                            onClick={() => setFont(FONTS.ARIAL)}
                            className={`w-full px-4 py-3 rounded-lg text-left border-2 transition-all flex items-center justify-between group ${font === FONTS.ARIAL
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 hover:border-indigo-300'
                                }`}
                        >
                            <span className="font-arial text-base">Arial</span>
                            {font === FONTS.ARIAL && <span className="text-indigo-600">✓</span>}
                        </button>
                        <button
                            onClick={() => setFont(FONTS.VERDANA)}
                            className={`w-full px-4 py-3 rounded-lg text-left border-2 transition-all flex items-center justify-between group ${font === FONTS.VERDANA
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 hover:border-indigo-300'
                                }`}
                        >
                            <span className="font-verdana text-base">Verdana</span>
                            {font === FONTS.VERDANA && <span className="text-indigo-600">✓</span>}
                        </button>
                        <button
                            onClick={() => setFont(FONTS.OPENDYSLEXIC)}
                            className={`w-full px-4 py-3 rounded-lg text-left border-2 transition-all flex items-center justify-between group ${font === FONTS.OPENDYSLEXIC
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 hover:border-indigo-300'
                                }`}
                        >
                            <span className="font-opendyslexic text-base">OpenDyslexic</span>
                            {font === FONTS.OPENDYSLEXIC && <span className="text-indigo-600">✓</span>}
                        </button>
                        <button
                            onClick={() => setFont(FONTS.OPENDYSLEXIC_MONO)}
                            className={`w-full px-4 py-3 rounded-lg text-left border-2 transition-all flex items-center justify-between group ${font === FONTS.OPENDYSLEXIC_MONO
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 hover:border-indigo-300'
                                }`}
                        >
                            <span className="font-opendyslexic-mono text-base">OpenDyslexic Mono</span>
                            {font === FONTS.OPENDYSLEXIC_MONO && <span className="text-indigo-600">✓</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={togglePanel}
                className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                aria-label="Accessibility Settings"
            >
                <span className="text-2xl font-bold font-serif">Aa</span>
            </button>
        </div>
    );
};

export default AccessibilityPanel;
