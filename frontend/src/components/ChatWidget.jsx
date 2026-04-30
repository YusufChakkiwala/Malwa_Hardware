import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { uploadImage } from '../services/chatService';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
if (typeof window !== 'undefined') {
  console.log('[Socket Config] SOCKET_URL:', SOCKET_URL);
}

function getInitialProfile() {
  const saved = localStorage.getItem('chat_profile');
  if (!saved) return { customerName: '', phone: '', shopName: '' };
  try {
    return JSON.parse(saved);
  } catch {
    return { customerName: '', phone: '', shopName: '' };
  }
}

function ChatWidget() {
  const socketRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState(() => localStorage.getItem('chat_id') || '');
  const [profile, setProfile] = useState(getInitialProfile);
  const [messageText, setMessageText] = useState('');
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });

      socketRef.current.on('chat:history', ({ history, chatId: incomingChatId }) => {
        if (incomingChatId && Number(incomingChatId) === Number(chatId || incomingChatId)) {
          setMessages(history || []);
        }
      });

      socketRef.current.on('chat:message', (incoming) => {
        setMessages((prev) => [...prev, incoming]);
        if (!open && incoming.sender === 'admin') {
          setUnread((count) => count + 1);
        }
      });

      socketRef.current.on('chat:typing', ({ sender, typing: isTyping }) => {
        if (sender === 'admin') {
          setTyping(Boolean(isTyping));
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    if (!open || !chatId || !socketRef.current) return;
    socketRef.current.emit('chat:connect', { chatId: Number(chatId) }, (response) => {
      if (response?.ok) {
        setMessages(response.history || []);
      }
    });
  }, [open, chatId]);

  const canStart = useMemo(() => profile.customerName.trim() && profile.phone.trim(), [profile]);

  const connectChat = () => {
    if (!socketRef.current) return;

    setConnecting(true);
    const payload = chatId
      ? { chatId: Number(chatId) }
      : {
          customerName: profile.customerName,
          phone: profile.phone,
          shopName: profile.shopName
        };

    socketRef.current.emit('chat:connect', payload, (response) => {
      setConnecting(false);
      if (!response?.ok) {
        return;
      }

      const newChatId = String(response.chatId);
      setChatId(newChatId);
      localStorage.setItem('chat_id', newChatId);
      localStorage.setItem('chat_profile', JSON.stringify(profile));
      setMessages(response.history || []);
    });
  };

  const handleSend = async () => {
    if (!socketRef.current || !chatId) return;
    if (!messageText.trim() && !file) return;

    let imageUrl;
    if (file) {
      imageUrl = await uploadImage(file);
    }

    socketRef.current.emit('chat:message', {
      chatId: Number(chatId),
      sender: 'customer',
      messageText: messageText.trim() || undefined,
      imageUrl
    });

    setMessageText('');
    setFile(null);
  };

  const onTyping = (value) => {
    setMessageText(value);
    if (!socketRef.current || !chatId) return;
    socketRef.current.emit('chat:typing', {
      chatId: Number(chatId),
      sender: 'customer',
      typing: value.length > 0
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        type="button"
        className="relative rounded-full border border-orange-300 bg-gradient-to-br from-orange-500 to-orange-600 px-5 py-3 font-semibold text-white shadow-industrial"
        onClick={() => setOpen((prev) => !prev)}
      >
        Need Help?
        {unread > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 text-xs text-white">{unread}</span>
        )}
      </button>

      {open && (
        <div className="float-in mt-3 w-80 rounded-3xl border border-slate-200 bg-white/95 p-3 text-slate-900 shadow-industrial">
          <h4 className="mb-1 font-heading text-xl text-slate-900">Live Support</h4>
          <p className="mb-2 text-xs text-slate-500">Share your requirement and get a quick response.</p>

          {!chatId && (
            <div className="space-y-2 pb-3">
              <input
                value={profile.customerName}
                onChange={(event) => setProfile((prev) => ({ ...prev, customerName: event.target.value }))}
                placeholder="Your name"
              />
              <input
                value={profile.phone}
                onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Phone"
              />
              <input
                value={profile.shopName}
                onChange={(event) => setProfile((prev) => ({ ...prev, shopName: event.target.value }))}
                placeholder="Shop name (optional)"
              />
              <button
                type="button"
                disabled={!canStart || connecting}
                onClick={connectChat}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {connecting ? 'Connecting...' : 'Start Chat'}
              </button>
            </div>
          )}

          {chatId && (
            <>
              <div className="h-64 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-2">
                {messages.map((message) => (
                  <div
                    key={message.id || `${message.createdAt}-${message.messageText}`}
                    className={`rounded-xl p-2 text-xs ${
                      message.sender === 'customer'
                        ? 'border border-orange-200 bg-orange-50 text-right'
                        : 'border border-slate-200 bg-white text-left'
                    }`}
                  >
                    {message.messageText && <p>{message.messageText}</p>}
                    {message.imageUrl && (
                      <img src={message.imageUrl} alt="chat upload" className="mt-2 max-h-32 rounded object-cover" />
                    )}
                    <p className="mt-1 text-[10px] text-slate-500">
                      {new Date(message.createdAt || Date.now()).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {typing && <p className="text-[10px] text-slate-500">Owner is typing...</p>}
              </div>

              <div className="mt-2 space-y-2">
                <input
                  value={messageText}
                  onChange={(event) => onTyping(event.target.value)}
                  placeholder="Type a message"
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="btn-primary w-full"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
