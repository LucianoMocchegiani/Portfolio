'use client';

import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { ChatWidgets, RichText } from '@/components/ChatPaint';
import { filterWidgetsOnProjectPage, textWithoutPaintedProjects, attachIntentWidgets } from '@/lib/chat-paint';
import { stripFichaWirePrefix, stripLeakedToolTalk } from '@/lib/chat-sanitize';
import type { usePublicChat } from '@/lib/use-public-chat';
import styles from '@/components/ask.module.css';

const FIELD_MAX_PX = 160;

type Chat = ReturnType<typeof usePublicChat>;

export function AskPanel({
  chat,
  title,
  placeholder,
  suggestions,
  prefixWire,
  pageProjectSlug,
  variant = 'page',
  className,
}: {
  chat: Chat;
  title: string;
  placeholder: string;
  suggestions: string[];
  prefixWire?: string;
  pageProjectSlug?: string;
  variant?: 'page' | 'side' | 'drawer' | 'home';
  className?: string;
}) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const canSend = chat.ready && !chat.streaming && chat.text.trim().length > 0;

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) {
      return;
    }
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, FIELD_MAX_PX)}px`;
  }, [chat.text]);

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
      className={`${styles.ask} ${variant === 'side' ? styles.side : ''} ${variant === 'drawer' ? styles.drawer : ''} ${variant === 'home' ? styles.home : ''} ${className ?? ''}`}
      aria-label={title || 'Preguntame'}
    >
      {title ? <p className={styles.kicker}>{title}</p> : null}
      <div className={styles.threadShell}>
        <div className={styles.fadeTop} aria-hidden="true" />
      <div
        className={`${styles.thread} ${
          chat.bubbles.length === 1 && chat.bubbles[0]?.key === 'opening'
            ? styles.threadOpening
            : ''
        }`}
        ref={chat.threadRef}
      >
        {chat.bubbles.length === 0 ? (
          <p className={styles.hint}>Preguntame sobre el trabajo.</p>
        ) : (
          chat.bubbles.map((bubble, index) =>
            bubble.role === 'user' ? (
              <div key={bubble.key} className={`${styles.bubble} ${styles.user}`}>
                {stripFichaWirePrefix(bubble.content)}
              </div>
            ) : (
              <div key={bubble.key} className={styles.assistantTurn}>
                {(() => {
                  const prev = chat.bubbles[index - 1];
                  const userText = prev?.role === 'user' ? prev.content : '';
                  const liveLast =
                    chat.streaming && index === chat.bubbles.length - 1;
                  const widgets = attachIntentWidgets(
                    liveLast ? '' : userText,
                    filterWidgetsOnProjectPage(
                      bubble.widgets ?? [],
                      pageProjectSlug,
                      userText,
                    ),
                  );
                  const shown = textWithoutPaintedProjects(
                    stripLeakedToolTalk(bubble.content),
                    widgets,
                  );
                  const pending =
                    chat.streaming &&
                    index === chat.bubbles.length - 1 &&
                    !shown;
                  return (
                    <>
                      {shown || pending ? (
                        <div className={`${styles.bubble} ${styles.assistant}`}>
                          {shown ? (
                            <RichText text={shown} />
                          ) : (
                            <span className={styles.pending}>…</span>
                          )}
                        </div>
                      ) : null}
                      {widgets.length > 0 ? (
                        <ChatWidgets
                          widgets={widgets}
                          progressive={bubble.key.startsWith('asst-')}
                        />
                      ) : null}
                    </>
                  );
                })()}
              </div>
            ),
          )
        )}
        {chat.error ? <p className={styles.error}>{chat.error}</p> : null}
        </div>
        <div className={styles.fadeBottom} aria-hidden="true" />
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
        <button
          type="button"
          className={styles.newChat}
          disabled={!chat.ready}
          onClick={() => void chat.startNew()}
        >
          Nuevo chat
        </button>
      </div>
      <form className={styles.composer} onSubmit={onSubmit}>
        <textarea
          ref={fieldRef}
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
