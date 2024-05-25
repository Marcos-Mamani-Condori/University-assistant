import React, { useState, useRef, useEffect } from "react";
import Message from "./Message";
import chatbot_icon from '../assets/chatbot_icon.png';

function Chat({ isSecondaryInstance }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showTemporaryDiv, setShowTemporaryDiv] = useState(true); // Estado para el div temporal
  const [showPredefinedQuestions, setShowPredefinedQuestions] = useState(true); // Estado para las preguntas predefinidas
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to reset the state when isSecondaryInstance changes to true
  useEffect(() => {
    if (isSecondaryInstance) {
      setMessages([]);
      setShowTemporaryDiv(true);
      setShowPredefinedQuestions(true);
    }
  }, [isSecondaryInstance]);

  const handleSend = (message) => {
    if ((message || newMessage.trim()) && !isSending) {
      setIsSending(true);
      const userMsg = {
        id: messages.length + 1,
        text: message || newMessage,
        sender: "user",
      };
      setMessages([...messages, userMsg]);
      setNewMessage("");
      setShowTemporaryDiv(false); // Oculta el div temporal
      setShowPredefinedQuestions(false); // Oculta las preguntas predefinidas

      if (!isSecondaryInstance) {
        // Guardar el mensaje en SQLite
        fetch(`${window.origin}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: message || newMessage }),
        })
        .then(() => {
          const serverMsg = {
            id: messages.length + 2,
            text: 'Gracias por contribuir con el entrenamiento de Loyobot',
            sender: "server",
          };
          setMessages(prevMessages => [...prevMessages, serverMsg]);
        })
        .catch((error) => {
          console.error('Error:', error);
          const serverMsg = {
            id: messages.length + 2,
            text: 'Error: No se pudo guardar el mensaje',
            sender: "server",
          };
          setMessages(prevMessages => [...prevMessages, serverMsg]);
        })
        .finally(() => {
          setIsSending(false);
          inputRef.current?.focus();
        });
      } else {
        fetch(`${window.origin}/get`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: message || newMessage }),
        })
        .then(response => response.json())
        .then(data => {
          const serverMsg = {
            id: messages.length + 2,
            text: data.response,
            sender: "server",
          };
          setMessages(prevMessages => [...prevMessages, serverMsg]);
        })
        .catch((error) => {
          console.error('Error:', error);
          const serverMsg = {
            id: messages.length + 2,
            text: 'Error: No se pudo obtener respuesta del servidor',
            sender: "server",
          };
          setMessages(prevMessages => [...prevMessages, serverMsg]);
        })
        .finally(() => {
          setIsSending(false);
          inputRef.current?.focus();
        });
      }
    }
  };

  return (
    <div className="chat-container">
      {showTemporaryDiv && (
        <div className="temporary-div">
          <div className="escudo-container">
            <img src={chatbot_icon} alt="chatbot_icon" className="chatbot_icon" />
          </div>
          {isSecondaryInstance && <p>Este es un mensaje temporal</p>}
        </div>
      )}
      <div className="messages">
        {messages.map((msg) => (
          <Message key={msg.id} text={msg.text} sender={msg.sender} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      {isSecondaryInstance && showPredefinedQuestions && (
        <div className="predefined-questions">
          <button onClick={() => handleSend("¿Cuál es tu nombre?")}>¿Cuál es tu nombre?</button>
          <button onClick={() => handleSend("¿Cómo estás hoy?")}>¿A cuanto esta la mensualidad?</button>
        </div>
      )}
      <div className="divider">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
              e.preventDefault();
            }
          }}
          placeholder={isSending ? "Esperando respuesta..." : "Escribe un mensaje..."}
          disabled={isSending}
        />
        <button onClick={() => handleSend()} disabled={isSending}>Enviar</button>
      </div>
    </div>
  );
}

export default Chat;
