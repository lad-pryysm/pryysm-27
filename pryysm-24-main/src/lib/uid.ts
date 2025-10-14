
"use client";

// A simple utility for generating unique IDs with a given prefix.
export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`;
}
