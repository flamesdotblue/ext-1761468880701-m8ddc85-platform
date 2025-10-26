import React, { useRef, useState } from 'react';
import { Bot, Send } from 'lucide-react';

export default function ChatSidebar({ onQuery }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Ask me in plain English. Example: Show me all customers from California' },
  ]);
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    // Directly retrieve output by applying filters via onQuery
    onQuery(text);
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', content: 'Applied filters and updated results.' }]);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, 200);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid place-items-center">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-medium">AI Assistant</div>
          <div className="text-[11px] text-slate-500">Natural language filters</div>
        </div>
      </div>
      <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === 'assistant' ? 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200' : 'bg-sky-600 text-white ml-auto'}`}>{m.content}</div>
        ))}
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800 p-2">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder="Ask in plain English..."
            className="flex-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
          />
          <button onClick={send} className="inline-flex items-center gap-2 rounded-md bg-sky-600 text-white px-3 py-2 text-sm hover:bg-sky-700">
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
