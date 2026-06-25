import { useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = { role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/ask", {
        question: question,
      });

      const { explanation, data, sql } = response.data;

      const botMessage = {
        role: "bot",
        text: explanation,
        data: data,
        sql: sql,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, something went wrong. Please try again." },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") askQuestion();
  };

  const renderChart = (data) => {
  if (!data || data.length <= 1) return null;

  const allKeys = Object.keys(data[0]);
  
  // Try to find the best X axis key (lat, lon, date, depth)
  const xAxisCandidates = ["lat", "lon", "date", "depth"];
  const xKey = allKeys.find((k) => xAxisCandidates.includes(k)) || allKeys[0];
  
  // All other keys are Y axis lines
  const yKeys = allKeys.filter((k) => k !== xKey);

  return (
    <div style={{ marginTop: "12px" }}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            label={{ value: xKey, position: "insideBottom", offset: -2 }}
            tick={{ fontSize: 10 }}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          {yKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={i === 0 ? "#2E86AB" : "#4C9A6F"}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e0f7fa, #e8f5e9)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "#1B3B5F", fontSize: "2rem", margin: 0 }}>
          🌊 AquaGen AI
        </h1>
        <p style={{ color: "#4C9A6F", margin: "6px 0 0" }}>
          Ask anything about ocean data in plain English
        </p>
      </div>

      {/* Chat Window */}
      <div style={{
        width: "100%",
        maxWidth: "800px",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        padding: "20px",
        minHeight: "400px",
        maxHeight: "600px",
        overflowY: "auto",
        marginBottom: "16px"
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#aaa", marginTop: "80px" }}>
            <p>Try asking:</p>
            <p><i>"What is the average temperature in the Indian Ocean?"</i></p>
            <p><i>"Show me salinity levels by latitude"</i></p>
            <p><i>"What was the highest temperature recorded?"</i></p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            marginBottom: "16px"
          }}>
            <div style={{
              maxWidth: "75%",
              background: msg.role === "user" ? "#2E86AB" : "#f0f7f4",
              color: msg.role === "user" ? "white" : "#1B3B5F",
              borderRadius: msg.role === "user"
                ? "16px 16px 4px 16px"
                : "16px 16px 16px 4px",
              padding: "12px 16px",
              fontSize: "0.95rem",
              lineHeight: "1.5"
            }}>
              {msg.text}
              {msg.data && msg.data.length > 1 && renderChart(msg.data)}
              {msg.sql && (
                <div style={{
                  marginTop: "8px",
                  fontSize: "0.75rem",
                  color: "#888",
                  fontFamily: "monospace"
                }}>
                  SQL: {msg.sql}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ color: "#4C9A6F", fontStyle: "italic" }}>
            AquaGen AI is thinking...
          </div>
        )}
      </div>

      {/* Input Box */}
      <div style={{
        width: "100%",
        maxWidth: "800px",
        display: "flex",
        gap: "10px"
      }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about ocean data..."
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: "12px",
            border: "2px solid #2E86AB",
            fontSize: "1rem",
            outline: "none"
          }}
        />
        <button
          onClick={askQuestion}
          disabled={loading}
          style={{
            padding: "14px 24px",
            background: "#2E86AB",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            cursor: "pointer"
          }}
        >
          Ask
        </button>
      </div>
    </div>
  );
}