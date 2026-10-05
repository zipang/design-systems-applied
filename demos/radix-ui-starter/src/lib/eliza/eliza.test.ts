import { expect, test } from "bun:test";
import { createEliza, reflect } from "./eliza";

test("reflect swaps first and second person", () => {
	expect(reflect("I am happy with my work")).toBe("you are happy with your work");
});

test("the opening message is the greeting", () => {
	expect(createEliza().opening).toContain("I am Eliza");
});

test("a feeling statement is reflected back as a question", () => {
	expect(createEliza().reply("I feel sad today")).toBe("How long have you felt sad today?");
});

test("a possessive statement is remembered", () => {
	const eliza = createEliza();

	expect(eliza.reply("my mother")).toBe("Tell me more about your mother.");
	expect(eliza.reply("the weather is nice")).toBe(
		"Earlier you mentioned your mother. Tell me more about that."
	);
});

test("goodbye ends the conversation", () => {
	const eliza = createEliza();

	expect(eliza.isFinished()).toBe(false);
	eliza.reply("goodbye");
	expect(eliza.isFinished()).toBe(true);
});

test("reset clears memory and the finished flag", () => {
	const eliza = createEliza();

	eliza.reply("my mother");
	eliza.reply("goodbye");
	eliza.reset();

	expect(eliza.isFinished()).toBe(false);
	expect(eliza.reply("hello")).toBe("Hello. What is on your mind today?");
});
