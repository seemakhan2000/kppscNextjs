
export interface Wing {
  id: number;
  title: string;
  description: string;
}

export const wings: Wing[] = [
  {
    id: 1,
    title: "Recruitment Wing",
    description:
      "Handles recruitment for all provincial government posts and publishes advertisements and schedules.",
  },
  {
    id: 2,
    title: "Examinations Wing",
    description:
      "Responsible for conducting written, practical, and interview examinations for candidates.",
  },
  {
    id: 3,
    title: "Legal & Advisory Wing",
    description:
      "Provides legal guidance and advice regarding recruitment processes, results, and regulations.",
  },
  {
    id: 4,
    title: "Research & Policy Wing",
    description:
      "Conducts research and develops policies for effective governance and selection procedures.",
  },
  {
    id: 5,
    title: "Administration Wing",
    description:
      "Manages day-to-day operations, HR, finance, and coordination with other wings.",
  },
  {
    id: 6,
    title: "IT & Support Wing",
    description:
      "Maintains website, online applications, databases, and technical support for candidates.",
  },
];
