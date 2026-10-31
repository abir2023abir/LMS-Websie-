export type ContactBookingContent = {
  eyebrow: string; headline: string; description: string; meetingTitle: string; calendarHint: string;
  duration: string; location: string; timezone: string; availableTimes: string[]; availableTimesLabel: string;
  pendingNote: string; chooseDate: string; chooseTime: string; continueLabel: string; informationTitle: string;
  editTime: string; serviceQuestion: string; selectTopic: string; courseOption: string; bookkeepingOption: string;
  programmeOption: string; careerOption: string; otherOption: string; topicLabel: string; topicPlaceholder: string;
  billingLabel: string; chooseIfKnown: string; monthlyLabel: string; annualLabel: string; firstName: string;
  lastName: string; email: string; phone: string; company: string; revenue: string; discuss: string;
  inboxNote: string; confirmLabel: string; sendingLabel: string; successTitle: string; successBody: string;
  noInvitationNote: string; integrationNote: string; weekdayLabels: string[];
};

export const defaultContactBookingContent: ContactBookingContent = {
  eyebrow: 'Talk with our team', headline: "We're here to help you take the next step",
  description: "Choose a time to ask about a course, programme, or bookkeeping service. We'll review your request and confirm it with you.",
  meetingTitle: 'Learning & Bookkeeping Consultation', calendarHint: 'Choose a day and a preferred time', duration: '15 min',
  location: 'Google Meet · link after confirmation', timezone: 'Bangladesh Standard Time (UTC+06:00)',
  availableTimes: ['9:15 am','9:30 am','9:45 am','10:00 am','10:15 am','10:30 am','1:00 pm','1:30 pm','2:00 pm','3:00 pm','4:00 pm'],
  availableTimesLabel: 'Available times', pendingNote: 'Times are shown in Bangladesh Standard Time. Your preferred slot stays pending until our team confirms it.',
  chooseDate: 'Choose a date', chooseTime: 'Select a weekday on the calendar to see available times.', continueLabel: 'Continue',
  informationTitle: 'Your information', editTime: 'Edit time', serviceQuestion: 'What can we help with?', selectTopic: 'Select a topic',
  courseOption: 'Course or lesson question', bookkeepingOption: 'Bookkeeping consultation', programmeOption: 'Programme or orientation',
  careerOption: 'Career guidance', otherOption: 'Something else', topicLabel: 'Course, programme, or service',
  topicPlaceholder: 'e.g. Bookkeeping + Tax or a course name', billingLabel: 'Billing preference', chooseIfKnown: 'Choose if known',
  monthlyLabel: 'Monthly', annualLabel: 'Annual', firstName: 'First name', lastName: 'Last name', email: 'Email address', phone: 'Phone number',
  company: 'Company name', revenue: 'Average monthly revenue', discuss: 'What would you like to discuss?',
  inboxNote: 'Your request will appear in the admin message inbox. The team will confirm your time by replying there.',
  confirmLabel: 'Confirm request', sendingLabel: 'Sending…', successTitle: 'Your request is with our team',
  successBody: 'We saved your preferred time for {date} at {time}. It is pending confirmation; our team can reply in the admin message inbox.',
  noInvitationNote: 'Our team will contact you to confirm your slot.',
  integrationNote: '',
  weekdayLabels: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
};
