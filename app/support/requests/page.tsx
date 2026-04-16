"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiClient } from "@/app/utils/api";
import { showSuccessNotification, showErrorNotification } from "@/utils/notifications";

interface SupportRequest {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SupportMessage {
  _id: string;
  message: string;
  senderType: 'customer' | 'admin';
  createdAt: string;
  attachments?: string[];
}

export default function SupportRequestsPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await apiClient<SupportRequest[]>("/support/my");
      setRequests(data);
    } catch (err) {
      console.error("Error loading support requests:", err);
      setError((err as Error).message || "Failed to load support requests");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (requestId: string) => {
    try {
      setLoadingMessages(true);
      const data = await apiClient<SupportMessage[]>(`/support/${requestId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error("Error loading messages:", err);
      showErrorNotification("Failed to Load Messages", (err as Error).message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleRequestClick = async (request: SupportRequest) => {
    setSelectedRequest(request);
    await loadMessages(request._id);
  };

  const handleSendMessage = async () => {
    if (!selectedRequest || !newMessage.trim()) return;

    try {
      setSendingMessage(true);
      await apiClient(`/support/${selectedRequest._id}/reply`, {
        method: "POST",
        body: { message: newMessage.trim() },
      });

      showSuccessNotification("Message Sent!", "Your reply has been sent successfully.");
      setNewMessage("");

      // Reload messages to show the new message
      await loadMessages(selectedRequest._id);
    } catch (err) {
      console.error("Error sending message:", err);
      showErrorNotification("Failed to Send Message", (err as Error).message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'in_progress':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'resolved':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'closed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <div className="px-8 py-3">
        <p className="text-sm text-gray-600">
          <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
          {" / "}
          <Link href="/support" className="text-gray-600 hover:text-gray-900">Support</Link>
          {" / "}
          <span className="text-gray-900 font-medium">My Requests</span>
        </p>
      </div>

      <div className="flex-grow px-4 py-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
                <p className="text-gray-600 mt-1">Manage your support requests and communicate with our team</p>
              </div>
              <div className="ml-auto">
                <Link
                  href="/support"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 transition-all"
                  aria-label="Create new support request"
                >
                  + New Support Request
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                    <p className="text-sm text-gray-600">Total Requests</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {requests.filter(r => r.status.toLowerCase() === 'in_progress').length}
                    </p>
                    <p className="text-sm text-gray-600">In Progress</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {requests.filter(r => r.status.toLowerCase() === 'resolved').length}
                    </p>
                    <p className="text-sm text-gray-600">Resolved</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {requests.filter(r => r.status.toLowerCase() === 'open').length}
                    </p>
                    <p className="text-sm text-gray-600">Open</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Requests List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Your Requests
                  </h2>
                </div>

                {requests.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 mb-6">You haven't submitted any support requests yet.</p>
                    <Link
                      href="/support"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
                    >
                      Submit a Request
                    </Link>
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto">
                    {requests.map((request) => (
                      <div
                        key={request._id}
                        onClick={() => handleRequestClick(request)}
                        className={`p-4 border-b border-gray-50 cursor-pointer transition-all ${
                          selectedRequest?._id === request._id
                            ? 'bg-teal-50 border-l-4 border-l-teal-500'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm truncate pr-2">
                            {request.title}
                          </h3>
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {request.description}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Messages Panel */}
            <div className="lg:col-span-2">
              {selectedRequest ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedRequest.title}</h2>
                    <p className="text-gray-600 text-sm mb-4">{selectedRequest.description}</p>
                    <div className="flex gap-4 text-xs">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.replace('_', ' ')}
                      </span>
                      <span className="text-gray-500">Created: {formatDate(selectedRequest.createdAt)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-black font-semibold mb-4" >Conversation</h3>
                    {loadingMessages ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto px-2">
                        {messages.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No messages yet. We'll respond soon.</p>
                        ) : (
                          messages.map((message) => (
                            <div key={message._id} className={`flex ${message.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                                message.senderType === 'customer' ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                              }`}>
                                <p className="text-sm">{message.message}</p>
                                <p className={`text-[10px] mt-1 ${message.senderType === 'customer' ? 'text-teal-100' : 'text-gray-400'}`}>
                                  {formatDate(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Reply Form */}
                    {selectedRequest.status.toLowerCase() !== 'closed' && (
                    <div className="border-t pt-4">
                        
                        <div className="flex items-center gap-3"> 
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your reply..."
                            rows={2} 
                            className="text-gray-600 flex-1 p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none min-h-[44px]"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={sendingMessage || !newMessage.trim()}
                            className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-all font-medium h-fit whitespace-nowrap shadow-sm active:scale-95"
                        >
                            {sendingMessage ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                            'Send'
                            )}
                        </button>
                        </div>
                    </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center h-[500px]">
                  <div className="text-center text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="font-medium">Select a request to view conversation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}