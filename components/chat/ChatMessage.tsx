import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { UIMessage } from 'ai';

export default function ChatMessage({ message }: { message: UIMessage }) {
    const isUser = message.role === 'user';

    // Safe extraction of text from parts or legacy content
    const text = Array.isArray(message.parts)
        ? message.parts
            .filter((part) => part.type === 'text')
            .map((part) => (part.type === 'text' ? part.text : ''))
            .join('')
        : typeof (message as any).content === 'string'
            ? (message as any).content
            : '';

    // If message is assistant with no text yet (e.g. running tools), don't render empty shell
    if (!isUser && !text.trim()) {
        return null;
    }

    return (
        <div
            className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
            <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                    isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary/15 text-secondary'
                }`}
            >
                {isUser ? (
                    <User size={14} />
                ) : (
                    <Bot size={14} />
                )}
            </div>

            <div
                className={`max-w-[82%] break-words rounded-lg px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                        ? 'rounded-br-sm bg-primary text-primary-foreground font-medium'
                        : 'rounded-bl-sm bg-background/95 border border-line text-foreground shadow-sm'
                }`}
            >
                {isUser ? (
                    // User messages as plain text
                    <span className="whitespace-pre-wrap">{text}</span>
                ) : (
                    // AI messages rendered with styled Markdown
                    <div className="space-y-1.5 text-foreground/95">
                        <ReactMarkdown
                            components={{
                                p: ({ children }) => (
                                    <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>
                                ),
                                ul: ({ children }) => (
                                    <ul className="my-1.5 list-disc pl-4 space-y-0.5">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="my-1.5 list-decimal pl-4 space-y-0.5">{children}</ol>
                                ),
                                li: ({ children }) => (
                                    <li className="leading-relaxed">{children}</li>
                                ),
                                strong: ({ children }) => (
                                    <strong className="font-semibold text-foreground">{children}</strong>
                                ),
                                code: ({ children, className }) => {
                                    const isInline = !className;
                                    if (isInline) {
                                        return (
                                            <code className="rounded bg-panel px-1.5 py-0.5 font-mono text-[11px] text-primary border border-line">
                                                {children}
                                            </code>
                                        );
                                    }
                                    return (
                                        <pre className="my-2 overflow-x-auto rounded-lg bg-panel p-2.5 font-mono text-[11px] border border-line text-foreground">
                                            <code>{children}</code>
                                        </pre>
                                    );
                                },
                                a: ({ href, children }) => {
                                    const isInternalLink = href?.startsWith('#');
                                    return (
                                        <a
                                            href={href}
                                            target={isInternalLink ? undefined : '_blank'}
                                            rel={isInternalLink ? undefined : 'noopener noreferrer'}
                                            className="font-medium text-primary underline underline-offset-4 hover:opacity-80 transition"
                                        >
                                            {children}
                                        </a>
                                    );
                                },
                            }}
                        >
                            {text}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}