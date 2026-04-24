import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function readErrorMessage(response) {
  try {
    const data = await response.json();
    return data?.message || 'Request failed';
  } catch {
    try {
      const text = await response.text();
      return text || 'Request failed';
    } catch {
      return 'Request failed';
    }
  }
}

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <article className="surface-soft">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-slate-900 md:text-base">{faq.question}</span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-700">
          {isOpen ? '-' : '+'}
        </span>
      </button>

      <div className={`mt-3 grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-slate-700">{faq.answer}</p>
        </div>
      </div>
    </article>
  );
}

function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasFaqs = useMemo(() => faqs.length > 0, [faqs.length]);

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    setLoading(true);

    fetch(`${API_BASE}/faqs`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) {
          const message = await readErrorMessage(response);
          throw new Error(message);
        }
        return response.json();
      })
      .then((data) => {
        setFaqs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(err?.message || 'Failed to load FAQs.');
        setFaqs([]);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <div className="surface-panel">
        <p className="chip mb-4">Help Center</p>
        <h2 className="page-title">Frequently Asked Questions</h2>
        <p className="page-subtitle">Quick answers about delivery, payments, returns, and more.</p>
      </div>

      <div className="surface-panel">
        {loading ? (
          <p className="text-sm text-slate-600">Loading FAQs...</p>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : !hasFaqs ? (
          <p className="text-sm text-slate-600">No FAQs available right now.</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq._id} faq={faq} isOpen={openId === faq._id} onToggle={() => toggle(faq._id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FAQ;

