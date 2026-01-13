import React, { useState } from 'react';

export default function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://formsubmit.co/ajax/deepaksinghal1995@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
          _subject: 'New contact from Embedded Systems Blog',
          _template: 'box',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        form.reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          Message Sent!
        </h3>
        <p className="text-green-700 dark:text-green-300">
          Thank you for your feedback. I'll get back to you soon.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-primary-600 dark:text-primary-400 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot for spam protection */}
      <input type="text" name="_honey" style={{ display: 'none' }} />

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition"
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Powered by FormSubmit.co - No login required
      </p>
    </form>
  );
}
