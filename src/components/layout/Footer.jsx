import { motion } from 'framer-motion';
import { Instagram, Facebook, Youtube, Twitter } from 'lucide-react';

const footerLinks = {
  Collections: ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
  Services: ['Bespoke Design', 'Engraving', 'Ring Sizing', 'Gift Wrapping'],
  Care: ['Cleaning Guide', 'Warranty', 'Repairs', 'Insurance'],
};

const socialLinks = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Youtube, label: 'Youtube' },
  { icon: Twitter, label: 'Twitter' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-obsidian">
      <div className="container-luxe py-20">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Maison Column */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full border border-gold/50 flex items-center justify-center">
                <span className="text-gold font-serif text-sm">A</span>
              </div>
              <span className="font-serif text-cream text-lg tracking-[0.15em]">AUREL</span>
            </div>
            <p className="text-cream/50 text-sm leading-relaxed mb-6 max-w-xs">
              Fine jewelry designed to outlive time. Hand-finished in Florence since 1987.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center text-cream/50 hover:border-gold hover:text-gold transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <motion.div key={title} variants={itemVariants}>
              <h4 className="text-cream font-medium text-sm tracking-wide mb-5">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-cream/50 text-sm hover:text-cream transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="hairline my-12" />

        {/* Bottom Row */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-cream/40 text-xs">
            &copy; {new Date().getFullYear()} Maison AUREL. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-cream/40 text-xs hover:text-cream/70 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Giant Wordmark */}
        <motion.div
          className="mt-16 text-center overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span
            className="font-serif font-light select-none pointer-events-none"
            style={{
              fontSize: 'clamp(80px, 18vw, 260px)',
              WebkitTextStroke: '1px rgba(212,175,55,0.18)',
              WebkitTextFillColor: 'transparent',
              lineHeight: 0.85,
            }}
          >
            AUREL
          </span>
        </motion.div>
      </div>
    </footer>
  );
}
