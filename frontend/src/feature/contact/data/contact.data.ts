
export interface ContactOffice {
  id: number;
  title: string;
  address: string;
  phone: string;
  email: string;
  fax?: string;
}

export const contactOffices: ContactOffice[] = [
  {
    id: 1,
    title: "Head Office",
    address:
      "KPPSC Secretariat, Peshawar, Khyber Pakhtunkhwa, Pakistan",
    phone: "+92 91 1234567",
    email: "info@kppsc.gov.pk",
    fax: "+92 91 7654321",
  },
  {
    id: 2,
    title: "Regional Office",
    address:
      "KPPSC Regional Office, Abbottabad, Khyber Pakhtunkhwa, Pakistan",
    phone: "+92 992 123456",
    email: "abbottabad@kppsc.gov.pk",
  },
];
