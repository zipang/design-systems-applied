/** Who authored a chat message. */
export type Speaker = "eliza" | "you";

/** A file attached to a message. */
export interface Attachment {
	name: string;
	size: string;
	type: string;
}

/** A single chat message. */
export interface ChatMessage {
	id: number;
	speaker: Speaker;
	text: string;
	attachment?: Attachment;
}
