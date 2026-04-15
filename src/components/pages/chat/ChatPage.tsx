import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import Header from '../../layout/Header';
import { chatApi } from '../../../services/api';
import { useAppSelector } from '../../../hooks/useStore';
import { roleColor, timeAgo } from '../../../utils/format';
import { Badge } from '../../ui';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', sender_id: 'a1', sender_name: 'Bami',      sender_role: 'super_admin', message: 'Hey team, just deployed the new subscription changes.',    created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: '2', sender_id: 'a2', sender_name: 'Support 1', sender_role: 'support',     message: 'Got it! I noticed a couple users already on the new plan.', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', sender_id: 'a3', sender_name: 'Dev Team',  sender_role: 'developer',   message: 'The webhook logs look clean. All events are processing.',    created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: '4', sender_id: 'a1', sender_name: 'Bami',      sender_role: 'super_admin', message: 'Stripe renewal flow is confirmed working. Paystack next.', created_at: new Date(Date.now() - 900000).toISOString() },
];

export default function ChatPage() {
  const { user }      = useAppSelector(s => s.auth);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await chatApi.sendMessage(text);
      const newMsg: Message = {
        id:          Date.now().toString(),
        sender_id:   user!.id,
        sender_name: user!.full_name,
        sender_role: user!.role,
        message:     text,
        created_at:  new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMsg]);
      setText('');
    } catch {
      // optimistic add even if API fails in dev
      const newMsg: Message = {
        id:          Date.now().toString(),
        sender_id:   user!.id,
        sender_name: user!.full_name,
        sender_role: user!.role,
        message:     text,
        created_at:  new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMsg]);
      setText('');
    } finally { setSending(false); }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return <div className="animate-fade-in">
          <Header title="Team Chat" subtitle="Internal admin communication" />
          <div className="p-6 space-y-6">
    
          </div>
      </div>

  return (
    <div className="animate-fade-in flex flex-col h-screen">
      <Header title="Team Chat" subtitle="Internal admin communication" />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => {
          const isMe    = m.sender_id === user?.id;
          const showAvatar = i === 0 || messages[i - 1].sender_id !== m.sender_id;
          return (
            <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              {showAvatar ? (
                <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-xs font-medium text-brand-400 flex-shrink-0 mt-0.5">
                  {m.sender_name.charAt(0).toUpperCase()}
                </div>
              ) : <div className="w-8 flex-shrink-0" />}
              <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {showAvatar && (
                  <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <p className="text-xs text-white/60 font-medium">{m.sender_name}</p>
                    <Badge className={`text-[10px] ${roleColor(m.sender_role)}`}>{m.sender_role.replace('_', ' ')}</Badge>
                  </div>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe ? 'bg-brand-600/20 text-white/90 rounded-tr-sm' : 'bg-surface-3 text-white/80 rounded-tl-sm'
                }`}>
                  {m.message}
                </div>
                <p className="text-[10px] text-white/20">{timeAgo(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/5 bg-surface-1">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey}
            rows={1} placeholder="Send a message to your team..."
            className="input flex-1 resize-none min-h-[40px] max-h-32 py-2.5 text-sm leading-relaxed" />
          <button onClick={send} disabled={!text.trim() || sending}
            className="btn-primary px-3 py-2.5 flex-shrink-0 disabled:opacity-40">
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-[10px] text-white/15 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
