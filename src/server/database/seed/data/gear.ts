import type { CameraSeed, HardwareSeed, SoftwareSeed } from "../types";

// /uses, each list in display order.

export const hardware: HardwareSeed[] = [
  {
    id: "apple-macbook-pro-m3-pro-14-inch",
    name: "Apple MacBook Pro - M3 Pro - 14 Inch (Silver)",
    purpose: "Primary Computer",
  },
  {
    id: "apple-macbook-pro-m1-13-inch",
    name: "Apple MacBook Pro - M1 - 13 Inch",
    purpose: "Secondary Computer",
  },
  {
    id: "remarkable-paper-pro-type-folio-case",
    name: "Remarkable Paper Pro + Type Folio Case",
    purpose: "Tablet",
  },
  { id: "boox-picco", name: "Boox Picco", purpose: "Ereader" },
  {
    id: "logitech-mx-mechanical-mini",
    name: "Logitech MX Mechanical Mini",
    purpose: "Keyboard",
  },
  {
    id: "logitech-mx-master-3s",
    name: "Logitech MX Master 3S",
    purpose: "Mouse",
  },
];

export const software: SoftwareSeed[] = [
  {
    id: "zed",
    name: "Zed",
    purpose: "Code Editor",
    description:
      "My everyday editor. It's fast, native, and written in Rust, with collaboration built in instead of bolted on.",
    link: "https://zed.dev/",
  },
  {
    id: "delta",
    name: "Delta",
    purpose: "AI Code Assistant Harness",
    description:
      "Where I work with AI coding agents. Each thread keeps the conversation and the edits together, and I can pull someone in to review or work alongside the agent. It's from the team behind Zed, and parts of this site were built in Delta threads.",
    link: "https://delta.dev/",
  },
  {
    id: "ghostty",
    name: "Ghostty",
    purpose: "Terminal Emulator",
    description:
      "My terminal. It's fast, GPU-accelerated, native on macOS, and open source, with good enough defaults that there's very little to configure.",
    link: "https://ghostty.org/",
  },
  {
    id: "octarine",
    name: "Octarine",
    purpose: "Knowledge Base",
    description:
      "Where my notes, writing, and project to-dos live. It's private and local-first: everything is plain Markdown files in a folder I choose, and the AI features are optional (thank god).",
    link: "https://octarine.app/",
  },
  {
    id: "ardia",
    name: "Ardia",
    purpose: "Web Browser",
    description:
      "My browser: a sidebar browser for Mac built on Chromium, with an Arc-style sidebar, uBlock Origin built in, and no paid tier. It also comes with a command-line tool, so coding agents like Claude Code can drive it.",
    link: "https://ardia.dev/",
  },
  {
    id: "hyprmac",
    name: "HyprMac",
    purpose: "Window Tiling Manager",
    description:
      'Hyprland-style tiling for macOS. Windows tile themselves as they open, Caps Lock (although I also linked the fn key as well) becomes a "hypr" key for 60+ remappable shortcuts, and there are ten workspaces to spread out across. Free and open source.',
    link: "https://hyprmac.app/",
  },
];

export const cameras: CameraSeed[] = [
  {
    id: "canon-canonet-ql17-giii",
    name: "Canon Canonet QL17 GIII",
    purpose: "My Prized Rangefinder",
    description:
      'A compact 1970s rangefinder with a fast 40mm f/1.7 lens. Shutter-priority auto exposure handles the metering, the rangefinder patch makes focusing precise, and the leaf shutter is quiet. "QL" stands for Quick Loading, which makes threading a fresh roll so so easy.',
  },
  {
    id: "apple-iphone-16-pro",
    name: "Apple iPhone 16 Pro",
    purpose: "Always in My Pocket",
    shortDescription: "+ Moment Camera App",
    description:
      "The camera that's always on me. Its 48MP main and ultra-wide cameras and 5x telephoto cover nearly everything, and Moment's app gives me manual control over shutter speed, ISO, focus, and white balance, with focus peaking and zebras. I actually LOVE the camera control button unlike some reviewers.",
  },
  {
    id: "kodak-snapic-a1",
    name: "Kodak Snapic A1",
    purpose: "EDC Point n' Shoot",
    description:
      "My everyday-carry film camera: a pocketable, full-frame 35mm point-and-shoot with a glass 25mm f/9.5 lens, two-zone focus, a built-in flash, and double exposures when I have some courage. Simple enough to pull out and shoot without thinking.",
  },
  {
    id: "kodak-ektar-h35n",
    name: "Kodak Ektar H35N",
    purpose: "Simple + Half Frame",
    description:
      "A half-frame camera, so every 36-exposure roll becomes 72 photos. It has a 22mm f/8 lens with a glass element, a fixed 1/100s shutter, a built-in flash, and a couple of tricks: a star filter that turns lights into four-point flares, and a bulb mode... huh... I never thought about the fact that it has bulb mode, that's interesting.",
  },
  {
    id: "kodak-charmera",
    name: "Kodak Charmera",
    purpose: "1.6MP Digital Glory",
    description:
      "A keychain-sized digital camera that comes in a blind box. It shoots 1.6MP photos and video to a microSD card, and the low resolution is the point: everything comes out with that early-2000s digicam look.",
  },
];
