import type * as React from "react";
import "./Fields.css";

export interface NumberFieldProps {
	label: string;
	value: number;
	min?: number;
	max?: number;
	step?: number;
	suffix?: string;
	onChange: (value: number) => void;
}

/** Labeled numeric input for the settings menus. */
export const NumberField: React.FC<NumberFieldProps> = ({
	label,
	value,
	min,
	max,
	step = 1,
	suffix,
	onChange
}) => (
	<label className="editor-field">
		<span className="editor-field__label">{label}</span>
		<span className="editor-field__control">
			<input
				className="editor-field__input"
				type="number"
				value={Number.isFinite(value) ? value : ""}
				min={min}
				max={max}
				step={step}
				onChange={(event) => onChange(Number.parseFloat(event.currentTarget.value))}
			/>
			{suffix ? <span className="editor-field__suffix">{suffix}</span> : null}
		</span>
	</label>
);

export interface TextInputProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

/** Labeled text input for font stacks and free-form token values. */
export const TextInput: React.FC<TextInputProps> = ({ label, value, onChange }) => (
	<label className="editor-field">
		<span className="editor-field__label">{label}</span>
		<input
			className="editor-field__input"
			type="text"
			value={value}
			spellCheck={false}
			onChange={(event) => onChange(event.currentTarget.value)}
		/>
	</label>
);

export interface ColorFieldProps {
	label: string;
	token: string;
	value: string;
	onChange: (value: string) => void;
}

/** A swatch that opens the native color picker, plus an editable value and token name. */
export const ColorField: React.FC<ColorFieldProps> = ({ label, token, value, onChange }) => (
	<div className="editor-color">
		<label className="editor-color__swatch" style={{ ["--editor-swatch" as string]: value }}>
			<input
				className="editor-color__picker"
				type="color"
				value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : "#000000"}
				aria-label={label}
				onChange={(event) => onChange(event.currentTarget.value)}
			/>
		</label>
		<div className="editor-color__meta">
			<span className="editor-color__name">{label}</span>
			<input
				className="editor-color__value"
				type="text"
				value={value}
				spellCheck={false}
				aria-label={`${label} value`}
				onChange={(event) => onChange(event.currentTarget.value)}
			/>
			<code className="editor-color__token">{token}</code>
		</div>
	</div>
);
