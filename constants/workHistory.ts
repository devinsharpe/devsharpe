export interface WorkHistory {
  title: string;
  company: string;
  link: string;
  start: string;
  end: string;
  responsibilities: string[];
}

const workHistory: WorkHistory[] = [
  {
    title: "Frontend Software Engineer",
    company: "Strata Company",
    link: "https://www.gostrata.com/",
    start: "Nov 2024",
    end: "Present",
    responsibilities: [
      "Implement new features into greenfield NextJS project",
      "Assist with refining product specs and UX flow for new products",
    ],
  },
  {
    title: "Frontend Software Engineer",
    company: "Telrite Holdings, Inc.",
    link: "https://www.telrite.com",
    start: "Oct 2023",
    end: "Nov 2024",
    responsibilities: [
      "Researched and implemented new technologies into legacy codebases",
      "Developed new processes for streamlined collaboration between development, product management, and marketing",
      "Expanded shared packages and opportunities for consistency across brands",
    ],
  },
  {
    title: "Frontend Software Engineer",
    company: "The Washington Post",
    link: "https://www.washingtonpost.com/",
    start: "April 2022",
    end: "Feb 2023",
    responsibilities: [
      "Developing and maintaining internal tools relating to WP's advertising operations",
      "Improve the UI/UX of WP applications",
      "Work with WP Advertising team and Creative Group to create new features, templates, and components",
    ],
  },
  {
    title: "Web Developer",
    company: "Priority1 POS",
    link: "https://priority1pos.com/",
    start: "July 2018",
    end: "April 2022",
    responsibilities: [
      "Maintained and collaborated on several web applications for internal and client use",
      "Designed and developed 10+ applications using React and Typescript",
      "Collaborated on and developed 4 desktop applications using Electron",
      "Deployed various projects to AWS servers with full CI/CD pipeline",
      "Assisted with multiple internal optimizations by automating various tasks using Python or TS Node",
    ],
  },
];

export default workHistory;
