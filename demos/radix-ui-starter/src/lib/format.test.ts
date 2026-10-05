import { expect, test } from "bun:test";
import { formatBytes } from "./format";

test("formats bytes", () => {
	expect(formatBytes(512)).toBe("512 B");
});

test("formats kilobytes", () => {
	expect(formatBytes(2048)).toBe("2 KB");
});

test("formats megabytes", () => {
	expect(formatBytes(1024 * 1024 * 3.5)).toBe("3.5 MB");
});
