import index from "../index.html";

const port = Number(process.env.PORT ?? 3000);

/**
 * Development server. Bun bundles the HTML entrypoint and its imports on request,
 * and `bun --hot` reloads the server module on change.
 */
const server = Bun.serve({
	port,
	routes: {
		"/*": index
	}
});

console.log(`Radix UI starter running at ${server.url}`);
