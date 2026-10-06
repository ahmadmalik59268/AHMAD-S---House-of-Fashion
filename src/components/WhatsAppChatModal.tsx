import React, { useState } from 'react';
import { X, Send, PhoneCall, ExternalLink } from 'lucide-react';

interface WhatsAppChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.771.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.806-5.768-5.806zm0 10.455c-.908 0-1.638-.242-2.378-.682l-.17-.101-1.764.463.471-1.72-.111-.177c-.482-.767-.737-1.464-.736-2.472.001-2.474 2.015-4.488 4.688-4.488 2.473 0 4.487 2.014 4.487 4.488 0 2.473-2.014 4.689-4.487 4.689zm2.464-3.374c-.135-.067-.8-.395-.924-.44-.124-.045-.214-.067-.304.067-.09.135-.35.44-.429.53-.079.09-.158.101-.293.034-.135-.068-.57-.21-1.085-.67-.401-.358-.672-.8-.751-.935-.079-.135-.008-.208.06-.275.061-.061.135-.158.203-.237.067-.079.09-.135.135-.225.045-.09.022-.169-.011-.237-.034-.067-.304-.732-.417-1.002-.11-.263-.222-.227-.304-.231l-.259-.004c-.09 0-.236.034-.36.169-.124.135-.473.462-.473 1.127 0 .664.484 1.306.552 1.396.067.09 1.058 1.616 2.564 2.266.358.155.638.247.856.317.36.114.688.098.947.059.289-.043.889-.364 1.014-.715.124-.351.124-.653.087-.716-.037-.063-.127-.1-.262-.167z" />
    <path d="M12.04 2c-5.523 0-10 4.477-10 10 0 1.766.46 3.424 1.266 4.869L2 22l5.289-1.263C8.687 21.528 10.315 22 12.04 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.25c-1.579 0-3.088-.445-4.385-1.218l-.315-.187-3.255.777.868-3.172-.205-.327C3.93 14.805 3.5 13.435 3.5 12c0-4.714 3.836-8.55 8.54-8.55 4.705 0 8.54 3.836 8.54 8.55 0 4.714-3.835 8.25-8.54 8.25z" />
  </svg>
);

export const WhatsAppChatModal: React.FC<WhatsAppChatModalProps> = ({ isOpen, onClose }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'agent' | 'user'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'Salam! Welcome to AHMAD\'S House of Fashion. How can we help you with your order, custom sizing, or delivery today?',
      time: 'Just now',
    },
  ]);

  if (!isOpen) return null;

  const quickReplies = [
    'How do I book custom measurements?',
    'What is delivery time to Lahore / Karachi?',
    'Are customs & taxes covered for UK/USA/UAE?',
    'Can I pay via Cash on Delivery?',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    setTimeout(() => {
      let reply = 'Thank you for contacting us! Our team is online on WhatsApp. You can also click the button below to chat directly with our stylist at 0332-6109729.';
      if (text.toLowerCase().includes('custom') || text.toLowerCase().includes('measurement')) {
        reply = 'For custom stitching, select "Stitched" -> "Custom" on any product page. Our stylist will WhatsApp you directly at 0332-6109729 to take your exact body measurements!';
      } else if (text.toLowerCase().includes('delivery') || text.toLowerCase().includes('lahore')) {
        reply = 'Within Pakistan (Lahore, Karachi, Islamabad, etc.), standard express delivery takes 2 to 3 business days via TCS courier. Worldwide DHL express takes 5 to 7 business days.';
      } else if (text.toLowerCase().includes('tax') || text.toLowerCase().includes('customs')) {
        reply = 'All international orders include 100% prepaid customs duties and import taxes. You will not pay any extra fees upon arrival in UK, USA, UAE, or Canada!';
      } else if (text.toLowerCase().includes('cash on delivery') || text.toLowerCase().includes('cod')) {
        reply = 'Yes! Cash on Delivery (COD) is available across all cities and towns in Pakistan with zero extra fee.';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 450);
  };

  const directWhatsAppUrl = `https://wa.me/923326109729?text=${encodeURIComponent(
    'Salam AHMAD\'S, I am inquiring from your website about your Luxury Collections.'
  )}`;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] max-w-[360px] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col transition-all animate-in fade-in slide-in-from-bottom-5 duration-200">
      {/* WhatsApp Header */}
      <div className="p-4 bg-[#075E54] text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-inner">
              <WhatsAppIcon className="w-6 h-6 fill-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full" />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight flex items-center gap-1.5">
              <span>AHMAD&apos;S WhatsApp</span>
            </h3>
            <p className="text-[11px] text-emerald-200 font-light">+92 332 6109729 · Active Now</p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close chat"
          className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message History */}
      <div className="p-4 h-64 overflow-y-auto space-y-3 bg-[#EFEAE2] text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed shadow-xs ${
                m.sender === 'user'
                  ? 'bg-[#DCF8C6] text-stone-900 rounded-tr-none'
                  : 'bg-white text-stone-900 rounded-tl-none'
              }`}
            >
              <p>{m.text}</p>
              <span className="block text-[9px] text-stone-400 text-right mt-1">
                {m.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Option Pills */}
      <div className="p-2 bg-stone-100 border-t border-stone-200 flex gap-1.5 overflow-x-auto text-[11px]">
        {quickReplies.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 bg-white border border-stone-300 rounded-full whitespace-nowrap text-stone-700 hover:border-emerald-600 hover:text-emerald-700 transition-colors shrink-0 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="p-2.5 border-t border-stone-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 text-xs px-3.5 py-2 border border-stone-300 rounded-full focus:outline-none focus:border-[#075E54]"
        />
        <button
          onClick={() => handleSend()}
          className="p-2 rounded-full bg-[#075E54] hover:bg-[#128C7E] text-white transition-colors cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Direct WhatsApp Call to Action Button */}
      <a
        href={directWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-center text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-inner"
      >
        <WhatsAppIcon className="w-4 h-4 fill-white" />
        <span>Chat Directly on WhatsApp (+92 332 6109729)</span>
        <ExternalLink className="w-3.5 h-3.5 stroke-[2]" />
      </a>
    </div>
  );
};
