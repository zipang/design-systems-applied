import { Box } from "@components/base/Box";
import { Heading } from "@components/base/Heading";
import { Text } from "@components/base/Text";
import { CogPanel, ColorField, NumberField, TextInput } from "@components/editor/Fields";
import { Button } from "@components/ui/Button";
import { TextField } from "@components/ui/TextField";
import { resolveVariables } from "@lib/contract";
import { contrastLevel, contrastRatio, isLight } from "@lib/contrast";
import type { TokenValues } from "@lib/design-system";
import { formatRem, spacingScaleRem, typeScaleRem } from "@lib/scale";
import type * as React from "react";
import { useState } from "react";
import "./Preview.css";

/** Props shared by every preview section. */
export interface SectionProps {
	values: TokenValues;
	update: (variable: string, value: string) => void;
}

const read = (values: TokenValues, variable: string): string => values[variable] ?? "";
const px = (values: TokenValues, variable: string): number => {
	const raw = read(values, variable);
	const parsed = Number.parseFloat(raw);
	if (Number.isNaN(parsed)) return 0;
	return raw.endsWith("px") ? parsed : parsed * 16;
};
const resolved = (values: TokenValues, variable: string): string =>
	resolveVariables(read(values, variable), values);

interface SectionShellProps {
	id: string;
	index: string;
	title: string;
	controls?: React.ReactNode;
	children: React.ReactNode;
}

const SectionShell: React.FC<SectionShellProps> = ({ id, index, title, controls, children }) => (
	<section id={id} className="vz-section">
		<header className="vz-section__head">
			<span className="vz-section__index">{index}</span>
			<Heading level={2} size="lg" className="vz-section__title">
				{title}
			</Heading>
		</header>
		<div className="vz-section__body">
			<div className="vz-section__preview" data-ds-preview>
				{children}
			</div>
			{controls ? <aside className="vz-section__controls">{controls}</aside> : null}
		</div>
	</section>
);

const SIZE_STEPS = [
	{ variable: "--font-size-display", label: "display" },
	{ variable: "--font-size-2xl", label: "2xl" },
	{ variable: "--font-size-xl", label: "xl" },
	{ variable: "--font-size-lg", label: "lg" },
	{ variable: "--font-size-md", label: "md" },
	{ variable: "--font-size-sm", label: "sm" },
	{ variable: "--font-size-xs", label: "xs" }
];

const WEIGHT_STEPS = ["regular", "medium", "semibold", "bold", "extrabold"].map((name) => ({
	variable: `--font-weight-${name}`,
	label: name
}));

const LINE_HEIGHT_STEPS = ["tight", "normal", "relaxed"].map((name) => ({
	variable: `--line-height-${name}`,
	label: name
}));

const LETTER_SPACING_STEPS = ["tight", "normal", "wide"].map((name) => ({
	variable: `--letter-spacing-${name}`,
	label: name
}));

/** Typography: families, the fixed size scale, weights, line heights, letter spacing. */
export const TypographySection: React.FC<SectionProps> = ({ values, update }) => {
	const [ratio, setRatio] = useState(1.5);

	const generate = (): void => {
		const scale = typeScaleRem(ratio);
		for (const [name, value] of Object.entries(scale)) update(`--font-size-${name}`, value);
	};

	return (
		<SectionShell
			id="typography"
			index="01"
			title="Typography"
			controls={
				<>
					<CogPanel label="Type scale">
						<NumberField
							label="Geometric ratio"
							value={ratio}
							min={1.05}
							max={2}
							step={0.005}
							onChange={setRatio}
						/>
						<Button label="Generate scale" size="sm" variant="secondary" onClick={generate} />
						{SIZE_STEPS.map((step) => (
							<NumberField
								key={step.variable}
								label={step.label}
								suffix="px"
								value={Math.round(px(values, step.variable) * 1000) / 1000}
								onChange={(value) => update(step.variable, formatRem(value))}
							/>
						))}
					</CogPanel>
					<CogPanel label="Families">
						<TextInput
							label="Base"
							value={read(values, "--font-family-base")}
							onChange={(value) => update("--font-family-base", value)}
						/>
						<TextInput
							label="Display"
							value={read(values, "--font-family-display")}
							onChange={(value) => update("--font-family-display", value)}
						/>
						<TextInput
							label="Mono"
							value={read(values, "--font-family-mono")}
							onChange={(value) => update("--font-family-mono", value)}
						/>
					</CogPanel>
					<CogPanel label="Weights">
						{WEIGHT_STEPS.map((step) => (
							<NumberField
								key={step.variable}
								label={step.label}
								value={px(values, step.variable)}
								step={100}
								onChange={(value) => update(step.variable, String(value))}
							/>
						))}
					</CogPanel>
					<CogPanel label="Rhythm">
						{LINE_HEIGHT_STEPS.map((step) => (
							<NumberField
								key={step.variable}
								label={`line-height ${step.label}`}
								value={Number.parseFloat(read(values, step.variable)) || 0}
								step={0.05}
								onChange={(value) => update(step.variable, String(value))}
							/>
						))}
						{LETTER_SPACING_STEPS.map((step) => (
							<TextInput
								key={step.variable}
								label={`letter-spacing ${step.label}`}
								value={read(values, step.variable)}
								onChange={(value) => update(step.variable, value)}
							/>
						))}
					</CogPanel>
				</>
			}
		>
			<div className="vz-families">
				<span style={{ fontFamily: "var(--font-family-display)" }}>
					Display · The Architecture of Type
				</span>
				<span style={{ fontFamily: "var(--font-family-base)" }}>
					Base · The quick brown fox jumps over the lazy dog
				</span>
				<span style={{ fontFamily: "var(--font-family-mono)" }}>
					Mono · const scale = (base, ratio, step) =&gt; base * ratio ** step;
				</span>
			</div>
			<div className="vz-type-scale">
				{SIZE_STEPS.map((step) => (
					<div className="vz-type-row" key={step.variable}>
						<div className="vz-type-row__meta">
							<span>{step.label}</span>
							<code>{read(values, step.variable)}</code>
						</div>
						<div className="vz-type-row__sample" style={{ fontSize: `var(${step.variable})` }}>
							The Architecture of Type
						</div>
					</div>
				))}
			</div>
			<div className="vz-weights">
				{WEIGHT_STEPS.map((step) => (
					<div className="vz-weight" key={step.variable}>
						<span style={{ fontWeight: `var(${step.variable})` }}>Form follows function</span>
						<code>{read(values, step.variable)}</code>
					</div>
				))}
			</div>
		</SectionShell>
	);
};

const COLOR_GROUPS: { label: string; items: { label: string; variable: string }[] }[] = [
	{
		label: "Brand",
		items: ["accent", "primary", "secondary", "tertiary"].map((name) => ({
			label: name,
			variable: `--color-brand-${name}`
		}))
	},
	{
		label: "Action",
		items: ["success", "info", "warning", "danger"].map((name) => ({
			label: name,
			variable: `--color-action-${name}`
		}))
	},
	{
		label: "Text",
		items: [
			{ label: "base", variable: "--color-text" },
			{ label: "accent", variable: "--color-text-accent" },
			{ label: "muted", variable: "--color-text-muted" },
			{ label: "ondark", variable: "--color-text-ondark" }
		]
	},
	{
		label: "Surface",
		items: [
			{ label: "base", variable: "--color-surface" },
			{ label: "alt", variable: "--color-surface-alt" },
			{ label: "dark", variable: "--color-surface-dark" },
			{ label: "card", variable: "--color-surface-card" }
		]
	}
];

const SURFACES = [
	{ label: "base", variable: "--color-surface", text: "--color-text" },
	{ label: "alt", variable: "--color-surface-alt", text: "--color-text" },
	{ label: "dark", variable: "--color-surface-dark", text: "--color-text-ondark" },
	{ label: "card", variable: "--color-surface-card", text: "--color-text" }
];

const VARIANT_TOKENS = [
	...["accent", "primary", "secondary", "tertiary"].map((name) => `--color-brand-${name}`),
	...["success", "info", "warning", "danger"].map((name) => `--color-action-${name}`)
];

/** Colors: editable palette groups, usage surfaces with contrast, derived variants. */
export const ColorsSection: React.FC<SectionProps> = ({ values, update }) => (
	<SectionShell
		id="colors"
		index="02"
		title="Colors"
		controls={COLOR_GROUPS.map((group) => (
			<CogPanel key={group.label} label={group.label}>
				{group.items.map((item) => (
					<ColorField
						key={item.variable}
						label={item.label}
						token={item.variable}
						value={read(values, item.variable)}
						onChange={(value) => update(item.variable, value)}
					/>
				))}
			</CogPanel>
		))}
	>
		<div className="vz-palette">
			{COLOR_GROUPS.map((group) => (
				<div className="vz-palette__group" key={group.label}>
					<span className="vz-label">{group.label}</span>
					<div className="vz-swatches">
						{group.items.map((item) => (
							<div className="vz-swatch" key={item.variable}>
								<div className="vz-swatch__chip" style={{ background: `var(${item.variable})` }} />
								<span className="vz-swatch__name">{item.label}</span>
								<code className="vz-code">{read(values, item.variable)}</code>
							</div>
						))}
					</div>
				</div>
			))}
		</div>

		<span className="vz-label">Usage</span>
		<div className="vz-surfaces">
			{SURFACES.map((surface) => {
				const bg = resolved(values, surface.variable);
				const fg = resolved(values, surface.text);
				const ratio = contrastRatio(fg, bg);
				return (
					<div
						className="vz-surface"
						key={surface.variable}
						style={{ background: `var(${surface.variable})` }}
					>
						<div className="vz-surface__row">
							<span style={{ color: `var(${surface.text})` }}>
								{surface.label} — the quick brown fox
							</span>
							<span className="vz-contrast" data-level={contrastLevel(ratio)}>
								{ratio}:1
							</span>
						</div>
						<code className="vz-code">{surface.variable}</code>
					</div>
				);
			})}
		</div>

		<span className="vz-label">Derived variants</span>
		<div className="vz-swatches">
			{VARIANT_TOKENS.map((variable) => (
				<div className="vz-swatch" key={variable}>
					<div className="vz-swatch__chip" style={{ background: `var(${variable}-muted)` }} />
					<span className="vz-swatch__name">{variable.replace("--color-", "")}·muted</span>
					<div className="vz-swatch__chip" style={{ background: `var(${variable}-active)` }} />
					<span className="vz-swatch__name">·active</span>
				</div>
			))}
		</div>
	</SectionShell>
);

const SPACE_STEPS = ["xs", "sm", "md", "base", "lg", "xl", "xxl"].map((name) => ({
	variable: `--space-${name}`,
	label: name
}));

/** Spacing: the fixed scale as bars and squares, with a linear generator. */
export const SpacingSection: React.FC<SectionProps> = ({ values, update }) => {
	const [unit, setUnit] = useState(4);
	const max = Math.max(...SPACE_STEPS.map((step) => px(values, step.variable)), 1);

	const generate = (): void => {
		const scale = spacingScaleRem(unit);
		for (const [name, value] of Object.entries(scale)) update(`--space-${name}`, value);
	};

	return (
		<SectionShell
			id="spacing"
			index="03"
			title="Spacing"
			controls={
				<CogPanel label="Spacing scale">
					<NumberField
						label="Linear unit"
						suffix="px"
						value={unit}
						min={1}
						max={16}
						onChange={setUnit}
					/>
					<Button label="Generate scale" size="sm" variant="secondary" onClick={generate} />
					{SPACE_STEPS.map((step) => (
						<NumberField
							key={step.variable}
							label={step.label}
							suffix="px"
							value={Math.round(px(values, step.variable) * 1000) / 1000}
							onChange={(value) => update(step.variable, formatRem(value))}
						/>
					))}
				</CogPanel>
			}
		>
			<div className="vz-spacing">
				{SPACE_STEPS.map((step) => (
					<div className="vz-space-row" key={step.variable}>
						<span className="vz-space-row__name">{step.label}</span>
						<span className="vz-space-row__value">{read(values, step.variable)}</span>
						<div className="vz-space-row__track">
							<div
								className="vz-space-row__bar"
								style={{
									width: `${Math.max(2, (px(values, step.variable) / max) * 100)}%`,
									background: "var(--color-brand-accent)"
								}}
							/>
						</div>
						<code className="vz-code">{step.variable}</code>
					</div>
				))}
			</div>
			<div className="vz-space-preview">
				{SPACE_STEPS.map((step) => (
					<div
						key={step.variable}
						className="vz-space-square"
						title={step.label}
						style={{
							width: `calc(var(${step.variable}) * 6)`,
							height: `calc(var(${step.variable}) * 6)`,
							background: "var(--color-brand-primary)"
						}}
					/>
				))}
			</div>
		</SectionShell>
	);
};

const ROUNDED_STEPS = ["none", "sm", "md", "lg", "full"].map((name) => ({
	variable: `--rounded-${name}`,
	label: name
}));
const BORDER_STEPS = ["sm", "md", "lg"].map((name) => ({
	variable: `--border-${name}`,
	label: name
}));
const ELEVATION_STEPS = ["sm", "md", "lg"].map((name) => ({
	variable: `--elevation-${name}`,
	label: name
}));

const ELEVATION_PRESETS: Record<string, string[]> = {
	flat: ["none", "none", "none"],
	paper: [
		"0 1px 2px rgb(0 0 0 / 6%)",
		"0 4px 12px rgb(0 0 0 / 10%)",
		"0 12px 32px rgb(0 0 0 / 16%)"
	],
	brutal: [
		"2px 2px 0 var(--color-text)",
		"4px 4px 0 var(--color-text)",
		"6px 6px 0 var(--color-text)"
	]
};

/** Shapes: rounded presets, border widths, and elevation presets. */
export const ShapesSection: React.FC<SectionProps> = ({ values, update }) => {
	const applyPreset = (name: string): void => {
		const preset = ELEVATION_PRESETS[name];
		if (!preset) return;
		ELEVATION_STEPS.forEach((step, index) => {
			update(step.variable, preset[index] ?? "none");
		});
	};

	return (
		<SectionShell
			id="shapes"
			index="04"
			title="Shapes"
			controls={
				<>
					<CogPanel label="Rounded">
						{ROUNDED_STEPS.map((step) => (
							<NumberField
								key={step.variable}
								label={step.label}
								suffix="px"
								value={Math.round(px(values, step.variable))}
								onChange={(value) =>
									update(
										step.variable,
										step.variable === "--rounded-full" ? `${value}px` : formatRem(value)
									)
								}
							/>
						))}
					</CogPanel>
					<CogPanel label="Border widths">
						{BORDER_STEPS.map((step) => (
							<TextInput
								key={step.variable}
								label={step.label}
								value={read(values, step.variable)}
								onChange={(value) => update(step.variable, value)}
							/>
						))}
					</CogPanel>
					<CogPanel label="Elevation">
						{ELEVATION_STEPS.map((step) => (
							<TextInput
								key={step.variable}
								label={step.label}
								value={read(values, step.variable)}
								onChange={(value) => update(step.variable, value)}
							/>
						))}
						<div className="vz-presets">
							{Object.keys(ELEVATION_PRESETS).map((name) => (
								<Button
									key={name}
									label={name}
									size="sm"
									variant="secondary"
									onClick={() => applyPreset(name)}
								/>
							))}
						</div>
					</CogPanel>
				</>
			}
		>
			<span className="vz-label">Rounded</span>
			<div className="vz-rounded">
				{ROUNDED_STEPS.map((step) => (
					<div className="vz-rounded__item" key={step.variable}>
						<div className="vz-rounded__tile" style={{ borderRadius: `var(${step.variable})` }} />
						<span className="vz-swatch__name">{step.label}</span>
						<code className="vz-code">{read(values, step.variable)}</code>
					</div>
				))}
			</div>

			<span className="vz-label">Border widths</span>
			<div className="vz-borders">
				{BORDER_STEPS.map((step) => (
					<div className="vz-border-item" key={step.variable}>
						<div
							className="vz-border-sample"
							style={{ border: `var(${step.variable}) solid var(--color-text)` }}
						/>
						<code className="vz-code">{read(values, step.variable)}</code>
					</div>
				))}
			</div>

			<span className="vz-label">Elevation</span>
			<div className="vz-elevations">
				{ELEVATION_STEPS.map((step) => (
					<div className="vz-elevation" key={step.variable}>
						<div className="vz-elevation__card" style={{ boxShadow: `var(${step.variable})` }} />
						<code className="vz-code">{step.label}</code>
					</div>
				))}
			</div>
		</SectionShell>
	);
};

/** Components: the gallery every other token set feeds into. */
export const ComponentsSection: React.FC<SectionProps> = ({ values }) => {
	const [field, setField] = useState("Design System");
	const onDark = isLight(resolved(values, "--color-brand-primary"));

	return (
		<SectionShell id="components" index="05" title="Components">
			<span className="vz-label">Buttons</span>
			<div className="vz-row">
				<Button label="Primary" variant="primary" />
				<Button label="Accent" variant="accent" />
				<Button label="Secondary" variant="secondary" />
				<Button label="Ghost" variant="ghost" />
				<Button label="Success" variant="success" />
				<Button label="Warning" variant="warning" />
				<Button label="Danger" variant="danger" />
				<Button label="Info" variant="info" />
			</div>
			<div className="vz-row">
				<Button label="Small" size="sm" />
				<Button label="Default" />
				<Button label="Large" size="lg" />
				<Button label="Loading" loading />
				<Button label="Disabled" disabled />
			</div>

			<span className="vz-label">Form</span>
			<div className="vz-form">
				<TextField id="vz-name" label="Project name" value={field} onChange={setField} />
				<Button label="Save" variant="primary" />
			</div>

			<span className="vz-label">Cards</span>
			<div className="vz-cards">
				<Box
					background="surface-card"
					border="sm"
					borderColor="surface-alt"
					rounded="lg"
					elevation="md"
					p="lg"
				>
					<Text size="sm" tone="accent">
						Article
					</Text>
					<Heading level={3} size="md">
						The grid as structure
					</Heading>
					<Text size="sm" tone="muted">
						Invisible scaffolding that organizes every element into a coherent whole.
					</Text>
				</Box>
				<Box
					background="brand-primary"
					rounded="lg"
					elevation="md"
					p="lg"
					className="vz-card--dark"
				>
					<Text size="sm" tone={onDark ? "base" : "ondark"}>
						Design tokens
					</Text>
					<Heading level={3} size="xl" className="vz-stat">
						26
					</Heading>
					<Text size="sm" tone={onDark ? "muted" : "ondark"}>
						variables in the contract
					</Text>
				</Box>
				<Box background="surface-alt" border="sm" borderColor="surface" rounded="lg" p="lg">
					<Text size="sm" tone="muted">
						Spacing · Color · Type
					</Text>
					<Heading level={3} size="md">
						Everything in its right place
					</Heading>
					<Text size="sm" tone="muted">
						A systematic approach keeps every decision intentional and every token purposeful.
					</Text>
				</Box>
			</div>
		</SectionShell>
	);
};
