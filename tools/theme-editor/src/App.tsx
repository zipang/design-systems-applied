import { IssuesPanel } from "@components/editor/IssuesPanel";
import { ThemeLibrary } from "@components/editor/ThemeLibrary";
import { TokenReference } from "@components/editor/TokenReference";
import { Toolbar } from "@components/editor/Toolbar";
import {
	ColorsSection,
	ComponentsSection,
	ShapesSection,
	SpacingSection,
	TypographySection
} from "@components/preview/Preview";
import { previewStylesheet } from "@lib/apply-preview";
import { clsx } from "@lib/clsx";
import { resolveVariables } from "@lib/contract";
import { useThemeStore } from "@lib/theme-store";
import type * as React from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import "./App.css";

const SECTIONS = [
	{ id: "typography", label: "Type" },
	{ id: "colors", label: "Color" },
	{ id: "spacing", label: "Spacing" },
	{ id: "shapes", label: "Shape" },
	{ id: "components", label: "Components" }
];

/**
 * The theme editor shell. Edits the Design System contract, previews it in a scoped
 * subtree (so the tool's chrome keeps its own tokens), and saves it through the API.
 */
export const App: React.FC = () => {
	const store = useThemeStore();
	const [active, setActive] = useState("typography");
	const [showReference, setShowReference] = useState(false);
	const previewCss = previewStylesheet(store.values);
	// The active nav dot tracks the edited theme's accent, so the one exception to the
	// scoped preview is this single variable on the nav.
	const navAccent = resolveVariables(store.values["--color-text-accent"] ?? "", store.values);

	// The scoped preview stylesheet is injected into <head>, never rendered inline.
	useLayoutEffect(() => {
		const elt = document.createElement("style");
		elt.dataset.dsPreviewStyle = "true";
		document.head.append(elt);
		return () => {
			elt.remove();
		};
	}, []);

	useEffect(() => {
		const elt = document.querySelector<HTMLStyleElement>("style[data-ds-preview-style]");
		if (elt) elt.textContent = previewCss;
	}, [previewCss]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]) setActive(visible[0].target.id);
			},
			{ threshold: 0.2 }
		);
		for (const section of SECTIONS) {
			const elt = document.getElementById(section.id);
			if (elt) observer.observe(elt);
		}
		return () => observer.disconnect();
	}, []);

	return (
		<div className="app">
			<Toolbar store={store} onShowReference={() => setShowReference(true)} />
			<nav
				className="app__nav"
				aria-label="Sections"
				style={navAccent ? { ["--color-text-accent" as string]: navAccent } : undefined}
			>
				{SECTIONS.map((section) => (
					<button
						key={section.id}
						type="button"
						className={clsx("app__nav-item", { "is-active": active === section.id })}
						onClick={() =>
							document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })
						}
					>
						<span className="app__nav-dot" aria-hidden="true" />
						<span className="app__nav-label">{section.label}</span>
					</button>
				))}
			</nav>
			<main className="app__content">
				<IssuesPanel issues={store.issues} onShowReference={() => setShowReference(true)} />
				<TypographySection
					values={store.values}
					update={store.update}
					typography={store.typography}
					updateTypography={store.updateTypography}
				/>
				<ColorsSection values={store.values} update={store.update} />
				<SpacingSection values={store.values} update={store.update} />
				<ShapesSection values={store.values} update={store.update} />
				<ComponentsSection values={store.values} update={store.update} />
			</main>
			<footer className="app__footer">
				<span>Click a swatch to edit · every value consumes a design token</span>
				<button
					type="button"
					className="app__top"
					onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
				>
					Back to top
				</button>
			</footer>
			{showReference ? (
				<TokenReference
					values={store.values}
					issues={store.issues}
					onClose={() => setShowReference(false)}
				/>
			) : null}
			{store.saveDialogOpen ? (
				<ThemeLibrary
					mode="save"
					themes={store.localThemes}
					currentThemeName={store.currentThemeName}
					defaultName={store.currentThemeName}
					onSave={store.saveAsLocal}
					onLoad={store.loadLocal}
					onDelete={store.removeLocal}
					onClose={store.closeSaveDialog}
				/>
			) : null}
			{store.loadDialogOpen ? (
				<ThemeLibrary
					mode="load"
					themes={store.localThemes}
					currentThemeName={store.currentThemeName}
					defaultName={store.currentThemeName}
					onSave={store.saveAsLocal}
					onLoad={store.loadLocal}
					onDelete={store.removeLocal}
					onClose={store.closeLoadDialog}
				/>
			) : null}
		</div>
	);
};
