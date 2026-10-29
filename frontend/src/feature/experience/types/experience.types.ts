
export type NatureOfJob =
  | "Permanent"
  | "Contract"
  | "Temporary"
  | "Internship"
  | "Part-Time"
  | "Other";

export type ExperienceRecord = {
  department: string;
  positionTitle: string;
  natureOfJob: NatureOfJob;
  jobResponsibilities: string;
  jobStartDate: string;
  isContinued: "Yes" | "No";
};

export type ExperienceProfileData = {
  experience?: ExperienceRecord[];
  [key: string]: unknown;
};
