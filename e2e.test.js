require("dotenv").config();
const longTimeout = 75000;
const amplitude = require("./hello-amplitude/import.js");

/** @typedef {import('./types').Config} JobConfig */

/** @type {JobConfig} */
const baseConfig = {
	seed: "foo bar baz",
	events: [{ event: "foo" }, { event: "bar" }, { event: "baz" }],
	numUsers: 100,
	numEvents: 1000
};

describe("importers", () => {
	test(
		"amplitude",
		async () => {
			const data = await amplitude(baseConfig);
			const {events, users} = data;
			expect(events.length).toBeGreaterThan(9);
			expect(events.filter(r => r.code === 200).length).toBeGreaterThan(9);
			expect(events.reduce((acc, r) => acc + r.events_ingested, 0)).toBeGreaterThan(999);
			expect(users.length).toBeGreaterThan(9);
			expect(users.filter(s => s === 'success').length).toBeGreaterThan(9);			
		},
		longTimeout
	);
});