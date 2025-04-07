"use client";
import { useState, useEffect } from "react";
import { useAppContext } from "../../StateContext";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  recipient_id?: string;
  parent_id?: string;
  subject: string;
  content: string;
  created_at: string;
  is_read: boolean;
  replies?: Message[];
}

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export default function Messages() {
  const { userRole, userId } = useAppContext();
  const router = useRouter();
  const isSpeaker = userRole === "speaker";
  const isOrganizer = userRole === "organizer";

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [newMessageSubject, setNewMessageSubject] = useState("");
  const [newMessageContent, setNewMessageContent] = useState("");
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState("");

  // Fetch messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // First fetch users based on role
        let targetRole = isSpeaker ? "organizer" : "speaker";
        const usersResponse = await fetch(
          `http://localhost:8000/users/by-role/${targetRole}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }

        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);

        // Then fetch messages
        const messagesResponse = await fetch(
          `http://localhost:8000/messages/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!messagesResponse.ok) {
          throw new Error("Failed to fetch messages");
        }

        const messagesData = await messagesResponse.json();
        setMessages(messagesData.messages || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load messages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    } else {
      setLoading(false);
      setError("You must be logged in to view messages");
    }
  }, [userId, isSpeaker]);

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessageSubject.trim() || !newMessageContent.trim()) {
      setError("Please enter both subject and message content");
      return;
    }

    if (!selectedRecipient && isSpeaker) {
      setError("Please select a recipient");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const messageData = {
        sender_id: userId,
        recipient_id: selectedRecipient,
        subject: newMessageSubject,
        content: newMessageContent,
      };

      const response = await fetch("http://localhost:8000/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Add the new message to the list
      const newMessage: Message = {
        id: data.message_id,
        sender_id: userId,
        sender_name: localStorage.getItem("email") || userId,
        sender_role: userRole,
        recipient_id: selectedRecipient,
        subject: newMessageSubject,
        content: newMessageContent,
        created_at: new Date().toISOString(),
        is_read: true,
      };

      setMessages([newMessage, ...messages]);
      setNewMessageSubject("");
      setNewMessageContent("");
      setSelectedRecipient("");
      setShowNewMessageForm(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  // Send a reply to a message
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMessage || !replyContent.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const replyData = {
        sender_id: userId,
        recipient_id: selectedMessage.sender_id,
        parent_id: selectedMessage.id,
        subject: `Re: ${selectedMessage.subject}`,
        content: replyContent,
      };

      const response = await fetch("http://localhost:8000/messages/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(replyData),
      });

      if (!response.ok) {
        throw new Error("Failed to send reply");
      }

      const data = await response.json();

      // Add the reply to the messages list
      const newReply: Message = {
        id: data.message_id,
        sender_id: userId,
        sender_name: localStorage.getItem("email") || userId,
        sender_role: userRole,
        recipient_id: selectedMessage.sender_id,
        parent_id: selectedMessage.id,
        subject: `Re: ${selectedMessage.subject}`,
        content: replyContent,
        created_at: new Date().toISOString(),
        is_read: true,
      };

      setMessages([newReply, ...messages]);
      setReplyContent("");

      // Fetch replies after sending a new one
      fetchReplies(selectedMessage.id);
    } catch (err) {
      console.error("Error sending reply:", err);
      setError("Failed to send reply. Please try again.");
    }
  };

  // Fetch replies for a message
  const fetchReplies = async (messageId: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8000/messages/replies/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch replies");
      }

      const data = await response.json();

      // Update the selected message to include replies
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({
          ...selectedMessage,
          replies: data.replies || [],
        });
      }
    } catch (err) {
      console.error("Error fetching replies:", err);
    }
  };

  // Mark a message as read
  const markAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:8000/messages/read/${messageId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the messages list
      setMessages(
        messages.map((msg) =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  // View a message and its replies
  const viewMessage = async (message: Message) => {
    setSelectedMessage(message);
    setReplyContent("");

    // Mark as read if necessary
    if (!message.is_read) {
      markAsRead(message.id);
    }

    // Fetch replies
    fetchReplies(message.id);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="p-6 text-center">Loading messages...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between mb-4">
        <h2 className="text-xl">
          {isSpeaker ? "Questions to Organizers" : "Messages from Speakers"}
        </h2>
        <button
          onClick={() => setShowNewMessageForm(!showNewMessageForm)}
          className="bg-orange-400 text-white py-2 px-4 rounded-3xl hover:bg-orange-500"
        >
          {showNewMessageForm ? "Cancel" : "New Message"}
        </button>
      </div>

      {/* New Message Form */}
      {showNewMessageForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-3">New Message</h3>
          <form onSubmit={handleSendMessage}>
            {isSpeaker && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Recipient
                </label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                >
                  <option value="">Select an Organizer</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                value={newMessageSubject}
                onChange={(e) => setNewMessageSubject(e.target.value)}
                className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                rows={5}
                className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-orange-400 text-white py-2 px-4 rounded-3xl hover:bg-orange-500"
            >
              Send Message
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="md:col-span-1 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 bg-orange-50 border-b border-orange-200">
            <h3 className="font-medium">
              {messages.length > 0 ? "Your Messages" : "No messages yet"}
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {messages.map((message) => (
              <li
                key={message.id}
                className={`p-4 cursor-pointer transition hover:bg-orange-50 ${
                  selectedMessage?.id === message.id ? "bg-orange-100" : ""
                } ${!message.is_read ? "font-semibold bg-yellow-50" : ""}`}
                onClick={() => viewMessage(message)}
              >
                <div className="flex justify-between">
                  <span className="text-orange-600">{message.subject}</span>
                  {!message.is_read && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {message.content}
                </p>
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>From: {message.sender_name}</span>
                  <span>{formatDate(message.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Message View */}
        <div className="md:col-span-2">
          {selectedMessage ? (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-4 bg-orange-50 border-b border-orange-200">
                <h3 className="font-medium text-lg">
                  {selectedMessage.subject}
                </h3>
                <div className="text-sm text-gray-600">
                  <span>
                    From: {selectedMessage.sender_name} (
                    {selectedMessage.sender_role})
                  </span>
                  <span className="ml-4">
                    {formatDate(selectedMessage.created_at)}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>

              {/* Replies Section */}
              {selectedMessage.replies &&
                selectedMessage.replies.length > 0 && (
                  <div className="border-t border-gray-200 p-4">
                    <h4 className="font-medium mb-2">Replies</h4>
                    <ul className="space-y-4">
                      {selectedMessage.replies.map((reply) => (
                        <li key={reply.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">
                              {reply.sender_name} ({reply.sender_role})
                            </span>
                            <span className="text-gray-500">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Reply Form */}
              <div className="border-t border-gray-200 p-4">
                <h4 className="font-medium mb-2">Reply</h4>
                <form onSubmit={handleReply}>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                    className="block w-full border border-orange-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Type your reply here..."
                    required
                  ></textarea>
                  <button
                    type="submit"
                    className="mt-2 bg-orange-400 text-white py-2 px-4 rounded-3xl hover:bg-orange-500"
                  >
                    Send Reply
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
              Select a message to view its contents or create a new message to
              start a conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
