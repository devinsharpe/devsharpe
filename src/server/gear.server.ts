import { Camera, DailySoftware, Hardware } from "~/types/gear.types";
import { db } from "./database/index.server";
import {
  HardwareItem,
  hardwareItem,
  SoftwareItem,
  softwareItem,
} from "./database/schema.server";

const seedCameras: Array<Camera> = [
  {
    id: "canonet",
    name: "Canon Canonet QL 17 GIII",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates harum adipisci porro quasi repudiandae dolor amet, dicta debitis provident qui iusto ut eum. Ipsam tenetur repellendus similique fuga, beatae itaque!",
  },
  {
    id: "iphone",
    name: "Apple iPhone 16 Pro",
    subtitle: "+ Moment Camera App",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates harum adipisci porro quasi repudiandae dolor amet, dicta debitis provident qui iusto ut eum. Ipsam tenetur repellendus similique fuga, beatae itaque!",
  },
  {
    id: "snapic",
    name: "Kodak Snapic A1",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates harum adipisci porro quasi repudiandae dolor amet, dicta debitis provident qui iusto ut eum. Ipsam tenetur repellendus similique fuga, beatae itaque!",
  },
  {
    id: "ektar",
    name: "Kodak Ektar H35N",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates harum adipisci porro quasi repudiandae dolor amet, dicta debitis provident qui iusto ut eum. Ipsam tenetur repellendus similique fuga, beatae itaque!",
  },
  {
    id: "charmera",
    name: "Kodak Charmera",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates harum adipisci porro quasi repudiandae dolor amet, dicta debitis provident qui iusto ut eum. Ipsam tenetur repellendus similique fuga, beatae itaque!",
  },
];

const seedDailySoftware: Array<DailySoftware> = [
  {
    tool: "Editor",
    name: "Zed",
    link: "https://zed.dev",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates harum adipisci porro quasi repudiandae dolor amet, dicta debitis provident qui iusto ut eum. Ipsam tenetur repellendus similique fuga, beatae itaque!",
  },
  {
    tool: "Terminal Emulator",
    name: "Ghostty",
    link: "https://ghostty.org",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates harum adipisci porro quasi repudiandae dolor amet, dicta debitis provident qui iusto ut eum. Ipsam tenetur repellendus similique fuga, beatae itaque!",
  },
  {
    tool: "Web Browser",
    name: "Helium",
    link: "https://helium.computer",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates harum adipisci porro quasi repudiandae dolor amet, dicta debitis provident qui iusto ut eum. Ipsam tenetur repellendus similique fuga, beatae itaque!",
  },
  {
    tool: "AI Assistance",
    name: "Claude + Claude Code",
    link: "https://claude.ai",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates harum adipisci porro quasi repudiandae dolor amet, dicta debitis provident qui iusto ut eum. Ipsam tenetur repellendus similique fuga, beatae itaque!",
    disclosure_link: "/ai",
  },
  {
    tool: "Note Taking + Knowledge Base",
    name: "Octarine",
    link: "https://octarine.app",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates harum adipisci porro quasi repudiandae dolor amet, dicta debitis provident qui iusto ut eum. Ipsam tenetur repellendus similique fuga, beatae itaque!",
  },
  {
    tool: "Email Client",
    name: "Apple Mail",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates harum adipisci porro quasi repudiandae dolor amet, dicta debitis provident qui iusto ut eum. Ipsam tenetur repellendus similique fuga, beatae itaque!",
  },
  {
    tool: "OS Search",
    name: "Raycast",
    link: "https://www.raycast.com",
    description:
      "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates harum adipisci porro quasi repudiandae dolor amet, dicta debitis provident qui iusto ut eum. Ipsam tenetur repellendus similique fuga, beatae itaque!",
  },
];

const seedHardware: Array<Hardware> = [
  {
    label: "Primary Computer",
    name: "13-inch MacBook Pro with M1",
  },
  {
    label: "Secondary Computer",
    name: "14-inch MacBook Pro with M2 Pro",
  },
  {
    label: "Monitor",
    name: "Dell 27-inch QHD Monitor (75Hz)",
  },
  {
    label: "Keyboard",
    name: "Logitech MX Mechnical Keys Mini",
  },
  {
    label: "Mouse",
    name: "Logitech MX Master 3S",
  },
  {
    label: "Microphone",
    name: "FIFINE AmpliTank K688 Dynamic Microphone",
  },
  {
    label: "Video",
    name: "Logitech Brio 100",
  },
  {
    label: "KVM",
    name: "MINIX K1 USB C Switch",
  },
];

export async function fetchCameras(): Promise<Array<Camera>> {
  return seedCameras;
}

export async function fetchDailySoftware(): Promise<Array<SoftwareItem>> {
  return await db.select().from(softwareItem);
}

export async function fetchHardware(): Promise<Array<HardwareItem>> {
  return await db.select().from(hardwareItem);
}
