import { useState, useCallback, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  CheckCheck,
  X,
  Loader2,
  Search,
  ArrowLeft,
  Circle,
} from "lucide-react";
import { useSearchParams, useParams } from "react-router";
import { getValidatedUserId } from "../utils/validation";

interface Message {
  _id: string;
  senderId: { _id: string; name: string } | string;
  receiverId: { _id: string; name: string } | string;
  message: string;
  messageType: "text" | "image" | "file";
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  lastMessage: string;
  lastMessageTime: string;
  otherUserId: string;
  otherUser: { _id: string; name: string; email: string; phone?: string };
  unreadCount: number;
}

export function Messages() {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const farmerIdFromUrl = searchParams.get("farmerId");
  const farmerNameFromUrl = searchParams.get("farmerName");
  const { userId: currentUserId } = getValidatedUserId(userId);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<string | null>(null);
  const [selectedOtherName, setSelectedOtherName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/user/${currentUserId}/conversations`
      );
      if (!res.ok) throw new Error("Failed");
      const result = await res.json();
      if (result.success) setConversations(result.data || []);
    } catch (e) {
      console.error("Error fetching conversations:", e);
    } finally {
      setLoadingConversations(false);
    }
  }, [currentUserId]);

  const fetchMessages = useCallback(async () => {
    if (!selectedOtherUserId || !currentUserId) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/user/${currentUserId}/conversation/${selectedOtherUserId}`
      );
      if (!res.ok) throw new Error("Failed");
      const result = await res.json();
      if (result.success) setMessages(result.data || []);
    } catch (e) {
      console.error("Error fetching messages:", e);
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedOtherUserId, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      setLoadingConversations(true);
      fetchConversations();
    }
  }, [fetchConversations, currentUserId]);

  useEffect(() => {
    if (!farmerIdFromUrl || !currentUserId) return;
    const existing = conversations.find(
      (c) => c.otherUserId === farmerIdFromUrl
    );
    if (existing) {
      setSelectedConversation(existing._id);
      setSelectedOtherUserId(existing.otherUserId);
      setSelectedOtherName(
        existing.otherUser?.name || farmerNameFromUrl || "Farmer"
      );
    } else {
      setSelectedConversation("new_conversation");
      setSelectedOtherUserId(farmerIdFromUrl);
      setSelectedOtherName(
        farmerNameFromUrl ? decodeURIComponent(farmerNameFromUrl) : "Farmer"
      );
    }
  }, [farmerIdFromUrl, farmerNameFromUrl, currentUserId, conversations]);

  useEffect(() => {
    if (!selectedOtherUserId) return;
    setLoadingMessages(true);
    fetchMessages();
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
      fetchConversations();
    }, 3000);
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [selectedOtherUserId, fetchMessages, fetchConversations]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv._id);
    setSelectedOtherUserId(conv.otherUserId);
    setSelectedOtherName(conv.otherUser?.name || "Unknown User");
    setNewMessage("");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newMessage.trim() ||
      !selectedOtherUserId ||
      isSending ||
      !currentUserId
    )
      return;
    try {
      setIsSending(true);
      const res = await fetch(
        `http://localhost:5000/api/messages/user/${currentUserId}/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiverId: selectedOtherUserId,
            message: newMessage,
            messageType: "text",
          }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      const result = await res.json();
      if (result.success) {
        setMessages((prev) => [...prev, result.data]);
        setNewMessage("");
        fetchConversations();
      }
    } catch (e) {
      console.error("Error sending:", e);
      alert("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseConversation = () => {
    setSelectedConversation(null);
    setSelectedOtherUserId(null);
    setSelectedOtherName("");
    setMessages([]);
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOtherUserName = (): string => {
    if (selectedOtherName) return selectedOtherName;
    return (
      conversations.find((c) => c._id === selectedConversation)?.otherUser
        ?.name || "Unknown"
    );
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (mins < 1) return "Now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatMessageDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / 86400000
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce<
    { date: string; messages: Message[] }[]
  >((groups, msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.date === dateKey) {
      last.messages.push(msg);
    } else {
      groups.push({ date: dateKey, messages: [msg] });
    }
    return groups;
  }, []);

  if (!currentUserId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-gray-800 font-semibold text-lg">
            Invalid User ID
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Please access this page with a valid URL
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* ── Page Header ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
            <MessageSquare className="w-[18px] h-[18px] text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              Messages
            </h1>
            <p className="text-[11px] text-gray-400 leading-tight">
              Chat with farmers about crops
            </p>
          </div>
          {conversations.length > 0 && (
            <span className="ml-auto text-xs font-medium text-gray-400 tabular-nums hidden sm:block">
              {conversations.length} conversation
              {conversations.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </header>

      {/* ── Main Chat Layout ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ─── Conversations Sidebar ─── */}
        <aside
          className={`
            ${selectedConversation ? "hidden lg:flex" : "flex"}
            flex-col w-full lg:w-[320px] xl:w-[360px] flex-shrink-0
            bg-white border-r border-gray-200
          `}
        >
          {/* Search */}
          <div className="px-3 py-2.5 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400
                  transition-all"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {loadingConversations ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-green-500 mb-2" />
                <p className="text-xs text-gray-400">Loading...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                  <MessageSquare className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-600 font-semibold text-sm">
                  No conversations
                </p>
                <p className="text-gray-400 text-xs mt-1 text-center">
                  Visit a farmer's page to start chatting
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = selectedConversation === conv._id;
                const initial = (conv.otherUser?.name || "U")
                  .charAt(0)
                  .toUpperCase();
                return (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full px-3 py-3 flex items-center gap-3 transition-all duration-100
                      hover:bg-gray-50 border-b border-gray-50
                      ${
                        isActive
                          ? "bg-green-50/60 border-l-[3px] border-l-green-500"
                          : "border-l-[3px] border-l-transparent"
                      }
                    `}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm
                        ${
                          isActive
                            ? "bg-gradient-to-br from-green-500 to-green-700 shadow-md shadow-green-200"
                            : "bg-gradient-to-br from-green-400 to-teal-500"
                        }`}
                      >
                        {initial}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`font-semibold text-[13px] truncate ${
                            isActive ? "text-green-800" : "text-gray-900"
                          }`}
                        >
                          {conv.otherUser?.name || "Unknown"}
                        </span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2 tabular-nums">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] text-gray-500 truncate pr-2">
                          {conv.lastMessage || "No messages yet"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {conv.unreadCount > 99
                              ? "99+"
                              : conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ─── Chat Area ─── */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-4 lg:px-5 py-2.5 flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleCloseConversation}
                className="lg:hidden p-1.5 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleCloseConversation}
                className="hidden lg:flex p-1 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {getOtherUserName().charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-[1.5px] border-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate leading-tight">
                  {getOtherUserName()}
                </h3>
                <p className="text-[10px] text-green-600 font-medium flex items-center gap-1 leading-tight">
                  <Circle className="w-1.5 h-1.5 fill-green-500 text-green-500" />
                  Online
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 lg:px-5 py-3 bg-[#f0f2f5]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.02'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2l3 3-3 3zm-2-8V10H0V8h18V6l3 3-3 3z'/%3E%3C/g%3E%3C/svg%3E\")",
              }}
            >
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="w-7 h-7 animate-spin text-green-400 mb-2" />
                  <p className="text-xs text-gray-400">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-gray-100">
                    <Send className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-gray-600 font-semibold text-sm">
                    Start a conversation
                  </p>
                  <p className="text-gray-400 text-xs mt-1 text-center max-w-[200px]">
                    Send your first message to {getOtherUserName()}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {groupedMessages.map((group) => (
                    <div key={group.date}>
                      {/* Date Separator */}
                      <div className="flex items-center justify-center my-3">
                        <span className="px-3 py-0.5 bg-white/90 backdrop-blur-sm text-[10px] font-medium text-gray-500 rounded-full shadow-sm">
                          {formatMessageDate(group.messages[0].createdAt)}
                        </span>
                      </div>

                      {/* Messages */}
                      <div className="space-y-1">
                        {group.messages.map((msg) => {
                          const isSender =
                            typeof msg.senderId === "object"
                              ? msg.senderId._id === currentUserId
                              : msg.senderId === currentUserId;

                          return (
                            <div
                              key={msg._id}
                              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[75%] lg:max-w-[65%] px-3 py-2 rounded-2xl
                                  ${
                                    isSender
                                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-sm shadow-sm shadow-green-200/50"
                                      : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                                  }`}
                              >
                                <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                                  {msg.message}
                                </p>
                                <div className="flex items-center gap-1 justify-end mt-0.5">
                                  <span
                                    className={`text-[10px] leading-none ${
                                      isSender
                                        ? "text-green-100"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {new Date(
                                      msg.createdAt
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {isSender && (
                                    <CheckCheck
                                      className={`w-3.5 h-3.5 ${
                                        msg.isRead
                                          ? "text-blue-200"
                                          : "text-green-200"
                                      }`}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 px-4 lg:px-5 py-2.5 flex-shrink-0">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isSending}
                  autoFocus
                  className="flex-1 min-w-0 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm
                    placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400
                    disabled:opacity-50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full
                    flex items-center justify-center hover:from-green-600 hover:to-green-700 active:scale-95
                    disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
                    transition-all duration-150 shadow-sm"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#f0f2f5] min-w-0">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 rotate-2">
                <MessageSquare className="w-10 h-10 text-green-300 -rotate-2" />
              </div>
              <p className="text-lg font-semibold text-gray-700">
                Select a conversation
              </p>
              <p className="text-sm text-gray-400 mt-1.5 max-w-[240px] mx-auto leading-relaxed">
                Choose a farmer from the list to view your messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
