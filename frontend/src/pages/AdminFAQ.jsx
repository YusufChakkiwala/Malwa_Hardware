import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminNav from '../components/AdminNav';
import { apiJson } from '../services/api';

function normalizeText(value) {
  return String(value ?? '').trim();
}

function AdminFAQ() {
  const [form, setForm] = useState({ question: '', answer: '' });
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canSubmit = useMemo(() => {
    return Boolean(normalizeText(form.question)) && Boolean(normalizeText(form.answer));
  }, [form.answer, form.question]);

  const fetchFaqs = useCallback(async (signal) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await apiJson('/api/faqs', { method: 'GET', signal });
      setFaqs(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.error('[AdminFAQ] Failed to fetch FAQs', err);
      setError(err?.message || 'Failed to fetch FAQs.');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchFaqs(controller.signal);
    return () => controller.abort();
  }, [fetchFaqs]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const question = normalizeText(form.question);
    const answer = normalizeText(form.answer);

    if (!question || !answer) {
      setError('Question and answer are required.');
      return;
    }

    setSubmitting(true);
    try {
      await apiJson('/api/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, answer })
      });

      setForm({ question: '', answer: '' });
      setSuccess('FAQ added successfully.');

      const controller = new AbortController();
      await fetchFaqs(controller.signal);
    } catch (err) {
      console.error('[AdminFAQ] Failed to add FAQ', err);
      setError(err?.message || 'Failed to add FAQ.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (faqId) => {
    setError('');
    setSuccess('');

    const ok = window.confirm('Delete this FAQ?');
    if (!ok) return;

    try {
      await apiJson(`/api/faqs/${faqId}`, { method: 'DELETE' });

      setSuccess('FAQ deleted.');
      const controller = new AbortController();
      await fetchFaqs(controller.signal);
    } catch (err) {
      console.error('[AdminFAQ] Failed to delete FAQ', err);
      setError(err?.message || 'Failed to delete FAQ.');
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <AdminNav />

      <div className="space-y-6">
        <div className="surface-panel">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="chip mb-3">FAQ Management</p>
              <h1 className="page-title">FAQs</h1>
              <p className="page-subtitle">Add, review, and remove FAQs shown on the website.</p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                const controller = new AbortController();
                fetchFaqs(controller.signal);
              }}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Question</label>
                <input
                  value={form.question}
                  onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
                  placeholder="Enter FAQ question"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Answer</label>
                <textarea
                  rows={3}
                  value={form.answer}
                  onChange={(event) => setForm((prev) => ({ ...prev, answer: event.target.value }))}
                  placeholder="Enter FAQ answer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <button type="submit" className="btn-primary" disabled={!canSubmit || submitting}>
                {submitting ? 'Adding...' : 'Add FAQ'}
              </button>
              <div className="space-y-1 text-sm">
                {error && <p className="text-red-600">{error}</p>}
                {success && <p className="text-emerald-700">{success}</p>}
              </div>
            </div>
          </form>
        </div>

        <div className="surface-panel">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl text-slate-900">FAQ List</h2>
            <p className="text-sm font-semibold text-slate-600">{faqs.length} total</p>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-slate-600">Loading FAQs...</p>
          ) : faqs.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No FAQs yet. Add your first one above.</p>
          ) : (
            <div className="mt-4 grid gap-4">
              {faqs.map((faq) => (
                <article key={faq._id} className="card">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Question</p>
                      <p className="mt-1 break-words text-base font-bold text-slate-900">{faq.question}</p>

                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Answer</p>
                      <p className="mt-1 break-words text-sm text-slate-700">{faq.answer}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button type="button" className="btn-danger" onClick={() => handleDelete(faq._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminFAQ;
