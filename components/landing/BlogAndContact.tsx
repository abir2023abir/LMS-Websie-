import ConsultationBookingForm from '@/components/messages/ConsultationBookingForm';
import { getContactBookingContent } from '@/lib/contact-booking-content';

export default function BlogAndContact() {
  return <ConsultationBookingForm content={getContactBookingContent()} />;
}
