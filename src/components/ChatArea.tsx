import React, { useState, useEffect, useRef } from 'react';
import { 
  Smile, 
  Paperclip, 
  Mic, 
  Send, 
  Video, 
  Phone, 
  Search as SearchIcon, 
  MoreVertical 
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import { analyzeLogisticsMessage } from '../services/geminiService';

interface ChatAreaProps {
  activeChatId: string;
  activeChatName: string;
  currentUser: any;
}

export default function ChatArea({ activeChatId, activeChatName, currentUser }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<'typing' | 'processing' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeChatId) return;

    // In a real app we'd filter by room/chat ID, for this demo we'll use a global 'logistics' thread or specific driver
    const q = query(
      collection(db, 'messages'), 
      orderBy('timestamp', 'asc'),
      // For simplicity, we filter in memory or specify a default thread if 'noa-bridge'
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    }, (error) => {
      console.error("Messages listener error:", error);
    });

    return () => unsubscribe();
  }, [activeChatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');

    // Add user message
    await addDoc(collection(db, 'messages'), {
      text,
      senderId: currentUser?.uid || 'guest',
      senderName: currentUser?.displayName || 'User',
      timestamp: serverTimestamp(),
      type: 'text'
    });

    // Check if it's for NOA or refers to logistics
    if (activeChatId === 'noa-bridge' || text.toLowerCase().includes('noa') || text.includes('נועה')) {
      setStatus('typing');
      
      try {
        const analysis = await analyzeLogisticsMessage(text);
        setStatus('processing');
        
        if (analysis.functionCalls) {
          for (const call of analysis.functionCalls) {
            if (call.name === 'createOrderFromPdf') {
               await addDoc(collection(db, 'messages'), {
                text: `נועה זיהתה הזמנה חדשה עבור ${call.args.customerName}:`,
                senderId: 'noa',
                senderName: 'Noa AI',
                timestamp: serverTimestamp(),
                type: 'order_card',
                orderData: call.args
              });
            } else if (call.name === 'driverReport') {
               await addDoc(collection(db, 'messages'), {
                text: `דיווח נהג התקבל: ${call.args.driverName} ב-${call.args.location}. סטטוס: ${call.args.issueType}`,
                senderId: 'system',
                senderName: 'SabanOS',
                timestamp: serverTimestamp(),
                type: 'system'
              });
            }
          }
        } else {
          await addDoc(collection(db, 'messages'), {
            text: analysis.text || 'מצטערת, לא הבנתי את הבקשה.',
            senderId: 'noa',
            senderName: 'Noa AI',
            timestamp: serverTimestamp(),
            type: 'text'
          });
        }
      } catch (err) {
        console.error("Noa processing error:", err);
      } finally {
        // Natural delay before Noa goes back to 'online'
        setTimeout(() => setStatus(null), 1200);
      }
    }
  };

  const getStatusText = () => {
    if (status === 'typing') return 'נועה מקלידה...';
    if (status === 'processing') return 'נועה מעבדת נתונים...';
    return 'מחוברת';
  };

  return (
    <div className="flex-1 flex flex-col bg-wa-bg relative overflow-hidden">
      {/* WhatsApp Chat Background Mask */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ 
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px'
        }}
      ></div>

      {/* Header */}
      <div className="h-16 bg-wa-header px-4 flex items-center justify-between border-b border-gray-200 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img src={`https://picsum.photos/seed/${activeChatId}/100/100`} alt={activeChatName} referrerPolicy="no-referrer" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{activeChatName}</h3>
            <p className="text-xs text-gray-500 transition-all duration-300">
              {status ? (
                <span className="text-wa-teal font-medium animate-pulse">
                  {getStatusText()}
                </span>
              ) : (
                'מחוברת'
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-6 text-gray-500">
          <Video className="w-5 h-5 cursor-pointer" />
          <Phone className="w-5 h-5 cursor-pointer" />
          <div className="w-[1px] h-6 bg-gray-300"></div>
          <SearchIcon className="w-5 h-5 cursor-pointer" />
          <MoreVertical className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:px-12 lg:px-24 z-10"
      >
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} isUser={msg.senderId === currentUser?.uid} />
        ))}
      </div>

      {/* Input Area */}
      <div className="p-2 bg-wa-header z-10 shrink-0">
        <div className="flex items-center gap-2 max-w-[1200px] mx-auto px-2">
          <div className="flex gap-4 px-2 text-gray-600">
            <Smile className="w-6 h-6 cursor-pointer" />
            <Paperclip className="w-6 h-6 cursor-pointer" />
          </div>
          
          <div className="flex-1">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message"
              className="w-full bg-white rounded-lg py-2.5 px-4 focus:outline-none text-[15px]"
            />
          </div>

          <div className="w-12 h-12 flex items-center justify-center text-gray-600 cursor-pointer">
            {inputText.trim() ? (
              <Send className="w-7 h-7 text-wa-teal" onClick={handleSendMessage} />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
