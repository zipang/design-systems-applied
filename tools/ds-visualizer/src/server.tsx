import index from "../index.html";
import { readTheme, saveTheme, ThemeApiError } from "./lib/theme-api";

const port = Number(process.env.PORT ?? 3000);

const json = (data: unknown, status = 200): Response =>
	new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

const errorResponse = (error: unknown): Response => {
	if (error instanceof ThemeApiError) {
		return json({ message: error.message, issues: error.issues }, error.status);
	}
	return json({ message: error instanceof Error ? error.message : "Unknown error" }, 500);
};

/**
 * Development and runtime server. Serves the HTML entrypoint and the theme API that
 * reads and writes a project's DESIGN.md and design-tokens.css.
 */
const server = Bun.serve({
	port,
	routes: {
		"/api/theme": {
			GET: async (request) => {
				const dir = new URL(request.url).searchParams.get("dir");
				if (!dir) return json({ message: "Missing ?dir query parameter" }, 400);
				try {
					const theme = await readTheme(dir);
					return json({
						dir: theme.dir,
						designMd: theme.designMd,
						tokensCss: theme.tokensCss,
						issues: theme.issues
					});
				} catch (error) {
					return errorResponse(error);
				}
			},
			POST: async (request) => {
				try {
					const body = (await request.json()) as {
						dir?: string;
						designMd?: string;
						tokensCss?: string;
					};
					if (!body.dir || body.designMd === undefined || body.tokensCss === undefined) {
						return json({ message: "Expected { dir, designMd, tokensCss }" }, 400);
					}
					const issues = await saveTheme(body.dir, {
						designMd: body.designMd,
						tokensCss: body.tokensCss
					});
					return json({ ok: true, issues });
				} catch (error) {
					return errorResponse(error);
				}
			}
		},
		"/*": index
	}
});

console.log(`DS visualizer running at ${server.url}`);
