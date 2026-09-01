'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ColorBlindContextType {
    isFriendlyMode: boolean;
    toggleFriendlyMode: () => void;
}

const ColorBlindContext = createContext<ColorBlindContextType | undefined>(undefined);

export function ColorBlindProvider({ children }: { children: ReactNode }) {
    const [isFriendlyMode, setIsFriendlyMode] = useState(false);

    useEffect(() => {
        // Cek preferensi user dari localStorage
        const saved = localStorage.getItem('colorblindFriendly');
        if (saved === 'true') {
            setIsFriendlyMode(true);
        }
    }, []);

    useEffect(() => {
        // Simpan ke localStorage
        localStorage.setItem('colorblindFriendly', String(isFriendlyMode));

        // Tambahkan/Hapus class pada tag <html>
        if (isFriendlyMode) {
            document.documentElement.classList.add('colorblind-friendly');
        } else {
            document.documentElement.classList.remove('colorblind-friendly');
        }
    }, [isFriendlyMode]);

    const toggleFriendlyMode = () => {
        setIsFriendlyMode(prev => !prev);
    };

    return (
        <ColorBlindContext.Provider value={{ isFriendlyMode, toggleFriendlyMode }}>
            {children}
        </ColorBlindContext.Provider>
    );
}

export function useColorBlind() {
    const context = useContext(ColorBlindContext);
    if (context === undefined) {
        throw new Error('useColorBlind must be used within a ColorBlindProvider');
    }
    return context;
}