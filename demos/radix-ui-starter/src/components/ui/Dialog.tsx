import * as DialogPrimitive from "@radix-ui/react-dialog";
import type * as React from "react";
import { clsx } from "../../lib/clsx";
import { Heading } from "../base/Heading";
import { Text } from "../base/Text";
import "./Dialog.css";

interface DialogProps {
	children: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

/** Root of a modal dialog. Composes with {@link DialogTrigger} and {@link DialogContent}. */
export const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => (
	<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
		{children}
	</DialogPrimitive.Root>
);

interface DialogTriggerProps {
	children: React.ReactNode;
	className?: string;
}

/** Opens the dialog. Rendered as a button. */
export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, className }) => (
	<DialogPrimitive.Trigger className={clsx("ui-dialog__trigger", className)}>
		{children}
	</DialogPrimitive.Trigger>
);

interface DialogContentProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

/** The portaled dialog surface, with a title, optional description, and a close button. */
export const DialogContent: React.FC<DialogContentProps> = ({
	title,
	description,
	children,
	className
}) => (
	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay className="ui-dialog__overlay" />
		<DialogPrimitive.Content className={clsx("ui-dialog", className)}>
			<DialogPrimitive.Title asChild>
				<Heading level={2}>{title}</Heading>
			</DialogPrimitive.Title>
			{description ? (
				<DialogPrimitive.Description asChild>
					<Text size="md" tone="muted">
						{description}
					</Text>
				</DialogPrimitive.Description>
			) : null}
			{children}
			<DialogPrimitive.Close className="ui-dialog__close" aria-label="Close">
				×
			</DialogPrimitive.Close>
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
);
