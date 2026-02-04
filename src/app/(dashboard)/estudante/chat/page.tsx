'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ChatPage() {
    const [localInput, setLocalInput] = useState('');
    const [selectedModel, setSelectedModel] = useState<'claude' | 'gpt'>('gpt');
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
                content: 'Olá! Sou o DOT Assistente, seu mentor de cooperativismo. Como posso ajudar seu núcleo hoje?'
            }
        ]
    } as any) as any;

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
            await fetch('/api/ai/history', { method: 'DELETE' });

            setMessages([
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: 'Olá! Sou o DOT Assistente, seu mentor de cooperativismo. Como posso ajudar seu núcleo hoje?'
                }
            ]);
            conversationIdRef.current = 'new';
            setLocalInput('');
            toast.info("Histórico limpo com sucesso.");
        } catch (err) {
            console.error("Failed to clear history", err);
            toast.error("Erro ao limpar histórico.");
        }
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const isLoading = status === 'streaming';

    const onSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();
        const currentInput = localInput || '';
        if (!currentInput.trim() || isLoading) return;

        setLocalInput('');

        if (sendMessage) {
            await sendMessage({ text: currentInput } as any, {
                body: {
                    model: selectedModel,
                    conversationId: conversationIdRef.current
                }
            });
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
            <Card className="w-full max-w-2xl h-full flex flex-col shadow-xl border-[#4A90D9]/20">
                <CardHeader className="border-b px-6 py-6 bg-gradient-to-r from-[#4A90D9]/5 to-[#F5A623]/5">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex items-center justify-center p-2 shrink-0">
                            <img src="/dot-bot.png" alt="DOT" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <CardTitle className="text-xl text-[#4A90D9] font-black leading-none mb-1.5">DOT Assistente</CardTitle>
                            <p className="text-xs text-[#6B7C93] flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Online
                            </p>
                        </div>
                        <div className="ml-auto flex gap-3 items-center">
                            <button
                                type="button"
                                onClick={handleNewChat}
                                className="text-[10px] font-bold text-[#6B7C93] hover:text-[#4A90D9] flex items-center gap-1 transition-colors"
                            >
                                <Icons.trash className="h-3 w-3" />
                                Limpar
                            </button>
                            <div className="flex gap-1 bg-white/80 p-1 rounded-lg border border-[#6B7C93]/20">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedModel('claude')}
                                    className={cn("h-7 px-2 text-[10px] font-bold rounded-md", selectedModel === 'claude' ? "bg-[#4A90D9] text-white hover:bg-[#3A7BC8]" : "text-[#4A90D9] hover:bg-[#4A90D9]/10")}
                                >
                                    Claude
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedModel('gpt')}
                                    className={cn("h-7 px-2 text-[10px] font-bold rounded-md", selectedModel === 'gpt' ? "bg-[#F5A623] text-white hover:bg-[#E09000]" : "text-[#F5A623] hover:bg-[#F5A623]/10")}
                                >
                                    GPT-4o
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50/30">
                    <ScrollArea className="h-full p-6">
                        <div className="space-y-4">
                            {messages.map((m: any, i: number) => (
                                <div
                                    key={m.id || `msg-${i}`}
                                    className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {m.role === 'assistant' && (
                                        <Avatar className="h-10 w-10 mt-1 border-2 border-[#4A90D9]/20 bg-white p-1 shadow-sm">
                                            <img src="/dot-bot.jpg" alt="DOT" className="w-full h-full object-contain" />
                                        </Avatar>
                                    )}

                                    <div
                                        className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm shadow-sm ${m.role === 'user'
                                            ? 'bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] text-white rounded-br-none shadow-md'
                                            : 'bg-white text-[#1a2332] border border-[#6B7C93]/15 rounded-bl-none'}`}
                                    >
                                        {m.parts && m.parts.length > 0 ? (
                                            m.parts.map((part: any, partIdx: number) => (
                                                part.type === 'text' && <span key={`part-${partIdx}`}>{part.text}</span>
                                            ))
                                        ) : (
                                            <span>{m.content}</span>
                                        )}
                                    </div>

                                    {m.role === 'user' && (
                                        <Avatar className="h-8 w-8 mt-1 border bg-[#F5A623]">
                                            <AvatarFallback className="bg-transparent text-white font-bold text-xs">EU</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <Avatar className="h-10 w-10 mt-1 bg-transparent p-1">
                                        <img src="/dot-bot.png" alt="DOT" className="w-full h-full object-contain" />
                                    </Avatar>
                                    <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-none border border-[#6B7C93]/15 shadow-sm">
                                        <Icons.spinner className="h-4 w-4 animate-spin text-[#4A90D9]" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="p-4 bg-white border-t border-[#6B7C93]/10 shrink-0">
                    <form onSubmit={onSendMessage} className="flex w-full gap-2">
                        <Input
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            placeholder="Digite sua dúvida sobre a cooperativa..."
                            className="flex-1 bg-slate-50 border-[#6B7C93]/20 focus-visible:ring-[#4A90D9] focus-visible:border-[#4A90D9] h-11"
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !localInput.trim()} variant="brand" className="h-11 w-11 rounded-xl">
                            <Icons.arrowRight className="h-5 w-5" />
                            <span className="sr-only">Enviar</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
