export interface BioImage {
  link: string;
  alt: string;
  width: number;
  height: number;
}

const bioImages: BioImage[] = [
  {
    link: "/personal images/personal1.jpg",
    alt: "Devin with a small black cat named Shadow",
    width: 256,
    height: 256
  },
  {
    link: "/personal images/personal2.jpg",
    alt: "Devin's orange cat, Mittens, posed next to a computer monitor displaying a code editor",
    width: 256,
    height: 256
  },
  {
    link: "/personal images/personal3.jpg",
    alt: "Devin hiking up a hill",
    width: 256,
    height: 256
  },
  {
    link: "/personal images/personal4.jpg",
    alt: "Devin's orange cat, Mittens, leaning against a computer monitor display a code editor",
    width: 256,
    height: 256
  }
];

export default bioImages;
