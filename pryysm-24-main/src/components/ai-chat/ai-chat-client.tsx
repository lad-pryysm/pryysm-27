
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Loader2, Send, User, MessageSquare, Plus, Trash2, Edit, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { chat } from "@/ai/flows/chat-flow";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface Conversation {
  id: number;
  title: string;
  messages: Message[];
}

export function AiChatClient() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start with a new chat if no conversations exist
    if (conversations.length === 0) {
      startNewChat();
    } else if (activeConversationId === null) {
      setActiveConversationId(conversations[0].id);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [conversations, activeConversationId]);
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const startNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now(),
      title: "New Chat",
      messages: []
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };
  
  const deleteChat = (id: number) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      if (conversations.length > 1) {
        setActiveConversationId(conversations.filter(c => c.id !== id)[0].id);
      } else {
        startNewChat();
      }
    }
  }

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageContent };
    
    let currentConvoId = activeConversationId;
    let isNewConvo = activeConversation?.messages.length === 0;

    // Update state with user message
    setConversations(prev => 
      prev.map(c => 
        c.id === currentConvoId 
          ? { ...c, messages: [...c.messages, userMessage] } 
          : c
      )
    );
    
    setInput('');
    setIsLoading(true);

    try {
      const history = activeConversation?.messages.map(m => ({ role: m.role, content: m.content })) || [];
      const result = await chat({
        prompt: messageContent,
        history: history,
      });

      const modelMessage: Message = { role: 'model', content: result.response };
      
      setConversations(prev => 
        prev.map(c => {
          if (c.id === currentConvoId) {
            // If it was a new conversation, set its title from the first message
            const newTitle = isNewConvo ? messageContent.substring(0, 40) + '...' : c.title;
            return { ...c, title: newTitle, messages: [...c.messages, modelMessage] };
          }
          return c;
        })
      );

    } catch (error) {
      console.error("AI Chat Error:", error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "The AI failed to generate a response. Please try again.",
      });
       // Remove the user message if AI fails
      setConversations(prev => 
        prev.map(c => 
          c.id === currentConvoId 
            ? { ...c, messages: c.messages.slice(0, -1) } 
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Sidebar for Chat History */}
      <aside className="hidden md:flex flex-col w-72 border-r bg-background">
        <div className="p-4 border-b">
          <Button className="w-full justify-start" variant="outline" onClick={startNewChat}>
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
            <nav className="p-2 space-y-1">
            {conversations.map(convo => (
                <a
                    key={convo.id}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveConversationId(convo.id); }}
                    className={cn(
                        "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                        activeConversationId === convo.id ? "bg-muted text-primary" : "text-muted-foreground"
                    )}
                >
                    <MessageSquare className="mr-3 h-4 w-4" />
                    <span className="truncate flex-1">{convo.title}</span>
                     <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteChat(convo.id) }}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                    </Button>
                </a>
            ))}
            </nav>
        </ScrollArea>
      </aside>

      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold">{activeConversation?.title}</h1>
            </div>
            <Button asChild variant="outline" size="sm">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                </Link>
            </Button>
        </header>

        <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef as any}>
                <div className="p-6 space-y-8">
                    {activeConversation?.messages.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground pt-20">
                            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                               <Bot className="h-12 w-12 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold">How can I help you today?</h2>
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                                <Button variant="outline" className="h-auto p-4 flex-col items-start text-left" onClick={() => handleSendMessage("List all printers and their status")}>
                                    <p className="font-semibold">List Printers</p>
                                    <p className="text-xs text-muted-foreground">and their current operational status.</p>
                                </Button>
                                <Button variant="outline" className="h-auto p-4 flex-col items-start text-left" onClick={() => handleSendMessage("Which projects are currently in progress?")}>
                                    <p className="font-semibold">Check Project Workflow</p>
                                    <p className="text-xs text-muted-foreground">to see which projects are being printed.</p>
                                </Button>
                                <Button variant="outline" className="h-auto p-4 flex-col items-start text-left" onClick={() => handleSendMessage("What's the stock level of PLA filament?")}>
                                    <p className="font-semibold">Check Inventory</p>
                                    <p className="text-xs text-muted-foreground">for a specific raw material or part.</p>
                                </Button>
                                <Button variant="outline" className="h-auto p-4 flex-col items-start text-left" onClick={() => handleSendMessage("Show me all orders from Design Co.")}>
                                    <p className="font-semibold">Find Orders</p>
                                    <p className="text-xs text-muted-foreground">from a specific customer or with a certain status.</p>
                                </Button>
                            </div>
                        </div>
                    )}
                    {activeConversation?.messages.map((message, index) => (
                        <div key={index} className={cn("flex items-start gap-4 w-full", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                            {message.role === 'model' && ( <Avatar className="h-9 w-9 border"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback></Avatar> )}
                            <div className={cn("max-w-2xl rounded-lg px-4 py-3 text-sm", message.role === 'user' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none border")}>
                                <ReactMarkdown className={cn("prose max-w-none prose-p:m-0", message.role === 'user' ? 'prose-invert' : 'dark:prose-invert')} remarkPlugins={[remarkGfm]}>
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                            {message.role === 'user' && ( <Avatar className="h-9 w-9 border"><AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="man face"/><AvatarFallback>AU</AvatarFallback></Avatar> )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4 justify-start">
                            <Avatar className="h-9 w-9 border"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback></Avatar>
                            <div className="max-w-xl rounded-lg px-4 py-3 text-sm bg-muted flex items-center border">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>

        <div className="border-t bg-background/95 p-4 backdrop-blur-sm">
            <div className="relative max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything about your 3D printing farm..."
                        className="flex-1 rounded-full h-12 px-6"
                        disabled={isLoading}
                        autoFocus
                    />
                    <Button type="submit" size="icon" className="rounded-full w-12 h-12" disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
      </main>
    </div>
  );
}
