import type * as React from "react";
import { Heading } from "../base/Heading";
import { Text } from "../base/Text";
import { Button } from "../ui/Button";
import "./ChatHeader.css";

interface ChatHeaderProps {
	onReset: () => void;
}

/** Chat identity and the start-over action. */
export const ChatHeader: React.FC<ChatHeaderProps> = ({ onReset }) => (
	<header className="chat-header">
		<div className="chat-header__identity">
			<Heading level={1}>Eliza</Heading>
			<Text as="span" size="sm" tone="muted">
				What is on your mind?
			</Text>
		</div>
		<Button icon="reset" label="Start over" variant="ghost" onClick={onReset} />
	</header>
);
