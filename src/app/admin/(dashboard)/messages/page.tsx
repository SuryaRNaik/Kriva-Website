"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Search, Trash2, CheckCircle, Mail, Clock } from "lucide-react";
import toast from "react-hot-toast";

type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'read'
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (e) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setMessages(messages.map(m => m._id === id ? { ...m, status } : m));
        if (selectedMessage?._id === id) setSelectedMessage({ ...selectedMessage, status });
        toast.success(`Marked as ${status}`);
        
        // Dispatch an event so layout can update the badge
        window.dispatchEvent(new Event('messages-updated'));
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages(messages.filter(m => m._id !== id));
        if (selectedMessage?._id === id) setSelectedMessage(null);
        toast.success("Message deleted");
        window.dispatchEvent(new Event('messages-updated'));
      }
    } catch (e) {
      toast.error("Error deleting message");
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2B2B2B]">Contact Messages</h2>
          <p className="text-[#8A8070] text-sm mt-1">Manage customer inquiries and support requests.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8070]" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#E8DCC8] rounded-lg text-sm focus:border-[#C9A227] outline-none w-72 bg-white"
            />
          </div>
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2 border border-[#E8DCC8] rounded-lg text-sm focus:border-[#C9A227] outline-none bg-white"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Messages List */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-2xl border border-[#E8DCC8] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E8DCC8] bg-[#FAF8F2] flex justify-between items-center">
            <h3 className="font-bold text-[#2B2B2B]">Inbox</h3>
            <span className="text-xs font-bold bg-[#E8DCC8] text-[#5A5548] px-2 py-0.5 rounded-full">{filteredMessages.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-[#8A8070]">Loading...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-12 flex flex-col items-center text-center">
                <MessageSquare size={32} className="text-[#E8DCC8] mb-3" />
                <p className="text-[#5A5548] font-medium text-sm">No messages found.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E8DCC8]">
                {filteredMessages.map(msg => (
                  <div 
                    key={msg._id} 
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (msg.status === 'unread') markStatus(msg._id, 'read');
                    }}
                    className={`p-4 cursor-pointer transition-colors border-l-4 ${selectedMessage?._id === msg._id ? 'bg-[#FAF8F2] border-[#C9A227]' : msg.status === 'unread' ? 'bg-white border-blue-500 hover:bg-gray-50' : 'bg-white border-transparent hover:bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm truncate pr-2 ${msg.status === 'unread' ? 'font-bold text-[#2B2B2B]' : 'font-medium text-[#5A5548]'}`}>{msg.name}</h4>
                      <span className="text-[10px] text-[#8A8070] whitespace-nowrap">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className={`text-xs mb-1 truncate ${msg.status === 'unread' ? 'font-bold text-[#2B2B2B]' : 'text-[#5A5548]'}`}>{msg.subject}</p>
                    <p className="text-xs text-[#8A8070] line-clamp-1">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Details */}
        <div className="w-full lg:w-2/3 flex flex-col bg-white rounded-2xl border border-[#E8DCC8] shadow-sm overflow-hidden">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-[#E8DCC8] flex justify-between items-start bg-[#FAF8F2]">
                <div>
                  <h3 className="text-xl font-bold text-[#2B2B2B] mb-2">{selectedMessage.subject}</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E8DCC8] flex items-center justify-center font-bold text-[#C9A227]">
                      {selectedMessage.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#2B2B2B] text-sm">{selectedMessage.name}</p>
                      <p className="text-xs text-[#8A8070]">{selectedMessage.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="p-2 text-[#5A5548] hover:bg-white rounded-lg border border-transparent hover:border-[#E8DCC8] transition-all"
                    title="Reply via Email"
                  >
                    <Mail size={18} />
                  </a>
                  <button 
                    onClick={() => markStatus(selectedMessage._id, selectedMessage.status === 'unread' ? 'read' : 'unread')}
                    className="p-2 text-[#5A5548] hover:bg-white rounded-lg border border-transparent hover:border-[#E8DCC8] transition-all"
                    title={selectedMessage.status === 'unread' ? "Mark as Read" : "Mark as Unread"}
                  >
                    <CheckCircle size={18} className={selectedMessage.status === 'read' ? 'text-green-500' : ''} />
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedMessage._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-8 overflow-y-auto bg-white">
                <div className="flex items-center gap-2 text-xs text-[#8A8070] mb-6">
                  <Clock size={14} />
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </div>
                <div className="text-sm text-[#2B2B2B] whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#8A8070] p-12 text-center bg-[#FAF8F2]/30">
              <MessageSquare size={48} className="text-[#E8DCC8] mb-4" />
              <h3 className="text-lg font-bold text-[#2B2B2B]">Select a message</h3>
              <p className="text-sm mt-1">Choose a message from the inbox to read its contents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
