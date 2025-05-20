import React, { useEffect, useState, useRef } from "react";
import { db } from "./Firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const CHAT_ID = "default"; // Tek bir oda için sabit, istersen dinamik yapabilirsin

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sender] = useState("user");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, "chats", CHAT_ID, "messages"),
      orderBy("timestamp")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMessages(
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    await fetch(`${API_BASE_URL}/api/chat/${CHAT_ID}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, text: input }),
    });

    setInput("");
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", border: "1px solid #ccc", borderRadius: 8, padding: 16, background: "#fafbfc" }}>
      <h2>AI Chat</h2>
      <div style={{ minHeight: 300, maxHeight: 400, overflowY: "auto", marginBottom: 16, background: "#fff", padding: 8, borderRadius: 4 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "8px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 16,
                background: msg.sender === "user" ? "#d1e7dd" : "#e2e3e5",
                color: "#222",
                maxWidth: "80%",
                wordBreak: "break-word",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Mesajınızı yazın..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "8px 16px", borderRadius: 4, background: "#0d6efd", color: "#fff", border: "none" }}>
          Gönder
        </button>
      </form>
    </div>
  );
}

export default Chat; 