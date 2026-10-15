
import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  FileText,
  FileUp,
  UploadCloud,
  Bot,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  AlertTriangle,
  BookMarked,
  LoaderCircle,
  MessageCircle
} from 'lucide-react';

const API = 'http://localhost:8080/api';

export default function App() {
  const [docs, setDocs] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const [theme, setTheme] = useState(
  () => localStorage.getItem('docuexplain-theme') || 'light'
);

useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('docuexplain-theme', theme);
}, [theme]);

function toggleTheme() {
  setTheme(current => current === 'light' ? 'dark' : 'light');
}

  const fileRef = useRef(null);
  const endRef = useRef(null);

  // Load documents when the component mounts.
  // An effect must not itself be async or return a Promise.
  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
  try {
    const response = await fetch(`${API}/documents`);
    if (!response.ok) throw new Error();

    const documents = await response.json();
    if (cancelled) return;

    setDocs(documents);

    const readyDocument = documents.find(
      document => document.status === 'READY'
    );

    if (readyDocument) {
      await choose(readyDocument);
    }
  } catch {
    if (!cancelled) {
      setErr('Start the Spring Boot backend and MySQL, then refresh.');
    }
  }
}

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the latest message visible.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function choose(document) {
    setActive(document);
    setMessages([]);
    setErr('');

    if (document.status !== 'READY') return;

    try {
      const response = await fetch(
        `${API}/documents/${document.id}/history`
      );

      if (!response.ok) return;

      const history = await response.json();

      // Avoid showing history for a different document if the user
      // switches documents while the request is running.
      setActive(current => {
        if (current?.id !== document.id) return current;

        setMessages(
          history.map((message, index) => ({
            id: `${message.id}-${index}`,
            role: message.role,
            content: message.content,
            status: 'HISTORY',
            citations: []
          }))
        );

        return current;
      });
    } catch {
      // History is optional; the document can still be used.
    }
  }

  async function upload(file) {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErr('Please choose a PDF file.');
      return;
    }

    setBusy(true);
    setErr('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API}/documents`, {
        method: 'POST',
        body: formData
      });

      const document = await response.json();

      if (!response.ok) {
        throw new Error(document.error || 'Upload failed.');
      }

      setDocs(previous => [
        document,
        ...previous.filter(item => item.id !== document.id)
      ]);

      setActive(document);
      setMessages([]);

      if (document.status !== 'READY') {
        setErr(document.errorMessage || 'Document processing failed.');
      }
    } catch (error) {
      setErr(error.message || 'Upload failed.');
    } finally {
      setBusy(false);

      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  }

  async function ask(text = q) {
    const question = text.trim();

    if (
      !question ||
      !active ||
      active.status !== 'READY' ||
      busy
    ) {
      return;
    }

    const documentId = active.id;

    setQ('');
    setErr('');

    setMessages(previous => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: question
      }
    ]);

    setBusy(true);

    try {
      const response = await fetch(
        `${API}/documents/${documentId}/questions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ question })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || 'Could not answer the question.'
        );
      }

      setMessages(previous => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.answer || result.message || 'No answer was returned.',
          example: result.example,
          status: result.status,
          citations: result.citations || []
        }
      ]);
    } catch (error) {
      setMessages(previous => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: 'error',
          content: error.message || 'Something went wrong while answering.'
        }
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function remove(document) {
    if (!confirm(`Delete ${document.filename}?`)) return;

    try {
      const response = await fetch(
        `${API}/documents/${document.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Could not delete document.');
      }

      const remaining = docs.filter(item => item.id !== document.id);

      setDocs(remaining);

      if (active?.id === document.id) {
        setActive(remaining[0] || null);
        setMessages([]);
      }

      setErr('');
    } catch {
      setErr('Could not delete document.');
    }
  }

  return (
    <div className="shell">
      
<header className="top">
  <div className="brand">
    <div className="logo">
      <BookOpen />
    </div>
    <div>
      <b>DocuExplain <span>AI</span></b>
      <small>Understand anything you read</small>
    </div>
  </div>

  <button
    type="button"
    className="theme-toggle"
    onClick={toggleTheme}
    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
  >
    {theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'}
  </button>

  <div className="secure">
    <ShieldCheck size={16} />
    Evidence-grounded answers
  </div>
</header>


      <main className="layout">
        <aside className="sidebar">
          <div className="section-label">
            YOUR LIBRARY <span>{docs.length}</span>
          </div>

          <button
            className="upload"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            <FileUp size={17} />
            {busy ? 'Working…' : 'Upload a PDF'}
          </button>

          <input
            ref={fileRef}
            hidden
            type="file"
            accept=".pdf,application/pdf"
            onChange={event => upload(event.target.files?.[0])}
          />

          <div className="drop">
            <UploadCloud size={22} />
            <b>Choose a PDF to begin</b>
            <small>Text-based PDF · Up to 30 MB</small>
          </div>

          <div className="section-label recent">RECENT DOCUMENTS</div>

          {docs.map(document => (
            <div
              key={document.id}
              className={`doc ${
                active?.id === document.id ? 'selected' : ''
              }`}
            >
              <button
                className="docpick"
                onClick={() => choose(document)}
              >
                <FileText size={19} />
                <span>
                  <b>{document.filename}</b>
                  <small>
                    {document.status === 'READY'
                      ? `${document.pageCount} pages · Ready`
                      : document.status}
                  </small>
                </span>
              </button>

              <button
                className="delete"
                onClick={() => remove(document)}
                title="Delete"
                aria-label={`Delete ${document.filename}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {!docs.length && (
            <p className="muted small">
              Uploaded documents will appear here.
            </p>
          )}

          <div className="sidebar-note">
            <ShieldCheck size={16} />
            Answers should be supported by your selected PDF.
          </div>
        </aside>

        <section className="main">
          {!active ? (
            <div className="welcome">
              <div className="hero"><Sparkles size={28} /></div>
              <label>YOUR PERSONAL DOCUMENT TUTOR</label>
              <h1>
                Make complex documents
                <br />
                <em>easy to understand.</em>
              </h1>
              <p>
                Upload a PDF and ask questions in plain language.
                Get simple explanations, examples and source pages
                you can verify.
              </p>

              <button
                className="primary"
                onClick={() => fileRef.current?.click()}
              >
                <FileUp size={17} />
                Upload your first PDF
              </button>

              <div className="features">
                <div>
                  <BookMarked />
                  <b>Page citations</b>
                  <small>See where answers come from</small>
                </div>
                <div>
                  <Sparkles />
                  <b>Simple explanations</b>
                  <small>Understand difficult concepts</small>
                </div>
                <div>
                  <ShieldCheck />
                  <b>Evidence first</b>
                  <small>Alerts when evidence is missing</small>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="dochead">
                <div className="pdficon"><FileText /></div>
                <div className="doctitle">
                  <b>{active.filename}</b>
                  <small>
                    {active.pageCount || '—'} pages ·{' '}
                    {active.chunkCount || '—'} passages
                  </small>
                </div>
                <span className={`pill ${active.status.toLowerCase()}`}>
                  {active.status}
                </span>
              </div>

              {err && (
                <div className="error">
                  <AlertTriangle size={17} />
                  {err}
                </div>
              )}

              {active.status === 'FAILED' ? (
                <div className="empty">
                  <AlertTriangle size={28} />
                  <h2>We couldn't read this PDF</h2>
                  <p>
                    {active.errorMessage ||
                      'Try a text-based PDF. Scanned PDFs need OCR.'}
                  </p>
                </div>
              ) : active.status !== 'READY' ? (
                <div className="empty">
                  <LoaderCircle className="spin" />
                  <h2>Preparing your document</h2>
                  <p>
                    Extracting text and indexing passages.
                    Keep this page open.
                  </p>
                </div>
              ) : (
                <>
                  <div className="chatintro">
                    <div className="boticon"><Bot /></div>
                    <div>
                      <b>Ask your document</b>
                      <small>
                        I'll explain it simply and cite the source pages.
                      </small>
                    </div>
                  </div>

                  <div className="messages">
                    {!messages.length ? (
                      <div className="empty">
                        <div className="bubbleicon">
                          <MessageCircle />
                        </div>
                        <h2>What would you like to understand?</h2>
                        <p>Try one of these questions to get started.</p>

                        <div className="suggestions">
                          {[
                            'Explain the main ideas simply',
                            'Summarize this document',
                            'Explain a concept with an example'
                          ].map(suggestion => (
                            <button
                              key={suggestion}
                              onClick={() => ask(suggestion)}
                              disabled={busy}
                            >
                              {suggestion}<span>↗</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      messages.map(message => (
                        <div
                          key={message.id}
                          className={`message ${message.role}`}
                        >
                          <div className="msgavatar">
                            {message.role === 'user'
                              ? 'You'
                              : <Bot size={17} />}
                          </div>

                          <div className="msgbody">
                            <b>
                              {message.role === 'user'
                                ? 'You'
                                : message.role === 'error'
                                  ? 'Error'
                                  : 'DocuExplain AI'}
                            </b>

                            <p
                              className={
                                message.status === 'OUT_OF_SCOPE'
                                  ? 'warning'
                                  : ''
                              }
                            >
                              {message.content}
                            </p>

                            {message.example && (
                              <div className="example">
                                <b>
                                  <Sparkles size={14} />
                                  SIMPLE EXAMPLE
                                </b>
                                <p>{message.example}</p>
                              </div>
                            )}

                            {message.citations?.length > 0 && (
                              <div className="sources">
                                <b>
                                  <BookMarked size={14} />
                                  SOURCES FROM YOUR PDF
                                </b>

                                {message.citations.map((citation, index) => (
                                  <div className="source" key={index}>
                                    <strong>Page {citation.page}</strong>
                                    <span>{citation.excerpt}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    {busy && (
                      <div className="thinking">
                        <LoaderCircle className="spin" size={17} />
                        Finding evidence in your document…
                      </div>
                    )}

                    <div ref={endRef} />
                  </div>

                  <form
                    className="composer"
                    onSubmit={event => {
                      event.preventDefault();
                      ask();
                    }}
                  >
                    <textarea
                      value={q}
                      onChange={event => setQ(event.target.value)}
                      onKeyDown={event => {
                        if (
                          event.key === 'Enter' &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();
                          ask();
                        }
                      }}
                      placeholder="Ask a question about this document…"
                      disabled={busy}
                    />

                    <div>
                      <small>
                        <ShieldCheck size={13} />
                        Answers are checked against retrieved passages
                      </small>
                      <button
                        type="submit"
                        disabled={busy || !q.trim()}
                        aria-label="Send question"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </section>

        <aside className="how">
          <div className="howtitle">
            <Sparkles size={16} /> HOW IT WORKS
          </div>

          {[
            [
              '01',
              'We read your PDF',
              'Text is extracted and indexed so relevant passages can be found.'
            ],
            [
              '02',
              'We find evidence',
              'Your question is matched to passages in the selected document.'
            ],
            [
              '03',
              'We explain simply',
              'The AI uses plain English and illustrative examples.'
            ]
          ].map(step => (
            <div className="step" key={step[0]}>
              <span>{step[0]}</span>
              <div>
                <b>{step[1]}</b>
                <p>{step[2]}</p>
              </div>
            </div>
          ))}

          <div className="guard">
            <ShieldCheck />
            <div>
              <b>Evidence over guesses</b>
              <p>
                If the document lacks enough information, the assistant
                should say so instead of guessing.
              </p>
            </div>
          </div>

          <p className="muted small">
            Scanned PDFs may need OCR. AI-generated answers can be
            imperfect; verify citations.
          </p>
        </aside>
      </main>

    </div>
  );
}
