export interface VolunteerHistory {
  title: string;
  company: string;
  link: string;
  start: string;
  end: string;
  responsibilities: string[];
}

const volunteerHistory: VolunteerHistory[] = [
  {
    title: "Software Developer",
    company: "Trans Formations Project",
    link: "https://www.transformationsproject.org/",
    start: "May 2024",
    end: "Present",
    responsibilities: [
      "Assist with web application development on the 'widgets' initiative.",
      "Present data gathered by the Record Keeping department in an easily-digestible format.",
    ],
  },
];

export default volunteerHistory;
