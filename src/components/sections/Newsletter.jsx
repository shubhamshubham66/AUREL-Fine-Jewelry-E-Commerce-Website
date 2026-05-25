import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="section" aria-label="Newsletter signup">
      <div className="container-luxe">
        <div className="relative rounded-xl glass p-8 sm:p-12 md:p-16 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gold/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-gold/5 blur-3xl" />

          <div className="relative z-10 max-w-xl mx-auto text-center">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cream mb-3">
              Join the <span className="text-gold-gradient">Inner Circle</span>
            </h2>
            <p className="text-cream/50 text-sm sm:text-base mb-8">
              Receive early access to new collections, private events, and exclusive offers.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4"
              >
                <p className="text-gold font-serif text-xl">Welcome to AUREL</p>
                <p className="text-cream/50 text-sm mt-1">
                  Check your inbox for a welcome surprise.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-5 py-3 bg-onyx/60 border border-cream/10 rounded-sm text-cream placeholder-cream/30 focus:outline-none focus:border-gold/40 transition-colors"
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="btn-gold whitespace-nowrap"
                  aria-label="Subscribe to newsletter"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
