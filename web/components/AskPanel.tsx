'use client';

import type { FormEvent, KeyboardEvent } from 'react';
import { ChatWidgets, RichText } from '@/components/ChatPaint';
import type { usePublicChat } from '@/lib/use-public-chat';
import styles from '@/components/ask.module.css';

type Chat = ReturnType<typeof usePublicChat>;

export function AskPanel({
  chat,
  title,
  placeholder,
  suggestions,
  prefixWire,
  variant = 'page',
  className,
}: {
  chat: Chat;
  title: string;
  placeholder: string;
  suggestions: string[];
  prefixWire?: string;
  variant?: 'page' | 'side' | 'drawer';
  className?: string;
}) {
  const canSend = chat.ready && !chat.streaming && chat.text.trim().length > 0;

  function wireOf(question: string): string {
    if (!prefixWire) {
      return question;
    }
    return `${prefixWire}\n\n${question}`;
  }

  function onSubmit(event: FormEvent): void {
    event.preventDefault();
    if (chat.streaming) {
      chat.stop();
      return;
    }
    void chat.send(chat.text, wireOf(chat.text));
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void chat.send(chat.text, wireOf(chat.text));
    }
  }

  return (
    <section
      className={`${styles.ask} ${variant === 'side' ? styles.side : ''} ${variant === 'drawer' ? styles.drawer : ''} ${className ?? ''}`}
      aria-label={title || 'Preguntame'}
    >
      {title ? <p className={styles.kicker}>{title}</p> : null}
      <div className={styles.thread} ref={chat.threadRef}>
        {chat.bubbles.length === 0 ? (
          <p className={styles.hint}>Preguntame sobre el trabajo.</p>
        ) : (
          chat.bubbles.map((bubble) =>
            bubble.role === 'user' ? (
              <div key={bubble.key} className={`${styles.bubble} ${styles.user}`}>
                {bubble.content}
              </div>
            ) : (
              <div key={bubble.key} className={styles.assistantTurn}>
                {bubble.content || chat.streaming ? (
                  <div className={`${styles.bubble} ${styles.assistant}`}>
                    {bubble.content ? (
                      <RichText text={bubble.content} />
                    ) : (
                      <span className={styles.pending}>…</span>
                    )}
                  </div>
                ) : null}
                {bubble.widgets && bubble.widgets.length > 0 ? (
                  <ChatWidgets widgets={bubble.widgets} />
                ) : null}
              </div>
            ),
          )
        )}
        {chat.error ? <p className={styles.error}>{chat.error}</p> : null}
      </div>
      <div className={styles.chips}>
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            className={styles.chip}
            disabled={!chat.ready || chat.streaming}
            onClick={() => void chat.send(item, wireOf(item))}
          >
            {item}
          </button>
        ))}
      </div>
      <form className={styles.composer} onSubmit={onSubmit}>
        <textarea
          value={chat.text}
          onChange={(event) => chat.setText(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={8000}
          disabled={!chat.ready || chat.streaming}
          placeholder={chat.ready ? placeholder : 'Conectando…'}
          aria-label={placeholder}
        />
        <button
          type={chat.streaming ? 'button' : 'submit'}
          className={`${styles.send} ${canSend || chat.streaming ? styles.sendReady : ''}`}
          disabled={!chat.streaming && !canSend}
          onClick={chat.streaming ? () => chat.stop() : undefined}
          aria-label={chat.streaming ? 'Parar' : 'Enviar'}
        >
          {chat.streaming ? '■' : '→'}
        </button>
      </form>
    </section>
  );
}
