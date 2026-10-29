
export type EducationRecord = {
  title: string;
  equivalency: string;
  institute: string;
  resultDate: string;
  obtainedMarks: string;
  totalMarks: string;
  cgpa: string;
  division: string;
  grade: string;
  distinction: string;
};

export type EducationStorage = {
  education: EducationRecord[];
  cnic: string | null;
};

export type ToastType = "success" | "error";
