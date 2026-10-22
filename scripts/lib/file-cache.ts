/**
 * File-backed Qloo cache for local scripts. Responses land in the git-ignored
 * .qloo-cache/http/ so repeated runs reuse them instead of calling the API again.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { QlooCache } from "../../src/engine/qloo/client.ts";

export class FileCache implements QlooCache {
	#dir: string;

	constructor(dir = ".qloo-cache/http") {
		this.#dir = dir;
	}

	#path(key: string): string {
		return `${this.#dir}/${createHash("sha256").update(key).digest("hex").slice(0, 32)}.json`;
	}

	async get(key: string): Promise<unknown | undefined> {
		try {
			const entry = JSON.parse(await readFile(this.#path(key), "utf8")) as { key: string; expires: number; value: unknown };
			return entry.key === key && entry.expires > Date.now() ? entry.value : undefined;
		} catch {
			return undefined;
		}
	}

	async put(key: string, value: unknown, ttlSeconds: number): Promise<void> {
		await mkdir(this.#dir, { recursive: true });
		await writeFile(this.#path(key), JSON.stringify({ key, expires: Date.now() + ttlSeconds * 1000, value }));
	}
}
