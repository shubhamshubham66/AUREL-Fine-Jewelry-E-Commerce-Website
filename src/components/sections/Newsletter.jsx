import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="section bg-obsidian relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gold opacity-20" />
      <div className="container-luxe relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="eyebrow justify-center">Exclusive Access</span>
          <h2 className="h-display mt-4 text-cream">
            Join the <span className="text-gold-gradient">Inner Circle</span>
          </h2>
          <p className="mt-4 text-cream/50 text-lg font-light">
            Be the first to discover new collections, private events, and limited editions.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 flex items-center justify-center gap-3 text-gold"
            >
              <CheckCircle size={20} />
              <span className="font-serif text-lg">Welcome to AUREL.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 w-full px-5 py-3 bg-onyx/60 border border-gold/20 rounded-sm text-cream placeholder-cream/30 focus:outline-none focus:border-gold/60 transition-colors duration-300"
                required
              />
              <button type="submit" className="btn-gold flex items-center gap-2 whitespace-nowrap">
                <Send size={16} />
                Subscribe
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
