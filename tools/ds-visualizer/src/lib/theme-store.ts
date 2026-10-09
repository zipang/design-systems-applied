import { useCallback, useMemo, useState } from "react";
import { mergeValues, parseContract, serializeDesignMd, serializeTokensCss } from "./contract";
import { DEFAULT_DESIGN_MD, DEFAULT_TOKENS_CSS } from "./default-theme";
import type { TokenValues } from "./design-system";
import { type Issue, validateContract } from "./validate";

/** Async status of the theme store. */
export type ThemeStatus = "idle" | "loading" | "saving" | "saved" | "error";

/** State and actions the visualizer uses to edit and persist a project's contract. */
export interface ThemeStore {
	values: TokenValues;
	issues: Issue[];
	dir: string;
	status: ThemeStatus;
	message: string;
	dirty: boolean;
	setDir: (dir: string) => void;
	update: (variable: string, value: string) => void;
	reset: () => void;
	open: () => Promise<void>;
	save: () => Promise<void>;
	exportFiles: () => void;
}

const initialContract = parseContract(DEFAULT_DESIGN_MD, DEFAULT_TOKENS_CSS);
const initialValues = mergeValues(initialContract);

const download = (name: string, text: string): void => {
	const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = name;
	anchor.click();
	URL.revokeObjectURL(url);
};

const errorMessage = (error: unknown): string =>
	error instanceof Error ? error.message : "Unexpected error";

/**
 * The visualizer's state. Token values are the source of truth; both contract files
 * are serialized from them on every change, so the preview, validation, and save stay
 * in sync. The editor seeds from the tool's own Design System.
 */
export const useThemeStore = (): ThemeStore => {
	const [baseDesignMd, setBaseDesignMd] = useState(DEFAULT_DESIGN_MD);
	const [values, setValues] = useState<TokenValues>(initialValues);
	const [dir, setDir] = useState("");
	const [status, setStatus] = useState<ThemeStatus>("idle");
	const [message, setMessage] = useState("");
	const [dirty, setDirty] = useState(false);

	const tokensCss = useMemo(() => serializeTokensCss(values), [values]);
	const designMd = useMemo(() => serializeDesignMd(values, baseDesignMd), [values, baseDesignMd]);
	const issues = useMemo(
		() => validateContract(parseContract(designMd, tokensCss)),
		[designMd, tokensCss]
	);

	const update = useCallback((variable: string, value: string) => {
		setValues((prev) => ({ ...prev, [variable]: value }));
		setDirty(true);
		setStatus("idle");
	}, []);

	const reset = useCallback(() => {
		setBaseDesignMd(DEFAULT_DESIGN_MD);
		setValues(initialValues);
		setDirty(true);
		setStatus("idle");
		setMessage("Restored the visualizer's default Design System.");
	}, []);

	const open = useCallback(async () => {
		if (!dir) {
			setStatus("error");
			setMessage("Enter a project directory first.");
			return;
		}
		setStatus("loading");
		setMessage("");
		try {
			const response = await fetch(`/api/theme?dir=${encodeURIComponent(dir)}`);
			const data = (await response.json()) as {
				message?: string;
				designMd?: string;
				tokensCss?: string;
			};
			if (!response.ok || !data.designMd || !data.tokensCss) {
				throw new Error(data.message ?? "Failed to open the project");
			}
			const contract = parseContract(data.designMd, data.tokensCss);
			setBaseDesignMd(data.designMd);
			setValues(mergeValues(contract));
			setDirty(false);
			setStatus("saved");
			setMessage(`Opened ${dir}`);
		} catch (error) {
			setStatus("error");
			setMessage(errorMessage(error));
		}
	}, [dir]);

	const save = useCallback(async () => {
		if (!dir) {
			setStatus("error");
			setMessage("Enter a project directory first.");
			return;
		}
		if (issues.some((issue) => issue.level === "error")) {
			setStatus("error");
			setMessage("Fix the validation errors before saving.");
			return;
		}
		setStatus("saving");
		setMessage("");
		try {
			const response = await fetch("/api/theme", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ dir, designMd, tokensCss })
			});
			const data = (await response.json()) as { message?: string };
			if (!response.ok) throw new Error(data.message ?? "Failed to save the project");
			setBaseDesignMd(designMd);
			setDirty(false);
			setStatus("saved");
			setMessage(`Saved to ${dir}`);
		} catch (error) {
			setStatus("error");
			setMessage(errorMessage(error));
		}
	}, [dir, designMd, tokensCss, issues]);

	const exportFiles = useCallback(() => {
		download("DESIGN.md", designMd);
		download("design-tokens.css", tokensCss);
	}, [designMd, tokensCss]);

	return {
		values,
		issues,
		dir,
		status,
		message,
		dirty,
		setDir,
		update,
		reset,
		open,
		save,
		exportFiles
	};
};
