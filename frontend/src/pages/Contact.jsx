import { useState } from 'react';
import { submitQuery, uploadImage } from '../services/chatService';

function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', shopName: '', message: '' });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      await submitQuery({ ...form, imageUrl });
      setDone(true);
      setForm({ name: '', phone: '', shopName: '', message: '' });
      setImage(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid gap-8 md:grid-cols-2">
      <div className="surface-panel">
        <h1 className="font-heading text-4xl text-slate-900">Customer Query</h1>
        <p className="mt-2 text-sm text-slate-600">Send your requirements and owner will respond quickly.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input required value={form.name} onChange={(event) => handleChange('name', event.target.value)} placeholder="Name" />
          <input required value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} placeholder="Phone" />
          <input value={form.shopName} onChange={(event) => handleChange('shopName', event.target.value)} placeholder="Shop name (optional)" />
          <textarea
            required
            rows={4}
            value={form.message}
            onChange={(event) => handleChange('message', event.target.value)}
            placeholder="Message"
          />
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] || null)} />
          <button type="submit" className="btn-primary">
            {submitting ? 'Submitting...' : 'Submit Query'}
          </button>
          {done && <p className="text-sm text-emerald-600">Query submitted successfully.</p>}
        </form>
      </div>

      <div className="surface-panel">
        <h2 className="font-heading text-2xl text-slate-900">Store Contact</h2>
        <p className="mt-3 text-sm text-slate-600">Phone: 7891338352</p>
        <p className="text-sm text-slate-600">Address: New Cloth market Chittorgarh (Rajasthan)</p>
        <p className="mt-3 text-sm text-slate-600">
          You can also use live chat from bottom-right for instant response.
        </p>
      </div>
    </section>
  );
}

export default Contact;
