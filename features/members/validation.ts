export interface MemberFormValues {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  familyId: string;
  roleInFamily: string;
  isHeadOfFamily: boolean;
  baptismStatus: string;
  membershipStatus: string;
  registrationDate: string;
  confessorPriest: string;
  confessorPriestId?: string;
  notes: string;
}

export type MemberFormErrors = Partial<Record<keyof MemberFormValues, string>>;

const PHONE_REGEX = /^0\d{9}$/; // e.g. 0911345678

/** Validates the Add/Edit Member form. Returns a map of field → error message. */
export function validateMemberForm(values: MemberFormValues): MemberFormErrors {
  const errors: MemberFormErrors = {};

  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  if (!values.gender) errors.gender = "Please select a gender.";

  if (!values.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
  } else if (new Date(values.dateOfBirth) > new Date()) {
    errors.dateOfBirth = "Date of birth cannot be in the future.";
  }

  if (values.phone && !PHONE_REGEX.test(values.phone.replace(/\s+/g, ""))) {
    errors.phone = "Enter a valid 10-digit phone number (e.g. 0911345678).";
  }

  if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.familyId) errors.familyId = "Please select a family.";
  if (!values.roleInFamily) errors.roleInFamily = "Please select the relationship to the head.";

  if (!values.membershipStatus) errors.membershipStatus = "Please select a membership status.";
  if (!values.registrationDate) errors.registrationDate = "Registration date is required.";

  return errors;
}

export function hasErrors(errors: MemberFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
