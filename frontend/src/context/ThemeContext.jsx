import React, { createContext, useContext, useEffect, useState } from 'react';

// Define our available themes and fonts with descriptive names
// This makes it easier to extend in the future if we want more options.
export const THEMES = {
    CREAM: 'cream',
    GRAY: 'gray',
    YELLOW: 'yellow',
};

export const FONTS = {
    ARIAL: 'arial',
    VERDANA: 'verdana',
    OPENDYSLEXIC: 'opendyslexic',
    OPENDYSLEXIC_MONO: 'opendyslexic-mono',
};

// Create the context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Initialize state from localStorage or default to recommended settings
    // Default: Cream background (most recommended) and Arial font
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('lexilearn-theme') || THEMES.CREAM;
    });

    const [font, setFont] = useState(() => {
        return localStorage.getItem('lexilearn-font') || FONTS.ARIAL;
    });

    // Apply changes to the document body whenever theme or font changes
    useEffect(() => {
        const root = document.documentElement;

        // Reset existing classes
        root.classList.remove(
            'theme-cream', 'theme-gray', 'theme-yellow',
            'font-arial', 'font-verdana', 'font-opendyslexic', 'font-opendyslexic-mono'
        );

        // Add new classes
        root.classList.add(`theme-${theme}`);
        root.classList.add(`font-${font}`);

        // Save preferences to localStorage
        localStorage.setItem('lexilearn-theme', theme);
        localStorage.setItem('lexilearn-font', font);

    }, [theme, font]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, font, setFont }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook for easy access to the context
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
