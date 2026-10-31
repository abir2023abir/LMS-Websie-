import type { Metadata } from 'next';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import { contactInfo, hasContactDetails, socialLinks } from '@/lib/contact';
import ConsultationBookingForm from '@/components/messages/ConsultationBookingForm';
import { getContactBookingContent } from '@/lib/contact-booking-content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Us — Career Bridge.Studio',
  description: 'Get in touch with Career Bridge.Studio or book a consultation with our team.',
};

export default function ContactPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const initialService = typeof searchParams?.service === 'string' ? searchParams.service : '';
  const initialBilling = typeof searchParams?.billing === 'string' ? searchParams.billing : '';
  return (
    <div className="min-h-screen bg-white text-[#111827] selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      <section className="bg-gradient-to-b from-[#FACC15] to-[#EAB308] pt-28 lg:pt-32 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">Contact us</h1>
          <p className="mt-2 max-w-lg text-sm sm:text-base font-medium text-[#111827]/80">
            {hasContactDetails ? 'Reach us using the details below, or book a time with our team.' : 'Book a time below and our team will get back to you.'}
          </p>
        </div>
      </section>

      {(hasContactDetails || socialLinks.length > 0 || contactInfo.mapEmbed) && (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={contactInfo.mapEmbed ? 'lg:col-span-5 space-y-3' : 'lg:col-span-12 grid sm:grid-cols-2 gap-3'}>
          {contactInfo.phoneDisplay && (
          <a href={`tel:${contactInfo.phoneTel}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:border-[#FACC15]">
            <span className="w-10 h-10 rounded-xl bg-[#111827] text-[#FACC15] flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase text-slate-400">Phone</span>
              <span className="font-bold">{contactInfo.phoneDisplay}</span>
            </span>
          </a>
          )}

          {contactInfo.whatsapp && (
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
              <span className="font-bold">+{contactInfo.whatsapp}</span>
            </span>
          </a>
          )}

          {contactInfo.email && (
          <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:border-[#FACC15]">
            <span className="w-10 h-10 rounded-xl bg-[#FACC15] text-[#111827] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase text-slate-400">Email</span>
              <span className="font-bold">{contactInfo.email}</span>
            </span>
          </a>
          )}

          {contactInfo.address && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <span className="w-10 h-10 rounded-xl bg-slate-100 text-[#111827] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase text-slate-400">Address</span>
              <span className="font-bold">{contactInfo.address}</span>
            </span>
          </div>
          )}

          {contactInfo.hours && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <span className="w-10 h-10 rounded-xl bg-slate-100 text-[#111827] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase text-slate-400">Hours</span>
              <span className="font-bold">{contactInfo.hours}</span>
            </span>
          </div>
          )}

          {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {socialLinks.map((item) => (
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
          )}
        </div>

        {contactInfo.mapEmbed && (
        <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-slate-200 h-[320px] sm:h-[420px] lg:h-auto lg:min-h-[420px] bg-slate-100">
          <iframe
            title="Career Bridge.Studio office map"
            src={contactInfo.mapEmbed}
            className="w-full h-full min-h-0"
            loading="lazy"
          />
          {contactInfo.mapLink && (
          <a
            href={contactInfo.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 text-xs font-bold text-slate-600 hover:text-[#111827]"
          >
            Open the map
          </a>
          )}
        </div>
        )}
      </section>
      )}

      <ConsultationBookingForm initialService={initialService} initialBilling={initialBilling} content={getContactBookingContent()} />

      <EnglishFooter />
    </div>
  );
}
