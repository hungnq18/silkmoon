import { useState, useEffect, useRef } from 'react';
import chatLogoImg from '../assets/no-bg.png';
import { analyticsApi, assistantApi, settingsApi } from '../services/api';

export default function Chatbot() {
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [config, setConfig] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Tôi là trợ lý ảo của SILKMOON. Bạn cần tư vấn về chất liệu hay tìm kiếm sản phẩm nào không?',
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    settingsApi.get('assistant_config').then((row) => {
      const next = row?.value || null;
      setConfig(next);
      if (next?.chatbot?.greeting) setMessages((current) => [{ ...current[0], text: next.chatbot.greeting }, ...current.slice(1)]);
    }).catch(() => null);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Hiện lời chào sau 2 giây
    const timer = setTimeout(() => {
      if (!isOpen) setShowGreeting(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowGreeting(false);
      analyticsApi.track({ type: 'chatbot_open', path: window.location.pathname });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await assistantApi.chat(userMessage.text);
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: response.message }]);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: config?.chatbot?.fallbackResponse || 'Xin lỗi, trợ lý đang bận. Vui lòng thử lại sau.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isVisible || config?.chatbot?.enabled === false) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-end" id="chatbot-container">
      {/* Greeting Bubble */}
      {showGreeting && !isOpen && (
        <div className="absolute bottom-full right-full mb-2 mr-3 hidden md:flex animate-fade-in-up items-center bg-white shadow-xl rounded-2xl rounded-br-sm px-4 py-3 border border-slate-deep/5 w-max">
          <p className="text-body-md text-slate-deep font-medium">{config?.chatbot?.greeting || 'Xin chào! Bạn cần tư vấn sản phẩm?'}</p>
          <button 
            onClick={() => setShowGreeting(false)} 
            className="ml-3 text-slate-deep/40 hover:text-slate-deep"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Floating Toggle Button */}
      <div className="relative group animate-float">
        <div className="absolute inset-0 bg-white/50 rounded-full animate-ping"></div>
        <button
          onClick={handleToggle}
          className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 hover:shadow-sage-haze/20 transition-all duration-300 border-2 border-bone overflow-hidden z-10"
          id="chat-toggle"
          aria-label="Toggle chatbot"
        >
          {isOpen ? (
            <span className="material-symbols-outlined text-[28px] text-slate-deep">
              close
            </span>
          ) : (
            <img 
              src={chatLogoImg} 
              alt="Chat with SILKMOON" 
              className="w-full h-full object-contain scale-[1.4]" 
            />
          )}
        </button>
        
        {/* Nút X để tắt hẳn Chatbot */}
        {!isOpen && (
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 bg-slate-deep text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors shadow-md z-[70]"
            aria-label="Tắt chatbot"
          >
            <span className="material-symbols-outlined text-[12px] font-bold">close</span>
          </button>
        )}
      </div>

      {/* Chat Window */}
      <div
        className={`absolute bottom-20 right-0 w-[320px] md:w-96 bg-linen-white rounded-2xl shadow-2xl border border-slate-deep/5 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'
          }`}
        id="chat-window"
      >
        {/* Header */}
        <div className="bg-slate-deep p-stack-md flex items-center gap-3">
          <div className="w-10 h-10 bg-sage-haze rounded-full flex items-center justify-center text-linen-white flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div>
            <p className="font-body-md font-semibold text-linen-white leading-tight">Silkmoon Concierge</p>
            <p className="text-[10px] uppercase tracking-widest text-linen-white/60">Tư vấn giấc ngủ AI</p>
          </div>
          <button
            className="ml-auto text-linen-white/80 hover:text-linen-white p-1"
            onClick={() => setIsOpen(false)}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className="h-80 overflow-y-auto p-stack-md flex flex-col gap-4 bg-bone/30 scrollbar-none" id="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 max-w-[80%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
            >
              <div
                className={`p-3 rounded-2xl shadow-sm text-body-md ${msg.sender === 'user'
                    ? 'bg-sage-haze text-linen-white rounded-tr-none'
                    : 'bg-linen-white text-slate-deep rounded-tl-none'
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex flex-col gap-1 max-w-[80%] self-start items-start">
              <div className="bg-linen-white p-3 rounded-2xl rounded-tl-none text-slate-deep text-body-md shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-slate-deep/40 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-deep/40 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-slate-deep/40 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-stack-md bg-linen-white border-t border-slate-deep/5 flex gap-2">
          <input
            className="flex-grow bg-bone border-none rounded-full px-4 py-2 text-body-md focus:ring-1 focus:ring-sage-haze outline-none text-slate-deep"
            placeholder="Nhập tin nhắn..."
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            type="submit"
            className="w-10 h-10 bg-sage-haze text-linen-white rounded-full flex items-center justify-center hover:opacity-90 flex-shrink-0 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
