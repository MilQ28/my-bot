'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';   // <-- ini yang kemungkinan hilang/ke-skip
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

const STORAGE_KEY = 'portfolio-chat-history';
const QUICK_CHAT_PROMPTS = [
    'Ceritakan tentang Syamil',
    'Apa saja skill Syamil?',
    'Lihat proyek terbaru',
    'Bagaimana cara menghubungi Syamil?',
    'Apa pengalaman kerja Syamil?',
    'Apa keahlian utama Syamil?',
    'Ceritakan latar belakang Syamil',
    'Teknologi apa yang Syamil gunakan?',
    'Apa proyek paling menarik?',
    'Apakah Syamil tersedia untuk bekerja sama?',
    'Di mana Syamil pernah bekerja?',
    'Buka profil LinkedIn Syamil',
];

const getRandomQuickChats = () =>
    [...QUICK_CHAT_PROMPTS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [quickChats, setQuickChats] = useState(getRandomQuickChats);
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

    useEffect(() => {
        if (!isOpen) return;

        const frame = requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'auto',
            });
        });

        return () => cancelAnimationFrame(frame);
    }, [isOpen]);

    useEffect(() => {
        const handleOpenChat = () => {
            setIsOpen(true);
            setQuickChats(getRandomQuickChats());
        };
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, []);

    const isLoading = status === 'submitted' || status === 'streaming';

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage({ text: input });
        setInput('');
        setQuickChats([]);
    };

    const handleQuickChat = (prompt: string) => {
        if (isLoading) return;
        sendMessage({ text: prompt });
        setInput('');
        setQuickChats([]);
    };

    const toggleChat = () => {
        if (!isOpen) setQuickChats(getRandomQuickChats());
        setIsOpen((prev) => !prev);
    };

    const clearChat = () => {
        setMessages([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="mb-3 flex h-[80vh] max-h-[520px] w-[calc(100vw-2rem)] sm:w-[370px] flex-col overflow-hidden rounded-2xl border border-line bg-background shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-line bg-panel px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                                    <Bot size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-foreground">Asisten Syamil</p>
                                    <p className="text-[0.62rem] text-foreground/50 font-mono">PORTFOLIO AI</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={clearChat}
                                    className="px-2 py-1 text-[11px] font-mono text-foreground/50 transition hover:cursor-pointer hover:text-foreground"
                                    aria-label="Hapus percakapan"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-md p-1.5 text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground cursor-pointer"
                                    aria-label="Tutup chat"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Area pesan */}
                        <div
                            ref={scrollRef}
                            onClick={() => quickChats.length > 0 && setQuickChats([])}
                            className="[scrollbar-color:rgb(48_48_54_/_35%)_transparent] [scrollbar-width:thin] flex-1 space-y-3.5 overflow-y-auto bg-background/50 px-4 py-4"
                        >
                            {messages.length === 0 && (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-foreground/50 p-4">
                                    <Bot size={28} className="text-primary opacity-60" />
                                    <p className="text-xs max-w-xs leading-relaxed">
                                        Halo! Tanyakan apa saja tentang project, stack, atau latar belakang Syamil.
                                    </p>
                                </div>
                            )}
                            {messages.map((message) => (
                                <ChatMessage key={message.id} message={message} />
                            ))}
                            {error && (
                                <div className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
                                    Error: {error.message}
                                </div>
                            )}
                            {isLoading && <TypingIndicator />}
                        </div>

                        {/* Quick chat */}
                        {quickChats.length > 0 && (
                            <div className="flex items-start justify-end gap-1.5 border-t border-line bg-panel/60 px-3 pt-2 pb-1.5">
                                <div className="flex flex-1 flex-wrap justify-end gap-1.5">
                                    {quickChats.map((prompt) => (
                                        <button
                                            key={prompt}
                                            type="button"
                                            onClick={() => handleQuickChat(prompt)}
                                            disabled={isLoading}
                                            className="shrink-0 rounded-lg border border-line bg-background px-2.5 py-1 text-[0.68rem] text-foreground/80 transition hover:border-primary hover:text-foreground disabled:opacity-40 cursor-pointer"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setQuickChats([])}
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-foreground/40 transition hover:bg-foreground/10 hover:text-foreground cursor-pointer"
                                    aria-label="Tutup quick chat"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        )}

                        {/* Form input */}
                        <form
                            onSubmit={handleSend}
                            className="flex items-center gap-2 border-t border-line bg-panel p-2.5"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Tulis pertanyaan..."
                                disabled={isLoading}
                                className="flex-1 rounded-lg border border-line bg-background px-3 py-2 text-xs text-foreground outline-none transition focus:border-primary disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-foreground transition hover:bg-accent disabled:opacity-30 cursor-pointer"
                                aria-label="Kirim pesan"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={toggleChat}
                className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-primary text-foreground shadow-lg shadow-primary/25 transition hover:bg-accent cursor-pointer"
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
                            <X size={20} />
                        </motion.span>
                    ) : (
                        <motion.span
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <MessageCircle size={20} />
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}