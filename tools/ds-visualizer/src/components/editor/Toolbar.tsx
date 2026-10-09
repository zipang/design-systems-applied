import { Button } from "@components/ui/Button";
import type { ThemeStore } from "@lib/theme-store";
import type * as React from "react";
import "./Toolbar.css";

export interface ToolbarProps {
	store: ThemeStore;
	onShowReference: () => void;
}

/** Top bar: project directory, open/save/export/reset, and the token reference. */
export const Toolbar: React.FC<ToolbarProps> = ({ store, onShowReference }) => {
	const errors = store.issues.filter((issue) => issue.level === "error").length;

	return (
		<header className="editor-toolbar">
			<div className="editor-toolbar__brand">
				<span className="editor-toolbar__mark">DS·VISUALIZER</span>
				<span className="editor-toolbar__status" data-status={store.status}>
					{errors > 0
						? `${errors} error${errors === 1 ? "" : "s"}`
						: store.dirty
							? "unsaved changes"
							: store.status}
				</span>
			</div>
			<div className="editor-toolbar__actions">
				<input
					className="editor-toolbar__dir"
					type="text"
					aria-label="Project directory"
					placeholder="/path/to/project"
					value={store.dir}
					spellCheck={false}
					onChange={(event) => store.setDir(event.currentTarget.value)}
				/>
				<Button
					label="Open"
					size="sm"
					variant="secondary"
					icon="file"
					onClick={() => void store.open()}
				/>
				<Button label="Save" size="sm" variant="primary" onClick={() => void store.save()} />
				<Button label="Export" size="sm" variant="ghost" onClick={store.exportFiles} />
				<Button label="Reset" size="sm" variant="ghost" icon="reset" onClick={store.reset} />
				<Button label="Reference" size="sm" variant="ghost" onClick={onShowReference} />
			</div>
		</header>
	);
};
