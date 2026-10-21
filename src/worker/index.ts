import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.get("/health", (c) =>
	c.json({
		ok: true,
		service: "elsewhere",
		qlooMode: c.env.QLOO_MODE,
		agentMode: c.env.AGENT_MODE,
	}),
);

app.notFound((c) => c.json({ error: "not_found" }, 404));

app.onError((err, c) => {
	console.error(
		JSON.stringify({ message: "unhandled error", path: c.req.path, error: err.message }),
	);
	return c.json({ error: "internal_error" }, 500);
});

export default {
	fetch: app.fetch,
} satisfies ExportedHandler<Env>;
