import React, { useState } from 'react';
import { createContext } from 'react';
import { sendMessageBot } from '../services/api';

const BotContext = createContext();

const BotProvider = ({ children }) => {
    const [isSending, setIsSending] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);

    const handleSendBot = () => {
        if (input.trim()) {
            const userMsg = {
                id: messages.length + 1,
                text: input,
                sender: "user",
            };
            setMessages([...messages, userMsg]);
            setInput("");
            setIsSending(true);
        }
        sendMessageBot(input)
            .then((serverResponse) => {
                const serverMsg = {
                    id: messages.length + 2,
                    text: serverResponse,
                    sender: "server",
                };
                setMessages(prevMessages => [...prevMessages, serverMsg]);
            }).catch((error) => {
                console.error('Error:', error);
                const serverMsg = {
                    id: messages.length + 2,
                    text: 'Error: No se pudo obtener respuesta del servidor',
                    sender: "server",
                };
                setMessages(prevMessages => [...prevMessages, serverMsg]);
            }).finally(() => {
                setIsSending(false);
            });
    };

    const data = { messages, isSending, handleSendBot, setInput, input };

    return (
        <BotContext.Provider value={data}>
            {children}
        </BotContext.Provider>
    );
};

export { BotProvider };
export default BotContext;
