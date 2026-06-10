/**
 * Smoke render gate — mounts every bpm.* export with minimal props.
 * Any thrown exception = FAIL (names the offending component).
 */
import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, it } from "vitest";
import { bpm } from "../src/bpm";
import { FIXTURES } from "./fixtures";

afterEach(cleanup);

type BpmKey = keyof typeof bpm;

describe("bpm smoke render", () => {
  const keys = Object.keys(bpm) as BpmKey[];

  it(`covers all ${keys.length} bpm keys with fixtures`, () => {
    const missing = keys.filter((k) => !(k in FIXTURES));
    if (missing.length > 0) {
      throw new Error(
        `Missing fixtures for: ${missing.join(", ")}\n` +
          "Add minimal props to packages/core/gate/fixtures.ts"
      );
    }
  });

  for (const key of keys) {
    it(`bpm.${key} renders without throw`, () => {
      const fn = bpm[key] as (props: Record<string, unknown>) => React.ReactElement;
      const props = (FIXTURES[key] ?? {}) as Record<string, unknown>;
      const element = fn(props);
      render(element);
    });
  }
});
