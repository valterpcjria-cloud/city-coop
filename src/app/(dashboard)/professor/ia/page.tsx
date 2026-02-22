'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChatHistorySidebar } from '@/components/dashboard/shared/chat-history-sidebar';
import { AnimatedContainer } from '@/components/dashboard/shared/animated-container';

export default function ProfessorAIPage() {
    const [selectedModel, setSelectedModel] = useState<'claude' | 'gpt'>('gpt');
    const [localInput, setLocalInput] = useState('');
    const [searchInternet, setSearchInternet] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const chatState = useChat({
        api: '/api/chat',
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: 'Olá, Professor. Sou o seu DOT Assistente. Estou aqui para oferecer suporte pedagógico, sugerir dinâmicas e ajudar na gestão da sua cooperativa escolar. Como posso auxiliar sua jornada hoje?'
            }
        ],
        onError: (error: Error) => {
            console.error("useChat onError API event:", error);
            // Mostrar a mensagem de erro exata que a API retornou
            toast.error(`Erro: ${error.message || 'Falha na conexão com a IA'}`);
        }
    } as any);

    const messages = chatState.messages || [];
    const status = chatState.status;
    const setMessages = chatState.setMessages;

    // Fallback to append, or handleSubmit, or whatever is there
    console.log("CHATOVERRIDE keys:", Object.keys(chatState || {}));
    const sendMessage = chatState.sendMessage;

    const isLoading = status === 'streaming';

    const handleLocalInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalInput(e.target.value);
    };

    const onSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();
        const currentInput = localInput || '';
        if (!currentInput.trim() || isLoading) return;

        const message = currentInput;
        setLocalInput('');

        if (sendMessage) {
            await sendMessage({ text: message }, {
                body: {
                    conversationId: currentConversationId === 'new' ? null : currentConversationId,
                    model: selectedModel,
                    webSearch: searchInternet
                }
            });

            // Refresh conversation ID if it's new
            if (!currentConversationId || currentConversationId === 'new') {
                setTimeout(() => setRefreshTrigger(prev => prev + 1), 2000);
            }
        }
    };

    const loadHistoryList = async () => {
        // This is handled by the sidebar itself via props or shared trigger
        // Re-fetching the list after a small delay to ensure DB sync
    };

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
                content: 'Olá, Professor. Sou o seu DOT Assistente. Como posso auxiliar sua jornada hoje?'
            } as any
        ]);
        setCurrentConversationId('new');
        setLocalInput('');
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
    }

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
        }
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

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-slate-50 relative overflow-hidden">
            {/* Sidebar for History */}
            <ChatHistorySidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                currentConversationId={currentConversationId}
                onSelectConversation={loadConversation}
                onNewChat={handleNewChat}
                refreshTrigger={refreshTrigger}
            />

            {/* Backdrop for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 relative z-10">
                {/* Mobile Header Toolbar */}
                <div className="lg:hidden flex items-center p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                        <Icons.menu className="h-5 w-5" />
                    </Button>
                    <div className="ml-3 flex flex-col">
                        <span className="text-sm font-bold text-blue-600">DOT Assistente</span>
                        <span className="text-[10px] text-slate-400">Atendimento Premium</span>
                    </div>
                </div>

                <div className="flex-1 w-full overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 transition-all">
                    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 flex flex-col">
                        {messages.length <= 1 && (
                            <div className="text-center space-y-2 mb-12 py-16 flex flex-col items-center">
                                <AnimatedContainer direction="up">
                                    <div className="inline-flex items-center justify-center p-3 mb-4 w-32 h-32 relative z-10 mt-4 overflow-hidden">
                                        <Image src="/dot-bot.png" alt="DOT" width={128} height={128} className="w-full h-full object-contain drop-shadow-xl" priority />
                                    </div>
                                </AnimatedContainer>
                                <h1 className="text-3xl font-black text-[#4A90D9] tracking-tight">DOT Assistente</h1>
                                <p className="text-[#6B7C93] font-medium italic">"Inteligência e cooperação em cada detalhe."</p>

                                <div className="flex justify-center gap-2 mt-6">
                                    <Button
                                        variant={selectedModel === 'claude' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedModel('claude')}
                                        className={cn("rounded-full px-6 transition-all", selectedModel === 'claude' && "bg-[#4A90D9] hover:bg-[#3A7BC8]")}
                                    >
                                        <Icons.sparkles className="h-4 w-4 mr-2" />
                                        Claude
                                    </Button>
                                    <Button
                                        variant={selectedModel === 'gpt' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedModel('gpt')}
                                        className={cn("rounded-full px-6 transition-all", selectedModel === 'gpt' && "bg-[#F5A623] hover:bg-[#E09000]")}
                                    >
                                        <Icons.sparkles className="h-4 w-4 mr-2" />
                                        GPT-4o
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6 pb-12">
                            {messages.map((m: any, i: number) => (
                                <div
                                    key={m.id || `msg-${i}`}
                                    className={cn(
                                        "flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300",
                                        m.role === 'user' ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <Avatar className={cn(
                                        "h-9 w-9 shrink-0 border shadow-sm",
                                        m.role === 'assistant' ? "bg-gradient-to-br from-[#4A90D9] to-[#F5A623]" : "bg-[#F5A623]"
                                    )}>
                                        {m.role === 'assistant' ? (
                                            <div className="p-0.5 w-full h-full flex items-center justify-center overflow-hidden">
                                                <Image src="/dot-bot.png" alt="DOT" width={36} height={36} className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <AvatarFallback className="bg-transparent text-white font-bold text-xs">P</AvatarFallback>
                                        )}
                                    </Avatar>

                                    <div className={cn(
                                        "space-y-2 max-w-[85%]",
                                        m.role === 'user' && "text-right items-end"
                                    )}>
                                        <div className={cn(
                                            "px-4 py-3 rounded-2xl text-[15px] leading-relaxed",
                                            m.role === 'user'
                                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md"
                                                : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm"
                                        )}>
                                            {m.parts && m.parts.length > 0 ? (
                                                m.parts.map((part: any, partIdx: number) => (
                                                    part.type === 'text' && <span key={`part-${partIdx}`}>{part.text}</span>
                                                ))
                                            ) : (
                                                <span className="whitespace-pre-wrap">{m.content}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-4 animate-pulse">
                                    <Avatar className="h-10 w-10 bg-transparent shadow-none p-0">
                                        <div className="p-1 w-full h-full flex items-center justify-center overflow-hidden">
                                            <Image src="/dot-bot.png" alt="DOT" width={40} height={40} className="w-full h-full object-contain" />
                                        </div>
                                    </Avatar>
                                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                                        <div className="flex gap-1 py-1">
                                            <div className="w-1.5 h-1.5 bg-[#4A90D9] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-[#F5A623] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-[#4A90D9] rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>

                <div className="shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 pb-6 px-4 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] transition-all">
                    <div className="max-w-3xl mx-auto space-y-4 pt-4">

                        <div className="flex items-center justify-between px-2 mb-1">
                            <div className="flex gap-1.5 items-center">
                                <span className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider">Cérebro Ativo:</span>
                                <div className={cn(
                                    "h-2 w-2 rounded-full animate-pulse",
                                    selectedModel === 'gpt' ? "bg-[#F5A623]" : "bg-[#4A90D9]"
                                )} />
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                    {selectedModel === 'gpt' ? 'GPT-4o' : 'Claude 3.5'}
                                </span>
                                <div className="h-4 w-[1px] bg-[#6B7C93]/20 mx-1" />
                                <button
                                    type="button"
                                    onClick={() => setSearchInternet(!searchInternet)}
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-0.5 rounded-full transition-all border",
                                        searchInternet
                                            ? "bg-green-50 border-green-200 text-green-700"
                                            : "bg-slate-50 border-slate-200 text-slate-500"
                                    )}
                                >
                                    <Icons.globe className={cn("h-3 w-3", searchInternet && "animate-pulse")} />
                                    <span className="text-[10px] font-bold uppercase">{searchInternet ? 'Web On' : 'Web Off'}</span>
                                </button>
                            </div>
                            <div className="flex gap-3 items-center">
                                <button
                                    type="button"
                                    onClick={handleClearHistory}
                                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                                >
                                    <Icons.trash className="h-3 w-3" />
                                    Limpar BD
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden text-[10px] font-bold text-[#4A90D9] flex items-center gap-1"
                                >
                                    <Icons.menu className="h-3 w-3" />
                                    Histórico
                                </button>
                            </div>
                        </div>

                        <form
                            onSubmit={onSendMessage}
                            className="relative group shadow-xl shadow-blue-500/5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        >
                            <Textarea
                                ref={textareaRef}
                                value={localInput}
                                onChange={handleLocalInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Pergunte ao DOT Assistente..."
                                className="w-full min-h-[56px] max-h-[200px] py-4 pl-4 pr-12 focus-visible:ring-blue-500 border-0 bg-transparent group-hover:border-blue-500/20 transition-all rounded-2xl resize-none scrolling-touch overflow-y-auto dark:text-white"
                                rows={1}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !localInput?.trim()}
                                className={cn(
                                    "absolute right-2 bottom-2 rounded-xl transition-all h-10 w-10 border-0",
                                    localInput?.trim() ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                )}
                            >
                                {isLoading ? (
                                    <Icons.spinner className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Icons.arrowRight className="h-5 w-5" />
                                )}
                                <span className="sr-only">Enviar</span>
                            </Button>
                        </form>
                        <p className="text-[10px] text-center text-slate-400 font-medium">O DOT Assistente pode fornecer sugestões úteis, mas sempre valide as estratégias pedagogicamente.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
