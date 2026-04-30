import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import AdminNav from '../../components/AdminNav';
import { fetchChatMessages, fetchChats, uploadImage } from '../../services/chatService';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
if (typeof window !== 'undefined') {
  console.log('[Socket Config] SOCKET_URL:', SOCKET_URL);
}

function AdminChats() {
  const socketRef = useRef(null);
  const selectedChatIdRef = useRef('');
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [typing, setTyping] = useState(false);

  const selectedChat = useMemo(
    () => chats.find((chat) => Number(chat.id) === Number(selectedChatId)),
    [chats, selectedChatId]
  );

  const loadChats = async () => {
    const data = await fetchChats();
    setChats(data || []);
  };

  const loadMessages = async (chatId) => {
    if (!chatId) return;
    const data = await fetchChatMessages(chatId);
    setMessages(data.messages || []);
  };

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    loadChats();

    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });

    socketRef.current.on('chat:message', (incoming) => {
      if (Number(incoming.chatId) === Number(selectedChatIdRef.current)) {
        setMessages((prev) => [...prev, incoming]);
      }
      loadChats();
    });

    socketRef.current.on('chat:typing', ({ sender, typing: isTyping }) => {
      if (sender === 'customer') setTyping(Boolean(isTyping));
    });

    socketRef.current.on('chat:history', ({ chatId, history }) => {
      if (Number(chatId) === Number(selectedChatIdRef.current)) {
        setMessages(history || []);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const openChat = async (chatId) => {
    setSelectedChatId(chatId);
    await loadMessages(chatId);

    socketRef.current.emit('chat:connect', { chatId: Number(chatId) });
    socketRef.current.emit('chat:history', { chatId: Number(chatId) });
  };

  const send = async () => {
    if (!selectedChatId || (!messageText.trim() && !imageFile)) return;

    let imageUrl;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    socketRef.current.emit('chat:message', {
      chatId: Number(selectedChatId),
      sender: 'admin',
      messageText: messageText.trim() || undefined,
      imageUrl
    });

    setMessageText('');
    setImageFile(null);
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <AdminNav />

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <aside className="surface-panel p-3">
          <h1 className="mb-3 font-heading text-2xl text-slate-900">Chats</h1>
          <div className="space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => openChat(chat.id)}
                className={`w-full rounded-xl border p-2 text-left text-sm ${
                  Number(selectedChatId) === Number(chat.id)
                    ? 'border-orange-200 bg-orange-50 text-orange-700'
                    : 'border-slate-200 bg-white text-slate-800'
                }`}
              >
                <p className="font-semibold">{chat.customerName}</p>
                <p className="text-xs text-slate-500">{chat.phone}</p>
              </button>
            ))}
          </div>
        </aside>

        <div className="surface-panel p-4">
          {!selectedChatId && <p className="text-sm text-slate-500">Select a chat to view messages.</p>}

          {selectedChatId && (
            <>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                {selectedChat?.customerName} ({selectedChat?.phone})
              </h2>

              <div className="h-80 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-xl border p-2 text-sm ${
                      message.sender === 'admin'
                        ? 'border-orange-200 bg-orange-50 text-right'
                        : 'border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    {message.messageText && <p>{message.messageText}</p>}
                    {message.imageUrl && (
                      <img src={message.imageUrl} alt="chat" className="mt-2 max-h-44 rounded object-cover" />
                    )}
                    <p className="mt-1 text-[10px] text-slate-500">
                      {new Date(message.createdAt || Date.now()).toLocaleString()}
                    </p>
                  </div>
                ))}
                {typing && <p className="text-xs text-slate-500">Customer is typing...</p>}
              </div>

              <div className="mt-3 space-y-2">
                <input
                  value={messageText}
                  onChange={(event) => {
                    setMessageText(event.target.value);
                    socketRef.current.emit('chat:typing', {
                      chatId: Number(selectedChatId),
                      sender: 'admin',
                      typing: event.target.value.length > 0
                    });
                  }}
                  placeholder="Type reply"
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                />
                <button type="button" onClick={send} className="btn-primary">
                  Send Reply
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminChats;
