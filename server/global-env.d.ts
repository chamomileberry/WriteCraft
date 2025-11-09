declare namespace NodeJS {
  interface Global {
    getEnv?: (key: string) => string;
    getEnvOptional?: (key: string) => string | undefined;
    getEnvNumber?: (key: string, opts?: { default?: number }) => number;
    getEnvBool?: (key: string, opts?: { default?: boolean }) => boolean;
  }
}

declare function getEnv(key: string): string;
declare function getEnvOptional(key: string): string | undefined;
declare function getEnvNumber(key: string, opts?: { default?: number }): number;
declare function getEnvBool(key: string, opts?: { default?: boolean }): boolean;

// This is an ambient declaration file for global helpers defined in server/utils/env.ts.
// Do NOT export anything here — keep it ambient so the functions are available project-wide.
