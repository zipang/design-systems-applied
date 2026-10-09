import { Text } from "@components/base/Text";
import { Button } from "@components/ui/Button";
import { Dialog, DialogContent } from "@components/ui/Dialog";
import { TextField } from "@components/ui/TextField";
import type { LocalThemeSummary } from "@lib/local-themes";
import type * as React from "react";
import { useState } from "react";
import "./ThemeLibrary.css";

interface ThemeLibraryProps {
	mode: "save" | "load";
	themes: LocalThemeSummary[];
	currentThemeName: string;
	defaultName: string;
	onSave: (name: string) => void;
	onLoad: (name: string) => void;
	onDelete: (name: string) => void;
	onClose: () => void;
}

const formatSavedAt = (value: number): string =>
	value ? new Date(value).toLocaleString() : "unknown time";

/**
 * Modal for the browser-local theme library. In `save` mode it asks for a name; in
 * `load` mode it lists the saved themes and offers to load or delete one.
 */
export const ThemeLibrary: React.FC<ThemeLibraryProps> = ({
	mode,
	themes,
	currentThemeName,
	defaultName,
	onSave,
	onLoad,
	onDelete,
	onClose
}) => {
	const [name, setName] = useState(defaultName);

	const submit = (event: React.FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		onSave(name);
	};

	return (
		<Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
			<DialogContent
				className="editor-theme-library"
				title={mode === "save" ? "Save theme" : "Open a saved theme"}
				description={
					mode === "save"
						? "Store this theme in your browser, under a name."
						: "Themes stored in this browser."
				}
			>
				{mode === "save" ? (
					<form className="editor-theme-library__form" onSubmit={submit}>
						<TextField
							id="theme-editor-name"
							label="Theme name"
							value={name}
							onChange={setName}
							placeholder="My Theme"
						/>
						<div className="editor-theme-library__actions">
							<Button label="Save" type="submit" size="sm" variant="primary" />
							<Button label="Cancel" size="sm" variant="ghost" onClick={onClose} />
						</div>
					</form>
				) : themes.length === 0 ? (
					<Text size="md" tone="muted">
						No saved themes yet. Edit the theme, then use Save to store one in this browser.
					</Text>
				) : (
					<ul className="editor-theme-library__list">
						{themes.map((theme) => (
							<li key={theme.name} className="editor-theme-library__item">
								<div className="editor-theme-library__info">
									<span className="editor-theme-library__name">{theme.name}</span>
									<span className="editor-theme-library__meta">
										{theme.name === currentThemeName ? "current · " : ""}
										{formatSavedAt(theme.savedAt)}
									</span>
								</div>
								<Button
									label="Load"
									size="sm"
									variant="secondary"
									onClick={() => onLoad(theme.name)}
								/>
								<Button
									label="Delete"
									size="sm"
									variant="ghost"
									onClick={() => onDelete(theme.name)}
								/>
							</li>
						))}
					</ul>
				)}
			</DialogContent>
		</Dialog>
	);
};
