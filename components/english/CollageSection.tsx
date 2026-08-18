'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function CollageSection() {
  return (
    <section className="bg-white py-12 overflow-hidden border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Yellow Decorative Ring Accent */}
        <div className="relative flex justify-center items-center py-6">
          <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Image Card 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden border-4 border-[#FACC15]/30 shadow-xl bg-slate-100"
            >
              <Image
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=450&fit=crop"
                alt="Students studying online"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Image Card 2 (Center Hero Focus) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden border-4 border-[#FACC15] shadow-2xl bg-slate-100 md:-translate-y-4"
            >
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=450&fit=crop"
                alt="Interactive English classroom"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Image Card 3 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden border-4 border-[#FACC15]/30 shadow-xl bg-slate-100"
            >
              <Image
                src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&h=450&fit=crop"
                alt="Student learning on mobile"
                fill
                className="object-cover"
              />
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
