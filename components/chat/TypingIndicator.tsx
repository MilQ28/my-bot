import { Bot } from 'lucide-react';

export default function TypingIndicator() {
    return (
        <div className="flex items-end gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary/10">
                <Bot size={14} className="text-secondary" />
            </div>
            <div className="flex items-center gap-1 rounded-lg rounded-bl-sm bg-background px-4 py-3 shadow-sm">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary/60 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary/60 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary/60" />
            </div>
        </div>
    );
}