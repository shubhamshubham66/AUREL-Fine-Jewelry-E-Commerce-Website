import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

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
    <section className="section">
      <div className="container-luxe">
        <motion.div
          className="relative glass rounded-3xl p-10 md:p-16 text-center overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative Gold Circles */}
          <div className="absolute -left-24 -top-24 w-72 h-72 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
          <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-radial-gold opacity-10 pointer-events-none" />

          <div className="relative z-10">
            <p className="eyebrow justify-center mb-4">Le Cercle Privé</p>
            <h2 className="h-display mb-4">
              Be the First to{' '}
              <span className="text-gold-gradient">Know</span>
            </h2>
            <p className="text-cream/60 max-w-lg mx-auto mb-10 font-light">
              Private launches, atelier stories, and invitations to events that never make it to the public.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 px-6 py-3.5 rounded-full border border-gold/25 bg-obsidian/70 text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/60 transition-colors text-sm"
                />
                <button type="submit" className="btn-gold rounded-full px-8">
                  Subscribe
                </button>
              </form>
            ) : (
              <motion.div
                className="flex items-center justify-center gap-3 text-gold"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span className="font-serif text-lg">Welcome to the inner circle</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
