import { motion } from 'framer-motion';
import { FiInstagram, FiTwitter } from 'react-icons/fi';

const links = {
  Maison: ['About AUREL', 'Heritage', 'Sustainability', 'Press'],
  Collections: ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
  Services: ['Bespoke Design', 'Engraving', 'Ring Sizing', 'Gift Cards'],
  Care: ['Cleaning Guide', 'Warranty', 'Repairs', 'Insurance'],
};

export default function Footer() {
  return (
    <footer className="pt-20 pb-10 bg-obsidian border-t border-cream/5" aria-label="Site footer">
      <div className="container-luxe">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gold font-serif text-2xl font-bold">A</span>
              <span className="text-cream font-sans text-sm tracking-[0.3em] font-light">
                AUREL
              </span>
            </div>
            <p className="text-cream/40 text-sm leading-relaxed max-w-xs">
              Fine jewelry designed to outlive time. Handcrafted in Florence since 1987.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-cream/10 flex items-center justify-center text-cream/50 hover:text-gold hover:border-gold/40 transition-all"
                aria-label="Instagram"
              >
                <FiInstagram className="text-sm" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-cream/10 flex items-center justify-center text-cream/50 hover:text-gold hover:border-gold/40 transition-all"
                aria-label="Twitter"
              >
                <FiTwitter className="text-sm" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-cream text-sm font-medium tracking-wide mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {items.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-cream/40 text-sm hover:text-gold transition-colors"
                      aria-label={link}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        <div className="hairline mb-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-cream/30 text-xs">
            &copy; {new Date().getFullYear()} AUREL Maison. All rights reserved.
          </p>
          <div className="flex gap-4 text-cream/30 text-xs">
            <a href="#" className="hover:text-gold transition-colors" aria-label="Privacy policy">
              Privacy
            </a>
            <a href="#" className="hover:text-gold transition-colors" aria-label="Terms of service">
              Terms
            </a>
            <a href="#" className="hover:text-gold transition-colors" aria-label="Cookie policy">
              Cookies
            </a>
          </div>
        </div>

        {/* Giant Wordmark */}
        <motion.div
          className="mt-16 text-center overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <span
            className="text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] font-serif font-bold leading-none select-none"
            style={{
              WebkitTextStroke: '1px rgba(212, 175, 55, 0.1)',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AUREL
          </span>
        </motion.div>
      </div>
    </footer>
  );
}
