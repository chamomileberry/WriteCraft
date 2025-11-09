/**
 * Environment helpers for server-side code.
 *
 * Provides typed helpers and attaches them to globalThis so they can be used
 * across the server codebase without requiring imports during the codemod
 * migration. Prefer `getEnv` for required variables and `getEnvOptional` when
 * a missing value is acceptable.
 */

export class EnvError extends Error {}

export function getEnv(key: string): string {
  const v = process.env[key];
  if (v === undefined) throw new EnvError(`Missing env var ${key}`);
  return v;
}

export function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}

export function getEnvNumber(key: string, opts?: { default?: number }): number {
  const raw = process.env[key];
  if (raw === undefined || raw === "") {
    if (opts?.default !== undefined) return opts.default;
    throw new EnvError(`Missing env var ${key}`);
  }
  const n = Number(raw);
  if (Number.isNaN(n)) throw new EnvError(`Invalid number for ${key}: ${raw}`);
  return n;
}

export function getEnvBool(key: string, opts?: { default?: boolean }): boolean {
  const raw = process.env[key];
  if (raw === undefined) {
    if (opts?.default !== undefined) return opts.default;
    throw new EnvError(`Missing env var ${key}`);
  }
  return ["1", "true", "yes"].includes(raw.toLowerCase());
}

// Attach to globalThis to make the helper available without imports during a
// repository-wide codemod. This is temporary — callers should import from
// './utils/env' eventually.
;(globalThis as any).getEnv = getEnv;
;(globalThis as any).getEnvOptional = getEnvOptional;
;(globalThis as any).getEnvNumber = getEnvNumber;
;(globalThis as any).getEnvBool = getEnvBool;

export default {
  getEnv,
  getEnvOptional,
  getEnvNumber,
  getEnvBool,
};
