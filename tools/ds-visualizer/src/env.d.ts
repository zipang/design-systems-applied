declare module "*.css";

/** SVG files imported with `with { type: "text" }` yield their markup as a string. */
declare module "*.svg" {
	const content: string;
	export default content;
}
