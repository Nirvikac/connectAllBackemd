// src/types/express.d.ts

export {}; // IMPORTANT (makes it a module)

declare global {
  namespace Express {
    interface Locals {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}
