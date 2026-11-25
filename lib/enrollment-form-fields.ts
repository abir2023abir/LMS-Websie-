// The "Course Enrollment" form from the client layout. Shared by the browser form and the server.
export const RELATIONS = ['Father', 'Mother', 'Brother', 'Sister', 'Husband / Wife', 'Uncle', 'Aunt', 'Grandparent', 'Legal Guardian', 'Other'] as const;
export const EDUCATION_STATUSES = ['School student', 'College student', 'Honours student', 'Masters student', 'Graduate', 'Job holder', 'Business owner', 'Job seeker', 'Other'] as const;

export type EnrollmentDetails = {
  fullName: string; phone: string; email: string; birthDate: string;
  guardianName: string; relation: string; guardianPhone: string; guardianEmail: string; guardianAccess: boolean;
  educationStatus: string; classYear: string; institution: string; studentRoll: string; learningSituation: string;
  facebook: string; instagram: string; linkedin: string; otherSocial: string;
  paymentMethod: string; paymentReference: string;
  consent: boolean;
};

export const emptyDetails: EnrollmentDetails = {
  fullName: '', phone: '', email: '', birthDate: '',
  guardianName: '', relation: '', guardianPhone: '', guardianEmail: '', guardianAccess: true,
  educationStatus: '', classYear: '', institution: '', studentRoll: '', learningSituation: '',
  facebook: '', instagram: '', linkedin: '', otherSocial: '',
  paymentMethod: '', paymentReference: '',
  consent: false,
};
