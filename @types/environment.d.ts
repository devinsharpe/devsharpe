declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: "development" | "production" | "test";
      readonly PUBLIC_URL: string;
      readonly EMAIL_ADDRESS: string;
      readonly EMAIL_HOST: string;
      readonly EMAIL_PORT: string;
      readonly EMAIL_USER: string;
      readonly EMAIL_PASSWORD: string;
    }
  }
}

export {};
