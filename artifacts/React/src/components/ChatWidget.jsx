import React, { useState, useRef, useEffect } from 'react';
import { MdChat, MdMinimize, MdSend } from 'react-icons/md';
import LoadingSpinner from './LoadingSpinner';

const ChatWidget = ({ api }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: "Hi! I'm your AI inventory assistant. Ask me anything about our products, stock levels, or inventory!",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    if (!api || !api.askInventory) {
      console.error('API not available or askInventory method missing');
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: 'Sorry, the chat service is not available right now. Please try refreshing the page.',
        timestamp: new Date()
      }]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      console.log('Sending question to API:', inputText.trim());
      const response = await api.askInventory(inputText.trim());
      console.log('API response:', response);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response.answer || "Sorry, I couldn't process that request.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: 'Sorry, something went wrong. Please make sure the backend server is running and try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          backgroundColor: '#6366f1',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          animation: 'pulse 2s infinite'
        }}
        onMouseEnter={e => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 25px rgba(99, 102, 241, 0.4)';
        }}
        onMouseLeave={e => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.3)';
        }}
      >
        <MdChat size={28} color="white" />
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '350px',
        height: '500px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideInFromRight 0.3s ease-out'
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#6366f1',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MdChat size={20} />
          <span style={{ fontWeight: '600', fontSize: '16px' }}>Inventory Assistant</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.8,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={e => e.target.style.opacity = '1'}
          onMouseLeave={e => e.target.style.opacity = '0.8'}
        >
          <MdMinimize size={20} />
        </button>
      </div>
      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backgroundColor: '#f8fafc'
        }}
      >
        {messages.map(message => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
              gap: '8px',
              alignItems: 'flex-start'
            }}
          >
            <div
              style={{
                backgroundColor: message.type === 'user' ? '#6366f1' : 'white',
                color: message.type === 'user' ? 'white' : '#374151',
                padding: '10px 14px',
                borderRadius: message.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                maxWidth: '80%',
                fontSize: '14px',
                lineHeight: '1.4',
                boxShadow: message.type === 'ai' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                whiteSpace: 'pre-wrap'
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'white', padding: '10px 14px', borderRadius: '18px 18px 18px 4px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LoadingSpinner />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about inventory, stock, products..."
            disabled={isLoading}
            style={{
              flex: 1,
              border: '1px solid #d1d5db',
              borderRadius: '20px',
              padding: '10px 16px',
              fontSize: '14px',
              resize: 'none',
              minHeight: '20px',
              maxHeight: '80px',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#d1d5db'}
            rows="1"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            style={{
              backgroundColor: inputText.trim() && !isLoading ? '#6366f1' : '#e5e7eb',
              color: inputText.trim() && !isLoading ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              boxShadow: inputText.trim() && !isLoading ? '0 2px 4px rgba(99, 102, 241, 0.3)' : 'none'
            }}
            onMouseEnter={e => {
              if (inputText.trim() && !isLoading) {
                e.target.style.backgroundColor = '#5855eb';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.4)';
              }
            }}
            onMouseLeave={e => {
              if (inputText.trim() && !isLoading) {
                e.target.style.backgroundColor = '#6366f1';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 4px rgba(99, 102, 241, 0.3)';
              }
            }}
            title={inputText.trim() ? 'Send message' : 'Type a message to send'}
          >
            {isLoading ? (
              <div style={{ width: '16px', height: '16px', color: 'currentColor' }}>
                <LoadingSpinner />
              </div>
            ) : (
              <MdSend size={18} style={{ marginLeft: '2px' }} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
