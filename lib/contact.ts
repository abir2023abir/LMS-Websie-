// Official contact details. Leave a field empty ('') to hide it everywhere it appears
// (footer, contact page, emails) until the real value is known.
export const contactInfo = {
  phoneDisplay: '',
  phoneTel: '',
  whatsapp: '',
  email: '',
  address: '',
  hours: '',
  facebook: '',
  instagram: '',
  youtube: '',
  linkedin: '',
  mapEmbed: '',
  mapLink: '',
};

export const socialLinks = [
  { label: 'Facebook', href: contactInfo.facebook },
  { label: 'Instagram', href: contactInfo.instagram },
  { label: 'YouTube', href: contactInfo.youtube },
  { label: 'LinkedIn', href: contactInfo.linkedin },
].filter((item) => item.href);

export const hasContactDetails = Boolean(
  contactInfo.phoneDisplay || contactInfo.whatsapp || contactInfo.email || contactInfo.address || contactInfo.hours,
);

// Public certificate verification address, e.g. "careerbridge.studio/verify-certificate".
export const certificateVerifyLabel = `${(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '')}/verify-certificate`;
