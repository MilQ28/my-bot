'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';   // <-- ini yang kemungkinan hilang/ke-skip
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

const STORAGE_KEY = 'portfolio-chat-history';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, status, setMessages, error } = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' }),
        onError: (err) => {
            console.error('CHAT ERROR:', err);
        },
    });

    // Load riwayat chat dari localStorage saat komponen pertama kali mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setMessages(JSON.parse(saved));
        } catch (err) {
            console.error('Gagal memuat riwayat chat:', err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Simpan setiap kali messages berubah
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages]);

    // Auto-scroll ke pesan paling bawah setiap ada pesan baru / status berubah
    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages, status]);

    const isLoading = status === 'submitted' || status === 'streaming';

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage({ text: input });
        setInput('');
    };

    const clearChat = () => {
        setMessages([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="mb-4 flex h-130 w-90 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-3 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                                    <Bot size={18} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Portfolio Assistant</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                                        <span className="text-xs text-indigo-100">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={clearChat}
                                    className="rounded-lg px-2 py-1 text-[11px] text-indigo-100 transition hover:bg-white/10"
                                    aria-label="Hapus percakapan"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-full p-1.5 text-white transition hover:bg-white/10"
                                    aria-label="Tutup chat"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Area pesan */}
                        <div
                            ref={scrollRef}
                            className="flex-1 space-y-4 overflow-y-auto bg-gray-50 px-4 py-4 dark:bg-gray-950"
                        >
                            {messages.length === 0 && (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-gray-400 dark:text-gray-600">
                                    <Bot size={32} />
                                    <p className="text-sm">
                                        Halo! Tanyakan apa saja tentang pengalaman, proyek, atau skill saya 👋
                                    </p>
                                </div>
                            )}
                            {messages.map((message) => (
                                <ChatMessage key={message.id} message={message} />
                            ))}
                            {error && (
                                <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                    Error: {error.message}
                                </div>
                            )}
                            {isLoading && <TypingIndicator />}
                        </div>

                        {/* Form input */}
                        <form
                            onSubmit={handleSend}
                            className="flex items-center gap-2 border-t border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Tulis pertanyaan..."
                                disabled={isLoading}
                                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 outline-none transition focus:border-indigo-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Kirim pesan"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700"
                aria-label={isOpen ? 'Tutup chat' : 'Buka chat'}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {isOpen ? (
                        <motion.span
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X size={24} />
                        </motion.span>
                    ) : (
                        <motion.span
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <MessageCircle size={24} />
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}