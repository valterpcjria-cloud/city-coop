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
                content: 'Olá! Sou o Coop Buddy, seu assistente de cooperativismo. Como posso ajudar seu núcleo hoje?'
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
                    content: 'Olá! Sou o Coop Buddy, seu assistente de cooperativismo. Como posso ajudar seu núcleo hoje?'
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
            <Card className="w-full max-w-2xl h-full flex flex-col shadow-lg">
                <CardHeader className="border-b px-6 py-4 bg-blue-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Icons.spinner className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-blue-900">Coop Buddy</CardTitle>
                            <p className="text-xs text-blue-600 flex items-center gap-1">
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
                                className="text-[10px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                            >
                                <Icons.trash className="h-3 w-3" />
                                Limpar
                            </button>
                            <div className="flex gap-1 bg-white/50 p-1 rounded-lg border border-blue-100">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedModel('claude')}
                                    className={cn("h-7 px-2 text-[10px] font-bold rounded-md", selectedModel === 'claude' ? "bg-blue-600 text-white hover:bg-blue-700" : "text-blue-600 hover:bg-blue-100")}
                                >
                                    Claude
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedModel('gpt')}
                                    className={cn("h-7 px-2 text-[10px] font-bold rounded-md", selectedModel === 'gpt' ? "bg-slate-900 text-white hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100")}
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
                                    className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    {m.role === 'assistant' && (
                                        <Avatar className="h-8 w-8 mt-1 border bg-blue-100">
                                            <AvatarImage src="/bot-avatar.png" />
                                            <AvatarFallback className="bg-blue-100 text-blue-700">CB</AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div
                                        className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm shadow-sm ${m.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-slate-800 border rounded-bl-none'
                                            }`}
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
                                        <Avatar className="h-8 w-8 mt-1 border">
                                            <AvatarFallback className="bg-slate-100">EU</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <Avatar className="h-8 w-8 mt-1 border bg-blue-100">
                                        <AvatarFallback className="bg-blue-100 text-blue-700">CB</AvatarFallback>
                                    </Avatar>
                                    <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-none border shadow-sm">
                                        <Icons.spinner className="h-4 w-4 animate-spin text-slate-400" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="p-4 bg-white border-t shrink-0">
                    <form onSubmit={onSendMessage} className="flex w-full gap-2">
                        <Input
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            placeholder="Digite sua dúvida sobre a cooperativa..."
                            className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-blue-600"
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !localInput.trim()} className="bg-blue-600 hover:bg-blue-700">
                            <Icons.arrowRight className="h-4 w-4" />
                            <span className="sr-only">Enviar</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
