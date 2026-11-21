### What it is

DevSharpe.io is my corner of the internet: a portfolio, a place to write, and a home for my photography. It started in 2021 as a way to show my work, help other developers, and experiment with new designs and packages, and it's still all three.

### What's on the site

- [**Musings**](/posts): posts on whatever's on my mind, tagged by topic, with an [RSS feed](/rss.xml).
- [**Project**](/projects): the things I'm building, each with an optional write-up like this one.
- [**Photography**](/photography): collections of photos with short write-ups, and a page for every photo.
- [**Uses**](/uses): the hardware, software, and cameras I use every day. Each camera links to the photos taken with it.
- [**Employment**](/employment): my work and volunteer history, with my résumé as a [PDF](/resume.pdf) or as [Markdown](/resume.md) generated from that same history.
- [**Links**](/links): a link-in-bio page.
- [**Contact**](/contact): a way to reach me, protected by Cloudflare Turnstile.

### Behind the scenes

Instead of a CMS, everything here is written and managed from an admin dashboard I built alongside the site.

- **Writing**: a rich-text editor for posts, project pages, collection write-ups, and my biography. Drafts are saved separately from what's published, so changes stay private until I publish them. The biography keeps every version, so an older one can be restored.
- **Media**: images upload straight from the browser to storage, get alt text, captions, locations, tags, and cameras, and are resized and cropped on the fly. Before an image is deleted, the library shows everywhere it's used.
- **Ordering**: work history, projects, gear, and links are drag-to-reorder lists.
- **Inbox**: contact requests land on the dashboard to read and follow up on.
- **Numbers**: photo collections and photos count their views, and the links page counts clicks. Both skip my own visits.

### How it's built

- [TanStack Start](https://tanstack.com/start), React, and TypeScript, styled with Tailwind CSS.
- Postgres with Drizzle ORM, and Zod validation shared by the forms and the server.
- S3-compatible storage, with images served through imgproxy.
- Sign-in through Better Auth, leaning on DQC's sign-in service.
- Analytics through the collective's self-hosted Plausible instance.
- Locally, everything runs in Docker Compose, and the code lives within DQC's Gitea instance.

### What's next

Comments on posts, and a home for zines next to the photo collections.
