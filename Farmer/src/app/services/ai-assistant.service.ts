const API_URL = 'http://localhost:5000/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  context?: {
    userType: string;
    cropsCount: number;
  };
  error?: string;
}

export const sendChatMessage = async (
  message: string,
  userId: string,
  userType: 'farmer' | 'buyer'
): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_URL}/ai-assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, userId, userType }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chat API error:', error);
    return {
      success: false,
      response: 'Failed to connect to AI assistant. Please check your connection.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const getQuickSuggestions = async (
  userId: string,
  userType: 'farmer' | 'buyer'
): Promise<string[]> => {
  try {
    const response = await fetch(
      `${API_URL}/ai-assistant/suggestions?userId=${userId}&userType=${userType}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.suggestions : [];
  } catch (error) {
    console.error('Suggestions API error:', error);
    return ['How can you help me?', 'Tell me about the platform'];
  }
};

export const clearConversationHistory = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/ai-assistant/clear-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Clear history API error:', error);
    return false;
  }
};
