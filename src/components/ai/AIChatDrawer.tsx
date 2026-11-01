'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, ChefHat, RefreshCw, MessageSquare } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAI } from '@/contexts/AIContext';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AIChatDrawer() {
  const { isOpen, closeAI, currentRecipeContext } = useAI();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Halo! Saya **Asisten Dapur Resepedia** 👨‍🍳. Ada yang ingin Anda konsultasikan seputar resep Nusantara hari ini? Tanyakan tips mengolah rempah, ide bahan pengganti, atau saran menu lezat dari bahan yang ada di kulkas Anda!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input.trim();
    if (!textToSend || isStreaming) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    setIsStreaming(true);

    // Placeholder for streaming reply
    setMessages((prev) => [...prev, { role: 'model', text: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          currentRecipeContext: currentRecipeContext
            ? {
                title: currentRecipeContext.title,
                region: currentRecipeContext.region,
                ingredients: currentRecipeContext.ingredients,
                instructions: currentRecipeContext.instructions,
                description: currentRecipeContext.description,
              }
            : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Terjadi kendala pada server asisten dapur.');
      }

      if (!response.body) throw new Error('ReadableStream tidak didukung.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'model') {
            updated[lastIdx] = { role: 'model', text: accumulated };
          }
          return updated;
        });
      }
    } catch (err: any) {
      console.error('Streaming error:', err);
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        updated[lastIdx] = {
          role: 'model',
          text: `Maaf, terjadi kendala koneksi: ${err.message || 'Gagal terhubung'}. Silakan coba kembali sesaat lagi.`,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const contextualPrompts = currentRecipeContext
    ? [
        `Apa alternatif bumbu untuk ${currentRecipeContext.title}?`,
        `Bagaimana tips agar masakan ini tidak cepat basi?`,
        `Rekomendasi hidangan pendamping yang cocok?`,
      ]
    : [
        'Punya ayam, santan, dan cabai, masak apa ya?',
        'Tips agar santan tidak pecah saat dimasak?',
        'Ide masakan berkuah gurih khas Jawa Timur',
      ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAI}
        className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        className="relative w-full max-w-md sm:max-w-lg bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col z-10 border-l border-zinc-200 dark:border-zinc-800"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-sm">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Asisten Dapur Resepedia
                </h3>
              </div>
              <p className="text-xs text-zinc-500 truncate max-w-60">
                {currentRecipeContext
                  ? `Membahas: ${currentRecipeContext.title}`
                  : 'Konsultasi Racikan Rempah & Memasak'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAI}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipe context banner if viewing a recipe */}
        {currentRecipeContext && (
          <div className="px-4 py-2 bg-primary/5 dark:bg-primary/10 border-b border-primary/10 text-xs flex items-center justify-between">
            <span className="text-primary font-medium truncate">
              Membahas resep: <strong>{currentRecipeContext.title}</strong>
            </span>
          </div>
        )}

        {/* Chat message list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <ChefHat className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none markdown-content border border-zinc-200/50 dark:border-zinc-700/50'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <Markdown remarkPlugins={[remarkGfm]}>{msg.text || '...'}</Markdown>
                )}
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className="flex items-center gap-2 text-xs font-semibold text-primary animate-pulse pl-11">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Asisten dapur sedang meracik jawaban...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 flex gap-1.5 overflow-x-auto no-scrollbar">
          {contextualPrompts.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSend(chip)}
              disabled={isStreaming}
              className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10 hover:text-primary dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                currentRecipeContext
                  ? `Tanya bumbu ${currentRecipeContext.title}...`
                  : 'Tanya tips bumbu, cara masak, atau menu...'
              }
              disabled={isStreaming}
              className="flex-1 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-3 bg-primary hover:bg-primary-container disabled:opacity-40 text-white rounded-2xl transition-transform active:scale-95 shadow-sm shrink-0"
              title="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
