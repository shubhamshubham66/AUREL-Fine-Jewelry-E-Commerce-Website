import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function Footer() {
  const columns = [
    { title: 'Collections', links: ['Rings', 'Necklaces', 'Earrings', 'Bracelets'] },
    { title: 'Company', links: ['Our Story', 'Craftsmanship', 'Sustainability', 'Careers'] },
    { title: 'Support', links: ['Contact', 'Shipping', 'Returns', 'Size Guide'] },
  ];

  return (
    <footer className="border-t border-gold/10 bg-obsidian">
      <div className="container-luxe py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <a href="#" className="font-serif text-2xl text-gold-gradient tracking-[0.15em]">
              AUREL
            </a>
            <p className="mt-4 text-sm text-cream/50 leading-relaxed">
              Jewelry designed to outlive time. Handcrafted in limited editions from ethically sourced materials.
            </p>
          </div>

          {columns.map(col => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-gold/80 uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-cream/50 hover:text-gold transition-colors duration-300">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hairline mt-12 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/40">
            © {new Date().getFullYear()} AUREL Fine Jewelry. All rights reserved.
          </p>
          <p className="text-xs text-cream/40 flex items-center gap-1">
            Crafted with <Heart size={12} className="text-rosegold" /> and precision
          </p>
        </div>
      </div>
    </footer>
  );
}
