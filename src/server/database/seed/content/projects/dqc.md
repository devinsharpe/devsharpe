### What it is

[dqc.dev](https://dqc.dev) is the website for the Digital Queer Collective (DQC), a community of 2SLGBTQIA+ technologists and policy strategists dedicated to creating software that celebrates inclusivity, creativity, and user diversity. I co-founded the collective, and I build and maintain its site.

### Why it exists

My co-founder and I started our queer-advocacy work as volunteers with the [Trans Formations Project](https://transformationsproject.org) (TFP), which tracked anti-trans legislation across the United States. TFP closed in September 2025 out of concern for its members' safety, and DQC grew out of wanting to carry that work forward.

DQC treats technology as political infrastructure. The collective builds digital systems that resist surveillance, extraction, and exclusion, and works to expand autonomy and civic participation for 2SLGBTQIA+ and BIPOC communities. The site is where that work starts in public.

### What's on the site

- The collective's mission, values, and team.
- Posts, plus the collective's AI, ethics, and positionality statements.
- Projects, starting with the Trans Formations Data Archive.
- A contact form with an opt-in newsletter sign-up.
- Ways to follow and support the collective, on Bluesky and Ko-fi.

### How it's built

- TanStack Start, React, and TypeScript, styled with Tailwind CSS and Base UI components.
- Posts and statements are Markdown files, with their details checked by Zod.
- Contact requests pass a Cloudflare Turnstile check and are stored in Postgres through Drizzle ORM. People who opt in are added to the newsletter list in Resend.
- It runs on the collective's own infrastructure. The code lives on Gitea, and Gitea Actions builds Docker images for both Intel and ARM servers and stores them in Gitea's package registry. Dokploy deploys them, with health checks.
- Analytics come from the collective's self-hosted Plausible instance.

### What's next

- **The Trans Formations Data Archive**: publishing TFP's database of anti-trans and trans-affirming legislation across all 50 states, elected officials' voting records, and TFP's newsletters.
- **A monorepo**: shared database setup and a shared UI library for the collective's apps.
- **Checks before deploys**: type checks, builds, and tests run in CI before each deploy.
