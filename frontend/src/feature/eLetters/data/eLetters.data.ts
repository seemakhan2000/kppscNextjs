
export interface ELetter {
  id: number;
  title: string;
  dateIssued: string;
  referenceNo: string;
}

export const eLetters: ELetter[] = [
  {
    id: 1,
    title: "Recruitment Notification for Junior Clerk",
    dateIssued: "10 August, 2025",
    referenceNo: "KPPSC/AD/2025/01",
  },
  {
    id: 2,
    title: "Assistant Professor Application Guidelines",
    dateIssued: "08 August, 2025",
    referenceNo: "KPPSC/AD/2025/02",
  },
  {
    id: 3,
    title: "Computer Operator Exam Schedule",
    dateIssued: "05 August, 2025",
    referenceNo: "KPPSC/AD/2025/03",
  },
];
