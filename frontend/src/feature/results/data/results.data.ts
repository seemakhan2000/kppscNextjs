
export interface ExamResult {
  id: number;
  post: string;
  resultDate: string;
  referenceNo: string;
}

export const examResults: ExamResult[] = [
  {
    id: 1,
    post: "Junior Clerk",
    resultDate: "05 September, 2025",
    referenceNo: "KPPSC/RES/2025/01",
  },
  {
    id: 2,
    post: "Assistant Professor",
    resultDate: "10 September, 2025",
    referenceNo: "KPPSC/RES/2025/02",
  },
  {
    id: 3,
    post: "Computer Operator",
    resultDate: "12 September, 2025",
    referenceNo: "KPPSC/RES/2025/03",
  },
];
