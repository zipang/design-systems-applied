import type * as React from "react";
import { useState } from "react";
import { createEliza } from "../../lib/eliza/eliza";
import { formatBytes } from "../../lib/format";
import { ScrollArea } from "../ui/ScrollArea";
import { ChatHeader } from "./ChatHeader";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";
import type { Attachment, ChatMessage } from "./types";
import "./ChatPanel.css";

/**
 * The Eliza chat page. Owns the conversation state and the reply engine.
 */
export const ChatPanel: React.FC = () => {
	const [eliza] = useState(createEliza);
	const [messages, setMessages] = useState<ChatMessage[]>(() => [
		{ id: 1, speaker: "eliza", text: eliza.opening }
	]);
	const [draft, setDraft] = useState("");
	const [attachment, setAttachment] = useState<Attachment | null>(null);
	const [pending, setPending] = useState(false);
	const [finished, setFinished] = useState(false);

	const attach = (file: File): void => {
		setAttachment({
			name: file.name,
			size: formatBytes(file.size),
			type: file.type.split("/")[1]?.toUpperCase() || "FILE"
		});
	};

	const send = (): void => {
		const text = draft.trim();
		const includedFile = attachment;

		if (!text && !includedFile) {
			return;
		}

		setMessages((current) => [
			...current,
			{
				id: Date.now(),
				speaker: "you",
				text: text || "I'd like to share this with you.",
				attachment: includedFile ?? undefined
			}
		]);
		setDraft("");
		setAttachment(null);
		setPending(true);

		window.setTimeout(() => {
			setMessages((current) => [
				...current,
				{ id: Date.now() + 1, speaker: "eliza", text: eliza.reply(text) }
			]);
			setPending(false);
			setFinished(eliza.isFinished());
		}, 650);
	};

	const reset = (): void => {
		eliza.reset();
		setMessages([{ id: Date.now(), speaker: "eliza", text: eliza.opening }]);
		setDraft("");
		setAttachment(null);
		setPending(false);
		setFinished(false);
	};

	return (
		<main className="chat-panel">
			<ChatHeader onReset={reset} />
			<ScrollArea className="chat-panel__scroll">
				<MessageList messages={messages} pending={pending} />
			</ScrollArea>
			<footer className="chat-panel__composer">
				<Composer
					draft={draft}
					attachment={attachment}
					pending={pending}
					disabled={finished}
					onDraftChange={setDraft}
					onAttach={attach}
					onRemoveAttachment={() => setAttachment(null)}
					onSend={send}
				/>
			</footer>
		</main>
	);
};
