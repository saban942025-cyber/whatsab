import React from 'react';
import { Check, CheckCheck, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

export default function MessageBubble({ message, isUser }: MessageBubbleProps) {
  const isSystem = message.type === 'system';
  const isOrder = message.type === 'order_card';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-lg text-xs text-blue-600 font-medium">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[70%] px-3 pt-1 pb-1 rounded-lg shadow-sm relative min-w-[80px] ${
          isUser ? 'bg-wa-bubble-user rounded-tr-none' : 'bg-wa-bubble-other rounded-tl-none'
        }`}
      >
        <div className="text-[14.2px] leading-relaxed mb-4 whitespace-pre-wrap">
          {message.text}
        </div>

        {isOrder && message.orderData && (
          <div className="mt-2 bg-white rounded-md p-3 border border-gray-100 mb-4">
            <div className="flex items-center gap-2 mb-2 text-wa-teal font-semibold">
              <Clock className="w-4 h-4" />
              <span>Saban Intelligence: DeepDiveCard</span>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>לקוח:</strong> {message.orderData.customerName}</p>
              <p><strong>פרטים:</strong> {Array.isArray(message.orderData?.items) ? message.orderData.items.join(', ') : 'N/A'}</p>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 py-1.5 bg-wa-teal text-white rounded text-xs font-medium hover:bg-wa-teal-dark transition-colors">
                Approve (SabanOS)
              </button>
              <button className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors">
                Edit
              </button>
            </div>
          </div>
        )}

        <div className="absolute bottom-1 right-2 flex items-center gap-1">
          <span className="text-[11px] text-gray-500">
            {message.timestamp?.toDate ? format(message.timestamp.toDate(), 'HH:mm') : '...'}
          </span>
          {isUser && <CheckCheck className="w-3 h-3 text-blue-500" />}
        </div>
      </div>
    </div>
  );
}
