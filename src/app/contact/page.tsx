"use client";
import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit');
      }
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-pink-500 text-white py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Contact Us
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Reach out to Nepal News for inquiries, feedback, or support. We are here to help!
        </p>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto py-12 px-6 md:px-12 ">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 md:p-12 space-y-10 border-2 ">
          
          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Our Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              You can reach us via email, phone, or visit us at our office. We’ll respond to your queries promptly.
            </p>
            <ul className="space-y-4">
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:info@nepalsamachar.com" className="text-red-600 font-medium hover:underline">
                  info@nepalsamachar.colm
                </a>
              </li>
              <li>
                <strong>Phone:</strong> +977-1-4444444
              </li>
              <li>
                <strong>Address:</strong> Kathmandu, Nepal
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Send Us a Message</h2>
            <form className="space-y-6" onSubmit={submit}>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2" htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="Your Email"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="Your Message"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
              >
                {status === 'loading' ? 'Sending…' : 'Send Message'}
              </button>

              {status === 'success' && (
                <p className="text-green-600 dark:text-green-400 text-sm">Message sent successfully.</p>
              )}
              {status === 'error' && (
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
