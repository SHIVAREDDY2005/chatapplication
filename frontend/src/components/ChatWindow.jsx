import { useEffect, useRef } from 'react';

export default function ChatWindow({ messages, currentUser, typingText }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText]);

  return (
    <div className="chat-window">
      {messages.map((msg) => {
        const mine = msg.sender?._id === currentUser._id || msg.sender === currentUser._id;
        return (
          <div key={msg._id} className={`bubble ${mine ? 'mine' : ''}`}>
            {!mine && msg.sender?.name && <small>{msg.sender.name}</small>}
            <p>{msg.message}</p>
            <div className="meta">
              <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
              {mine && <span>{msg.seenBy?.length > 1 ? '✓✓' : '✓'}</span>}
            </div>
          </div>
        );
      })}
      {typingText && <p className="typing">{typingText}</p>}
      <div ref={endRef} />
    </div>
  );
}
