import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import type { UIMessage } from 'ai';

export default function ChatMessage({ message }: { message: UIMessage }) {
    const isUser = message.role === 'user';

    // AI SDK v5 menyimpan teks di dalam array "parts"
    const text = message.parts
        .filter((part) => part.type === 'text')
        .map((part) => (part.type === 'text' ? part.text : ''))
        .join('');

    return (
        <div
            className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
        >
            <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isUser
                        ? 'bg-indigo-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
            >
                {isUser ? (
                    <User size={14} className="text-white" />
                ) : (
                    <Bot
                        size={14}
                        className="text-gray-600 dark:text-gray-300"
                    />
                )}
            </div>

            <div
                className={`max-w-[75%] wrap-break-word rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${isUser
                        ? 'rounded-br-sm bg-indigo-600 text-white'
                        : 'rounded-bl-sm bg-white text-gray-800 shadow-sm dark:bg-gray-800 dark:text-gray-100'
                    }`}
            >
                {isUser ? (
                    // Pesan user tetap plain text
                    <span className="whitespace-pre-wrap">{text}</span>
                ) : (
                    // Pesan AI dirender sebagai Markdown
                    <ReactMarkdown
                        components={{
                            a: ({ href, children }) => {
                                const isInternalLink =
                                    href?.startsWith('#');

                                if (isInternalLink) {
                                    return (
                                        <a
                                            href={href}
                                            className="font-medium underline underline-offset-4 hover:opacity-80"
                                        >
                                            {children}
                                        </a>
                                    );
                                }

                                return (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium underline underline-offset-4 hover:opacity-80"
                                    >
                                        {children}
                                    </a>
                                );
                            },
                        }}
                    >
                        {text}
                    </ReactMarkdown>
                )}
            </div>
        </div>
    );
}