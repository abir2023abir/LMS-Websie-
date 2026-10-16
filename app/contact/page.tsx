import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import { contactInfo } from '@/lib/contact';
import CampusMessageForm from '@/components/messages/CampusMessageForm';

export const metadata: Metadata = {
  title: 'Contact Us — English Capsules',
  description: 'Call, WhatsApp, or visit English Capsules. Map, phone, email, and social pages.',
};

const socials = [
  { label: 'Facebook', href: contactInfo.facebook },
  { label: 'Instagram', href: contactInfo.instagram },
  { label: 'YouTube', href: contactInfo.youtube },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      <section className="bg-gradient-to-b from-[#FACC15] to-[#EAB308] pt-28 lg:pt-32 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">Contact us</h1>
          <p className="mt-2 max-w-lg text-sm sm:text-base font-medium text-[#111827]/80">
            Call, message on WhatsApp, or come to the campus. The map is below.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          <a href={`tel:${contactInfo.phoneTel}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:border-[#FACC15]">
            <span className="w-10 h-10 rounded-xl bg-[#111827] text-[#FACC15] flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase text-slate-400">Phone</span>
              <span className="font-bold">{contactInfo.phoneDisplay}</span>
            </span>
          </a>

          <a
            href={`https://wa.me/${contactInfo.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:border-[#FACC15]"
          >
            <span className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase text-slate-400">WhatsApp</span>
              <span className="font-bold">{contactInfo.phoneDisplay}</span>
            </span>
          </a>

          <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:border-[#FACC15]">
            <span className="w-10 h-10 rounded-xl bg-[#FACC15] text-[#111827] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase text-slate-400">Email</span>
              <span className="font-bold">{contactInfo.email}</span>
            </span>
          </a>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <span className="w-10 h-10 rounded-xl bg-slate-100 text-[#111827] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase text-slate-400">Campus</span>
              <span className="font-bold">{contactInfo.address}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <span className="w-10 h-10 rounded-xl bg-slate-100 text-[#111827] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase text-slate-400">Hours</span>
              <span className="font-bold">{contactInfo.hours}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {socials.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold hover:border-[#111827]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <Link href="/services" className="inline-flex text-sm font-bold text-[#111827] underline underline-offset-4">
            Looking for a class plan?
          </Link>
        </div>

        <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-slate-200 min-h-[420px] bg-slate-100">
          <iframe
            title="English Capsules campus map"
            src={contactInfo.mapEmbed}
            className="w-full h-[420px] lg:h-full min-h-[420px]"
            loading="lazy"
          />
          <a
            href={contactInfo.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 text-xs font-bold text-slate-600 hover:text-[#111827]"
          >
            Open the map
          </a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-xl rounded-3xl border border-slate-200 p-6">
          <CampusMessageForm />
        </div>
      </section>

      <EnglishFooter />
    </div>
  );
}
