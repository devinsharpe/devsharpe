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
    title: "Front End Software Engineer",
    company: "The Washington Post",
    link: "https://www.washingtonpost.com/",
    start: "April 2022",
    end: "Current",
    responsibilities: [
      "Developing and maintaining internal tools relating to WP's advertising operations",
      "Improve the UI/UX of WP applications",
      "Work with WP Advertising team and Creative Group to create new features, templates, and components"
    ]
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
      "Assisted with multiple internal optimizations by automating various tasks using Python or TS Node"
    ]
  }
];

export default workHistory;
