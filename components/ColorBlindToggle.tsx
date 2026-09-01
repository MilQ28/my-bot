'use client';

import { useColorBlind } from '@/contexts/ColorBlindContext';

export default function ColorBlindToggle() {
    const { isFriendlyMode, toggleFriendlyMode } = useColorBlind();

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-secondary/10 rounded-lg border border-secondary/20">
            <span className="text-sm font-medium text-foreground">
                Mode Aksesibel
            </span>

            <button
                onClick={toggleFriendlyMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isFriendlyMode ? 'bg-primary' : 'bg-secondary/30'
                    }`}
                role="switch"
                aria-checked={isFriendlyMode}
                aria-label="Aktifkan mode ramah buta warna"
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isFriendlyMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );
}