'use client';

import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/ui/icons';

export default function ChatPage() {
    // We'll use Vercel AI SDK's useChat, but since we haven't set up the API route yet, 
    // this will likely error 404 on send unless we mock it or create the route now.
    // For MVP UI demo, we can just use the UI structure. 
    // Actually, let's create a basic API route next to support this.

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: 'Olá! Sou o Coop Buddy, seu assistente de cooperativismo. Como posso ajudar seu núcleo hoje?'
            }
        ]
    });

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
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50/30">
                    <ScrollArea className="h-full p-6">
                        <div className="space-y-4">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
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
                                        {m.content}
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
                        </div>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="p-4 bg-white border-t">
                    <form onSubmit={handleSubmit} className="flex w-full gap-2">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Digite sua dúvida sobre a cooperativa..."
                            className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-blue-600"
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700">
                            <Icons.send className="h-4 w-4" />
                            <span className="sr-only">Enviar</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
