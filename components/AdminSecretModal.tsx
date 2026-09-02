'use client';

import { useState, useEffect, useRef } from 'react';

export default function AdminSecretModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const typedKeysRef = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut 1: Ctrl + Alt + A
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Shortcut 2: Sequence typing detection (typing "admin")
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      typedKeysRef.current.push(e.key.toLowerCase());
      if (typedKeysRef.current.length > 10) {
        typedKeysRef.current.shift();
      }

      const typedStr = typedKeysRef.current.join('');
      if (typedStr.endsWith('admin') || typedStr.endsWith('ctrlaltadmin')) {
        typedKeysRef.current = [];
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isLoading) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setErrorMsg(data.error || 'Password salah');
        inputRef.current?.focus();
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="w-full max-w-xs bg-background border border-line p-5 rounded-md shadow-lg text-foreground font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
          <span className="font-bold uppercase tracking-wider text-foreground/80">
            Admin Access
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-foreground/40 hover:text-foreground cursor-pointer text-xs"
          >
            [esc]
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] text-foreground/60 mb-1.5">
              Password:
            </label>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full rounded border border-line bg-panel px-3 py-1.5 text-xs text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none"
            />
          </div>

          {errorMsg && (
            <p className="text-[11px] text-red-500 font-medium">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded border border-line text-[11px] text-foreground/60 hover:text-foreground hover:bg-foreground/5 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !password}
              className="px-3 py-1 rounded bg-foreground text-background font-bold text-[11px] hover:opacity-90 disabled:opacity-40 cursor-pointer"
            >
              {isLoading ? '...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
