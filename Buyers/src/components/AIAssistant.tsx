import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { useParams } from 'react-router';
import { getValidatedUserId } from '../utils/validation';
import { 
  sendChatMessage, 
  getQuickSuggestions, 
  clearConversationHistory,
  type ChatMessage 
} from '../services/ai-assistant.service';

export function AIAssistant() {
  const { userId: urlUserId } = useParams<{ userId: string }>();
  
  const { userId } = getValidatedUserId(urlUserId);
  const userType = 'buyer';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    const sug = await getQuickSuggestions(userId, userType);
    setSuggestions(sug);
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(textToSend, userId, userType);

      // Check if response was successful
      if (response.success && response.response) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Handle error response from backend
        console.error('AI response error:', response.error);
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, I\'m having trouble connecting to the AI service right now. Please try again in a moment.',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear conversation history?')) {
      const success = await clearConversationHistory(userId);
      if (success) {
        setMessages([]);
        loadSuggestions();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg max-w-6xl mx-auto w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-green-500 to-green-600 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Assistant</h2>
              <p className="text-xs text-green-50">Powered by Gemini AI</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-2.5 text-white hover:bg-white/20 rounded-xl transition-all shadow-sm hover:shadow-md"
              title="Clear history"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50/50 to-white">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome! How can I help you today?</h3>
              <p className="text-sm text-gray-600 mb-6">Ask me to find farmers, analyze crop quality, or get market insights</p>
              
              {suggestions.length > 0 && (
                <div className="space-y-2 max-w-md mx-auto">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Quick suggestions:</p>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="block w-full text-left px-5 py-3 bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 border-2 border-gray-200 hover:border-green-300 rounded-xl text-sm text-gray-700 hover:text-green-700 transition-all shadow-sm hover:shadow-md font-medium"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-sm'
                        : 'bg-white border-2 border-gray-200 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-green-100' : 'text-gray-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl px-5 py-3 flex items-center gap-2 shadow-md">
                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                    <span className="text-sm text-gray-700 font-medium">Thinking...</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-5 border-t-2 border-gray-200 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all font-medium"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
