"use client";
import { useState } from "react";
import styles from "./page.module.css";
import { useSocket } from "../context/SocketProvider";

export default function Home() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");

  const handleSendMsg = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();

    if (
      (e.type === "keydown" && (e as React.KeyboardEvent).key === "Enter") ||
      (e as React.KeyboardEvent).key === " "
    ) {
      sendMessage(message);
      clearMessage();
    } else if (e.type === "click") {
      sendMessage(message);
      clearMessage();
    }
  };

  const clearMessage = () => {
    if (message.trim()) {
      console.log("Message Sent: ", message);
      setMessage("");
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.chatHeader}>
          <h1>Socket</h1>
        </div>

        <div className={styles.chatContainer}>
          {messages.map((msg, index) => (
            <div key={index} className={styles.msgReceived}>
              {msg}
            </div>
            // <div className={styles.msgSend}>send</div>
          ))}
        </div>

        <div className={styles.chat_input_button_wrpr}>
          <input
            type="text"
            value={message}
            placeholder="type here..."
            onChange={(e: any) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMsg(e);
            }}
          />
          <button onClick={handleSendMsg}>
            <img src="send.svg" alt="incon" />
          </button>
        </div>
      </main>
    </div>
  );
}
