export type BuilderContext={userId:string;role:string;workspaceId?:string};
export type BuilderArtifact={id:string;kind:string;name:string;status:"DRAFT"|"APPROVED"|"GENERATED"|"FAILED";content:unknown;createdAt:string};
export type BuilderFinding={id:string;severity:"LOW"|"MEDIUM"|"HIGH"|"CRITICAL";category:string;file?:string;message:string;evidence?:string};
