import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { MessageCircle, MessageCircleCodeIcon, Sparkles } from "lucide-react";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Chat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/ai/chat",
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        const botMessage = { from: "bot", text: data.reply };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage = { from: "bot", text: "Error: " + data.message };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage = {
        from: "bot",
        text: "Network error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-6 flex flex-col lg:flex-row items-start gap-4 text-slate-700 max-w-6xl mx-auto">
      <form
        onSubmit={sendMessage}
        className="w-full lg:w-1/2 p-4 bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-6 text-[#6f27c8]" />
          <h2 className="text-lg font-semibold text-slate-700">Your Message</h2>
        </div>

        <textarea
          rows={6}
          className="w-full p-3 border border-gray-300 rounded-md resize-none mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8139ce]"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          required
        />

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#8139ce] to-[#220239] text-white px-4 py-2 mt-2 text-sm rounded-lg disabled:opacity-50"
          disabled={loading}
        >
          <MessageCircle className="w-5" />
          {loading ? "Sending..." : "Send"}
        </button>
      </form>

      <div className="w-full lg:w-1/2 p-4 bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm min-h-[400px] max-h-[600px]">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            Chat with AI{" "}
            <MessageCircleCodeIcon className="w-5 h-5 text-blue-600" />
          </h1>
        </div>

        <div
          className="flex-1 overflow-y-auto border border-gray-300 rounded-md p-4 flex flex-col gap-2"
          style={{ minHeight: "300px" }}
        >
          {messages.length === 0 && (
            <p className="text-gray-400 text-center mt-20">
              Say hi to the AI by typing on the left!
            </p>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-md max-w-[75%] text-sm ${
                msg.from === "user"
                  ? "bg-blue-50 self-end text-right"
                  : "bg-gray-100 self-start text-left"
              }`}
            >
              <Markdown>{msg.text}</Markdown>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;
