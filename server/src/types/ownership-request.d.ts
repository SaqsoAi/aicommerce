import type { OwnershipDecision } from "../modules/ownership/ownership.types";

declare global {
  namespace Express {
    interface Request {
      ownership?: OwnershipDecision;
    }
  }
}

export {};