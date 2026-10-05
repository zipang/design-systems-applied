import type * as React from "react";
import { Text } from "../base/Text";
import "./TypingIndicator.css";

/** Three animated dots shown while Eliza composes a reply. */
export const TypingIndicator: React.FC = () => (
	<div className="chat-typing" role="status" aria-label="Eliza is responding">
		<Text size="xs" tone="muted" className="chat-typing__speaker">
			Eliza
		</Text>
		<div className="chat-typing__bubble">
			<span className="chat-typing__dot" />
			<span className="chat-typing__dot" />
			<span className="chat-typing__dot" />
		</div>
	</div>
);
