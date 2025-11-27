import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { MessageCircle, MessageCircleCodeIcon, MessageSquare, Pen, Sparkle, Sparkles } from "lucide-react";
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
 <div className="h-full overflow-y-scroll p-6 flex flex-col lg:flex-row items-start gap-4 text-slate-700 max-w-5xl mx-auto bg-white rounded-lg shadow-md">

  {/* Left panel: Input form */}
  <form
    onSubmit={sendMessage}
    className="w-full lg:w-1/2 p-4 bg-white rounded-lg border border-gray-200 flex flex-col"  >
    <div className="flex justify-start mb-2">
      <label
        htmlFor="chatInput"
        className="font-medium text-gray-700">
        <Sparkles className='w-6 text-[#6f27c8]'/>
        Your Message
      </label>
    </div>
    <textarea
      id="chatInput"
      rows={6}
      className="w-full p-2 border border-gray-300 rounded-md resize-none mb-4"
      placeholder="Type your message..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      disabled={loading}
      required
    />
    <button
      type="submit"
     className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#8139ce] to-[#220239] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'
      disabled={loading}>
        <MessageCircle className='w-5'/>
      {loading ? "Sending..." : "Send"}
    </button>
  </form>

  {/* Right panel: Messages */}
  <div className="w-full lg:w-1/2 p-4 bg-white rounded-lg border border-gray-200 min-h-[400px] max-h-[600px] flex flex-col">
    <div className="flex justify-start mb-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        Chat with AI 
        <MessageCircleCodeIcon className="w-6 h-6 text-blue-600" />
      </h1>
    </div>

    <div
      className="flex-1 overflow-y-auto border border-gray-300 rounded-md p-4"
      style={{ minHeight: "300px" }}>
      {messages.length === 0 && (
        <p className="text-gray-500 text-center mt-20">
          Say hi to the AI by typing on the left!
        </p>
      )}
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`mb-3 max-w-[75%] p-3 rounded-lg ${
            msg.from === "user"
              ? "bg-blue-100 self-end text-right"
              : "bg-gray-200 self-start text-left"
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
