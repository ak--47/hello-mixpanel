require("dotenv").config();
const longTimeout = 75000;
const amplitude = require("./hello-amplitude/import.js");
const heap = require("./hello-heap/import.js");
const mixpanel = require("./hello-javascript/import.js");
const pendo = require("./hello-pendo/import.js");
const segment = require("./hello-segment/import.js");

/** @typedef {import('./types').Dungeon} JobConfig */

/** @type {JobConfig} */
const baseConfig = {
	seed: "foo bar baz",
	events: [{ event: "foo" }, { event: "bar" }, { event: "baz" }],
	numUsers: 100,
	numEvents: 1000
};


test(
	"amplitude",
	async () => {
		const data = await amplitude(baseConfig);
		const { events, users } = data;
		expect(events.length).toBeGreaterThan(9);
		expect(events.every(r => r.code === 200)).toBe(true);
		expect(events.reduce((acc, r) => acc + r.events_ingested, 0)).toBeGreaterThan(900);
		expect(users.length).toBeGreaterThan(0);
		expect(users.every(s => s === 'success')).toBe(true);
	},
	longTimeout
);

test(
	"heap",
	async () => {
		const data = await heap(baseConfig);
		const { events, users } = data;
		expect(events.every(t => t === "OK")).toBe(true);
		expect(users.every(t => t === "OK")).toBe(true);
		expect(events.length).toBeGreaterThan(0);
		expect(users.length).toBeGreaterThan(0);

	},
	longTimeout
);


test(
	"mixpanel",
	async () => {
		const data = await mixpanel(baseConfig);
		const { events, users } = data;
		expect(events.every(t => t.code === 200)).toBe(true);
		expect(users.every(t => t === "1")).toBe(true);
		expect(events.length).toBeGreaterThan(0);
		expect(users.length).toBeGreaterThan(0);

	},
	longTimeout
);


test(
	"pendo",
	async () => {
		const data = await pendo({ ...baseConfig, numEvents: 50, numUsers: 2 });
		const { events, users } = data;
		expect(events.every(r => r.status === 200 && r.statusText === "OK")).toBe(true);
		expect(events.length).toBeGreaterThan(0);
		expect(users.length).toBe(0);

	},
	longTimeout
);

test(
	"segment",
	async () => {
		const data = await segment(baseConfig);
		const { events, users } = data;
		expect(events.every(r => r.success === true)).toBe(true);
		expect(users.every(r => r.success === true)).toBe(true);
		expect(events.length).toBeGreaterThan(0);
		expect(users.length).toBeGreaterThan(0);

	},
	longTimeout
);
