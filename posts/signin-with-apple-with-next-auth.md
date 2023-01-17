---
title: Setup Sign In with Apple with the Next Auth Provider
description: Lorem ipsum, dolor sit amet consectetur adipisicing elit. Neque libero debitis maiores fugit pariatur molestiae totam, eveniet velit natus fuga minima enim quia distinctio temporibus reiciendis incidunt dolorem iure nemo?
postedAt: 2023-01-14
updatedAt: 2023-01-15
category: Development
---


### What is Apple's Deal?

Lorem ipsum, dolor sit amet consectetur adipisicing elit. Neque libero debitis maiores fugit pariatur molestiae totam, eveniet velit natus fuga minima enim quia distinctio temporibus reiciendis incidunt dolorem iure nemo?

### Service ID Setup

Lorem ipsum, dolor sit amet consectetur adipisicing elit. Neque libero debitis maiores fugit pariatur molestiae totam, eveniet velit natus fuga minima enim quia distinctio temporibus reiciendis incidunt dolorem iure nemo?

### Callbacks, Domains, Oh my!

Lorem ipsum, dolor sit amet consectetur adipisicing elit. Neque libero debitis maiores fugit pariatur molestiae totam, eveniet velit natus fuga minima enim quia distinctio temporibus reiciendis incidunt dolorem iure nemo?

### Hello World

```js
const generateAppleSecret = () =>
  jwt.sign(
    {
      iat: new Date().getTime() / 1000,
    },
    `${env.APPLE_PRIVATE_KEY}`,
    {
      audience: "https://appleid.apple.com",
      issuer: env.APPLE_TEAM_ID,
      expiresIn: env.NODE_ENV === "development" ? "24h" : "2h",
      header: {
        alg: "ES256",
        kid: env.APPLE_KEY_ID,
      },
      subject: env.APPLE_SERVICE_ID,
    }
  );
```

I love Sign In with Apple... should I? Probably not...