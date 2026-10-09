import { realpath } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import { type Contract, parseContract } from "./contract";
import { type Issue, validateContract } from "./validate";

/** The two filenames the API is allowed to read and write. */
export const DESIGN_FILE = "DESIGN.md";
export const TOKENS_FILE = "design-tokens.css";

/** The raw text of a project's Design System contract. */
export interface ThemePayload {
	designMd: string;
	tokensCss: string;
}

/** A loaded theme: its directory, raw text, parsed contract, and validation issues. */
export interface ThemeReadResult extends ThemePayload {
	dir: string;
	contract: Contract;
	issues: Issue[];
}

/** Raised when a save is rejected, either for path safety or validation errors. */
export class ThemeApiError extends Error {
	readonly status: number;
	readonly issues: Issue[];

	constructor(message: string, status = 400, issues: Issue[] = []) {
		super(message);
		this.name = "ThemeApiError";
		this.status = status;
		this.issues = issues;
	}
}

/** Reject filenames that are not one of the two contract files. */
const assertFixedName = (name: string): void => {
	if (name !== DESIGN_FILE && name !== TOKENS_FILE) {
		throw new ThemeApiError(`Refusing to access "${name}"`, 400);
	}
};

/**
 * Resolve a contract file inside a project directory, rejecting traversal and symlink
 * escapes. The directory must exist; the file may not (it is created on save).
 */
export const safeThemePath = async (dir: string, name: string): Promise<string> => {
	assertFixedName(name);
	if (!isAbsolute(dir)) throw new ThemeApiError("Project directory must be absolute", 400);

	const base = resolve(dir);
	let realBase: string;
	try {
		realBase = await realpath(base);
	} catch {
		throw new ThemeApiError(`Project directory not found: ${dir}`, 404);
	}
	const target = join(realBase, name);

	try {
		const real = await realpath(target);
		if (real !== target) throw new ThemeApiError(`${name} escapes the project directory`, 403);
		return target;
	} catch (error) {
		if (error instanceof ThemeApiError) throw error;
		return target;
	}
};

/** Read and parse both halves of a project's contract. */
export const readTheme = async (dir: string): Promise<ThemeReadResult> => {
	const designPath = await safeThemePath(dir, DESIGN_FILE);
	const tokensPath = await safeThemePath(dir, TOKENS_FILE);
	const [designMd, tokensCss] = await Promise.all([
		Bun.file(designPath).text(),
		Bun.file(tokensPath).text()
	]);
	const contract = parseContract(designMd, tokensCss);
	const issues = validateContract(contract);
	return { dir, designMd, tokensCss, contract, issues };
};

/** Validate a payload and return its issues without touching disk. */
export const checkTheme = (payload: ThemePayload): Issue[] => {
	const contract = parseContract(payload.designMd, payload.tokensCss);
	return validateContract(contract);
};

/** Validate then write both contract files. Refuses to write an invalid contract. */
export const saveTheme = async (dir: string, payload: ThemePayload): Promise<Issue[]> => {
	const issues = checkTheme(payload);
	if (issues.some((issue) => issue.level === "error")) {
		throw new ThemeApiError("The contract has validation errors", 422, issues);
	}
	const designPath = await safeThemePath(dir, DESIGN_FILE);
	const tokensPath = await safeThemePath(dir, TOKENS_FILE);
	await Promise.all([
		Bun.write(designPath, payload.designMd),
		Bun.write(tokensPath, payload.tokensCss)
	]);
	return issues;
};
