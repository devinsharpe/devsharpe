### What it was

Birb was a small social app built around one question: what happens to a feed when nobody has to perform for it? You could share up to three thoughts and one photo a day with friends, and posts left the feed after a week. Its tagline was "Share your authentic self in a healthier way."

### The idea

Modern social media rewards an idealized version of yourself, and the pressure builds the more you post and the longer posts stick around. Birb pushed back on that in a few deliberate ways:

- **Limits**: three text posts and one photo in any 24 hours, so every post meant something.
- **A short memory**: the feed only showed the last week. You didn't have to worry about how a post would read a month, six months, or a year later.
- **Fewer numbers**: the metrics were kept to a minimum. The point was keeping friends updated and celebrating each other, not collecting data.

### How it worked

- **Posting**: text posts of up to 300 characters, and one photo a day with alt text. The composer showed how many posts you had left.
- **The feed**: in time order, from people you follow, covering the last seven days. No ranking.
- **Following**: following someone took their approval. Requests could be accepted or denied, and you could remove followers or block people.
- **Photo reactions**: reactions were pictures. You saved a photo for each of ten emoji reactions, and reacting to a post attached yours.
- **Conversation**: comments with likes, and @mentions that notified people you were connected with.
- **Finding people**: search over names and handles, using Postgres full-text search.
- **Signing in**: with Apple, Google, or a magic link sent by email.

### How it was built

Birb was a monorepo of three Next.js apps:

- **The app**: Next.js, tRPC, NextAuth, React Query, Jotai, and Tailwind CSS on Postgres, with photo uploads to S3.
- **Moderation**: a separate service that checked posts and comments with TensorFlow.js's toxicity model, flagging insults, obscenity, threats, sexually explicit content, and general toxicity. It worked through a queue in its own Postgres database and sent results back to the app, which approved or rejected posts automatically. The data model also left room for manual review and appeals.
- **Email**: sign-in emails built with React Email and sent through Nodemailer.

Birb was also a playground for Vercel's Edge runtime. Sign-in ran at the edge, and the last big change moved the app from Prisma to Drizzle ORM on Neon's serverless Postgres driver, which can be used from the edge. Along the way I wrote a full-text search column type for Drizzle, which didn't have one yet.

### Where it ended

I worked on Birb from late 2022 to mid-2023, and it's retired now. The code is still on [GitHub](https://github.com/devinsharpe/Birb-Simple-Social).
