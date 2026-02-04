'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const SUGGESTED_PROMPTS = [
    {
        title: "Dinâmica de Grupo",
        description: "Sugerir uma atividade prática sobre os 7 princípios.",
        prompt: "Pode me sugerir uma dinâmica de grupo criativa para ensinar os 7 princípios do cooperativismo para alunos do 9º ano?"
    },
    {
        title: "Gestão Democrática",
        description: "Como conduzir uma assembleia difícil?",
        prompt: "Como posso mediar uma assembleia onde os alunos estão com dificuldades de chegar a um consenso democrático?"
    },
    {
        title: "Indicadores de Maturidade",
        description: "Explique como avaliar a dimensão organizacional.",
        prompt: "Como posso avaliar de forma prática a maturidade organizacional dos núcleos da cooperativa?"
    }
];

export default function ProfessorAIPage() {
    const [selectedModel, setSelectedModel] = useState<'claude' | 'gpt'>('gpt');
    const [localInput, setLocalInput] = useState('');
    const conversationIdRef = useRef<string | null>(null);

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
                content: 'Olá, Professor. Sou o seu Coop Assistant. Estou aqui para oferecer suporte pedagógico, sugerir dinâmicas e ajudar na gestão da sua cooperativa escolar. Como posso auxiliar sua jornada hoje?'
            }
        ],
        onError: (err: any) => {
            console.error("Chat error:", err);
            toast.error("Ocorreu um erro na conexão com a IA. Tente novamente.");
        }
    } as any);

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
            await sendMessage({ text: message } as any, {
                body: {
                    conversationId: conversationIdRef.current,
                    model: selectedModel
                }
            });
        }
    };

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await fetch('/api/ai/history');
                const data = await res.json();
                if (data && data.messages) {
                    setMessages(data.messages);
                    conversationIdRef.current = data.id;
                }
            } catch (err) {
                console.error("Failed to load chat history", err);
            }
        };
        loadHistory();
    }, [setMessages]);

    const handleNewChat = async () => {
        try {
            // Clear from DB
            await fetch('/api/ai/history', { method: 'DELETE' });

            setMessages([
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: 'Olá, Professor. Sou o seu Coop Assistant. Como posso auxiliar sua jornada hoje?'
                }
            ]);
            conversationIdRef.current = 'new';
            setLocalInput('');
            toast.info("Histórico limpo com sucesso.");
        } catch (err) {
            console.error("Failed to clear history", err);
            toast.error("Erro ao limpar o histórico.");
        }
    };

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [localInput]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const form = (e.target as HTMLElement).closest('form');
            if (form) form.requestSubmit();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] bg-white relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-violet-50/50 rounded-full blur-3xl -z-10" />

            <ScrollArea ref={scrollAreaRef} className="flex-1 w-full">
                <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                    {messages.length <= 1 && (
                        <div className="text-center space-y-2 mb-12 py-10">
                            <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4 shadow-sm">
                                <Icons.ai className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Coop Assistant</h1>
                            <p className="text-slate-500 font-medium italic">"Dois cérebros operam melhor que um."</p>

                            <div className="flex justify-center gap-2 mt-6">
                                <Button
                                    variant={selectedModel === 'claude' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedModel('claude')}
                                    className={cn("rounded-full px-6 transition-all", selectedModel === 'claude' && "bg-indigo-600 hover:bg-indigo-700")}
                                >
                                    <Icons.sparkles className="h-4 w-4 mr-2" />
                                    Claude (Anthropic)
                                </Button>
                                <Button
                                    variant={selectedModel === 'gpt' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedModel('gpt')}
                                    className={cn("rounded-full px-6 transition-all", selectedModel === 'gpt' && "bg-slate-900 hover:bg-slate-800")}
                                >
                                    <Icons.sparkles className="h-4 w-4 mr-2 text-emerald-400" />
                                    GPT-4o (OpenAI)
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {messages.map((m: any, i: number) => (
                            <div
                                key={m.id || `msg-${i}`}
                                className={cn(
                                    "flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300",
                                    m.role === 'user' ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <Avatar className={cn(
                                    "h-8 w-8 shrink-0 border shadow-sm",
                                    m.role === 'assistant' ? "bg-indigo-600 border-indigo-500" : "bg-white"
                                )}>
                                    {m.role === 'assistant' ? (
                                        <AvatarFallback className="text-white">
                                            <Icons.ai className="h-4 w-4" />
                                        </AvatarFallback>
                                    ) : (
                                        <AvatarFallback className="text-slate-600 font-bold text-xs">P</AvatarFallback>
                                    )}
                                </Avatar>

                                <div className={cn(
                                    "space-y-2 max-w-[85%]",
                                    m.role === 'user' && "text-right items-end"
                                )}>
                                    <div className={cn(
                                        "px-4 py-3 rounded-2xl text-[15px] leading-relaxed",
                                        m.role === 'user'
                                            ? "bg-slate-900 text-white rounded-tr-none shadow-md"
                                            : "bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm shadow-slate-200/50"
                                    )}>
                                        {m.parts && m.parts.length > 0 ? (
                                            m.parts.map((part: any, partIdx: number) => (
                                                part.type === 'text' && <span key={`part-${partIdx}`}>{part.text}</span>
                                            ))
                                        ) : (
                                            <span>{m.content}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-4 animate-pulse">
                                <Avatar className="h-8 w-8 bg-indigo-600 border border-indigo-500 shadow-sm">
                                    <AvatarFallback className="text-white">
                                        <Icons.ai className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <div className="flex gap-1 py-1">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </ScrollArea>

            <div className="shrink-0 bg-white border-t border-slate-100 pb-6 px-4 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] focus-within:shadow-[0_-4px_20px_rgba(79,70,229,0.06)] transition-shadow">
                <div className="max-w-3xl mx-auto space-y-4 pt-4">
                    {messages.length <= 1 && !isLoading && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {SUGGESTED_PROMPTS.map((item) => (
                                <button
                                    key={item.title}
                                    onClick={() => setLocalInput(item.prompt)}
                                    className="text-left p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:bg-white hover:shadow-md hover:border-indigo-200 transition-all group"
                                >
                                    <p className="text-xs font-bold text-indigo-700 mb-0.5">{item.title}</p>
                                    <p className="text-[10px] text-indigo-600/70 line-clamp-1">{item.description}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between px-2 mb-1">
                        <div className="flex gap-1.5 items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cérebro Ativo:</span>
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full animate-pulse",
                                selectedModel === 'gpt' ? "bg-emerald-500" : "bg-indigo-600"
                            )} />
                            <span className="text-[11px] font-bold text-slate-700">
                                {selectedModel === 'gpt' ? 'GPT-4o' : 'Claude 3.5 Sonnet'}
                            </span>
                        </div>
                        <div className="flex gap-3 items-center">
                            <button
                                type="button"
                                onClick={handleNewChat}
                                className="text-[10px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                            >
                                <Icons.trash className="h-3 w-3" />
                                Limpar
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedModel(prev => prev === 'claude' ? 'gpt' : 'claude')}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                            >
                                <Icons.refresh className="h-3 w-3" />
                                Alternar
                            </button>
                        </div>
                    </div>

                    <form
                        onSubmit={onSendMessage}
                        className="relative group shadow-2xl shadow-indigo-100/50 rounded-2xl bg-white"
                    >
                        <Textarea
                            ref={textareaRef}
                            value={localInput}
                            onChange={handleLocalInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Pergunte ao Coop Assistant..."
                            className="w-full min-h-[56px] max-h-[200px] py-4 pl-4 pr-12 focus-visible:ring-indigo-500 border-slate-200 group-hover:border-indigo-200 transition-all rounded-2xl resize-none scrolling-touch overflow-y-auto"
                            rows={1}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !localInput?.trim()}
                            className={cn(
                                "absolute right-2 bottom-2 rounded-xl transition-all h-9 w-9",
                                localInput?.trim() ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-400"
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
                    <p className="text-[10px] text-center text-slate-400 font-medium">O Coop Assistant pode fornecer sugestões úteis, mas sempre valide as estratégias pedagogicamente.</p>
                </div>
            </div>
        </div>
    );
}
