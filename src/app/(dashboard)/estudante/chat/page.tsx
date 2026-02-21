'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ChatHistorySidebar } from '@/components/dashboard/shared/chat-history-sidebar';
import { Textarea } from '@/components/ui/textarea';

export default function ChatPage() {
    const [localInput, setLocalInput] = useState('');
    const [selectedModel, setSelectedModel] = useState<'claude' | 'gpt'>('gpt');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const {
        messages = [],
        status,
        setMessages,
        sendMessage
    } = useChat({
        api: '/api/chat',
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: 'Olá! Sou o seu DOT Assistente. Estou aqui para oferecer suporte pedagógico, sugerir dinâmicas e ajudar na jornada da sua cooperativa escolar. Como posso auxiliar seu núcleo hoje?'
            } as any
        ],
        body: {
            model: selectedModel,
            conversationId: currentConversationId
        },
        onFinish: () => {
            if (!currentConversationId || currentConversationId === 'new') {
                setTimeout(() => setRefreshTrigger(prev => prev + 1), 2000);
            }
        },
        onError: (err: any) => {
            console.error("Chat error:", err);
            toast.error("Ocorreu um erro na conexão com a IA. Tente novamente.");
        }
    } as any);

    const isLoading = status === 'streaming';

    const loadConversation = async (id: string) => {
        try {
            setCurrentConversationId(id);
            const res = await fetch(`/api/ai/history/${id}`);
            const data = await res.json();
            if (data && data.messages) {
                setMessages(data.messages);
            }
        } catch (err) {
            console.error("Failed to load conversation", err);
            toast.error("Não foi possível carregar a conversa.");
        }
    };

    useEffect(() => {
        const loadInitialHistory = async () => {
            try {
                const res = await fetch('/api/ai/history');
                const data = await res.json();
                if (data && data.id) {
                    setCurrentConversationId(data.id);
                    setMessages(data.messages || []);
                }
            } catch (err) {
                console.error("Failed to load chat history", err);
            }
        };
        loadInitialHistory();
    }, [setMessages]);

    const handleNewChat = () => {
        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                content: 'Olá! Sou o DOT Assistente, como posso ajudar seu núcleo hoje?'
            } as any
        ]);
        setCurrentConversationId('new');
        setLocalInput('');
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        scrollToBottom(isLoading ? 'auto' : 'smooth');
    }, [messages, isLoading]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [localInput]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const form = (e.target as HTMLElement).closest('form');
            if (form) form.requestSubmit();
        }
    };

    const onSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();
        const currentInput = localInput || '';
        if (!currentInput.trim() || isLoading) return;

        setLocalInput('');

        if (sendMessage) {
            await sendMessage({ text: currentInput } as any, {
                body: {
                    model: selectedModel,
                    conversationId: currentConversationId
                }
            });

            if (!currentConversationId || currentConversationId === 'new') {
                setTimeout(() => setRefreshTrigger(prev => prev + 1), 2000);
            }
        }
    };

    const handleClearHistory = async () => {
        try {
            await fetch('/api/ai/history', { method: 'DELETE' });
            handleNewChat();
            toast.info("Histórico do servidor limpo com sucesso.");
        } catch (err) {
            console.error("Failed to clear history", err);
            toast.error("Erro ao limpar o histórico.");
        }
    };

    const clearChat = () => {
        handleClearHistory();
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-slate-50 relative overflow-hidden">
            <ChatHistorySidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                currentConversationId={currentConversationId}
                onSelectConversation={loadConversation}
                onNewChat={handleNewChat}
                refreshTrigger={refreshTrigger}
            />

            {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 relative z-10">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                        <Icons.menu className="h-5 w-5" />
                    </Button>
                    <div className="ml-3 flex flex-col">
                        <span className="text-sm font-bold text-[#4A90D9]">DOT Assistente</span>
                        <span className="text-[10px] text-slate-400">Cooperativismo Ativo</span>
                    </div>
                </div>

                <div className="flex-1 w-full overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 flex flex-col">
                        <div className="space-y-6 pb-12">
                            {messages.map((m: any, i: number) => (
                                <div
                                    key={m.id || `msg-${i}`}
                                    className={cn(
                                        "flex gap-4 p-1",
                                        m.role === 'user' ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <Avatar className={cn(
                                        "h-9 w-9 shrink-0 border shadow-sm",
                                        m.role === 'assistant' ? "bg-white p-1 border-[#4A90D9]/20" : "bg-gradient-to-br from-[#4A90D9] to-[#3A7BC8]"
                                    )}>
                                        {m.role === 'assistant' ? (
                                            <img src="/dot-bot.png" alt="DOT" className="w-full h-full object-contain" />
                                        ) : (
                                            <AvatarFallback className="text-white font-bold text-xs uppercase">EU</AvatarFallback>
                                        )}
                                    </Avatar>

                                    <div className={cn(
                                        "px-4 py-3 rounded-2xl text-[14px] leading-relaxed max-w-[85%] shadow-sm",
                                        m.role === 'user'
                                            ? "bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] text-white rounded-tr-none shadow-md"
                                            : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white rounded-tl-none shadow-sm"
                                    )}>
                                        {m.parts && m.parts.length > 0 ? (
                                            m.parts.map((part: any, idx: number) => (
                                                part.type === 'text' && <span key={idx}>{part.text}</span>
                                            ))
                                        ) : (
                                            <span className="whitespace-pre-wrap">{m.content}</span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-4 animate-pulse">
                                    <Avatar className="h-9 w-9 bg-white border border-slate-100 p-1">
                                        <img src="/dot-bot.png" alt="DOT" className="w-full h-full object-contain" />
                                    </Avatar>
                                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none">
                                        <Icons.spinner className="h-4 w-4 animate-spin text-[#4A90D9]" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>

                <div className="shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t p-4 z-10">
                    <div className="max-w-3xl mx-auto space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full">
                                <button
                                    onClick={() => setSelectedModel('gpt')}
                                    className={cn("px-3 py-1 text-[10px] font-bold rounded-full transition-all", selectedModel === 'gpt' ? "bg-[#F5A623] text-white shadow-sm" : "text-slate-400 hover:text-slate-600")}
                                >GPT-4o</button>
                                <button
                                    onClick={() => setSelectedModel('claude')}
                                    className={cn("px-3 py-1 text-[10px] font-bold rounded-full transition-all", selectedModel === 'claude' ? "bg-[#4A90D9] text-white shadow-sm" : "text-slate-400 hover:text-slate-600")}
                                >Claude</button>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearChat}
                                className="h-7 text-[10px] font-bold text-slate-400 hover:text-red-500 gap-1.5"
                            >
                                <Icons.trash className="h-3 w-3" />
                                Limpar
                            </Button>
                        </div>
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-[10px] font-bold text-[#4A90D9]">Ver Histórico</button>

                        <form onSubmit={onSendMessage} className="relative flex gap-2 items-end">
                            <Textarea
                                ref={textareaRef}
                                value={localInput}
                                onChange={(e) => setLocalInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Tire uma dúvida com o DOT..."
                                className="flex-1 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-[#4A90D9] min-h-[50px] max-h-[150px] py-3 rounded-xl resize-none"
                                rows={1}
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !localInput.trim()} className="h-10 w-10 shrink-0 rounded-xl bg-[#4A90D9] hover:bg-[#3A7BC8]">
                                <Icons.arrowRight className="h-5 w-5 text-white" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
