const batchQueue = require('../batcher.js');
const dataSpec = require('../dungeon.js');
const { generate } = require('make-mp-data');
const u = require('ak-tools');
require('dotenv').config({ path: "../.env", debug: true, "encoding": "utf8" });

/** @typedef {import('../types').BatchRequestConfig} BatchReqConfig */
/** @typedef {import('../types').Dungeon} DungeonConfig */

const SEGMENT_BATCH_ENDPOINT = `https://api.segment.io/v1/batch`;
const SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY;

// ? https://segment.com/docs/connections/sources/catalog/libraries/server/http-api/#batch

async function main(spec = dataSpec) {
	console.log("\nGenerating Segment data...\n\n");
	const data = await generate(spec);
	const { eventData, userProfilesData } = data;

	const segmentEvents = eventData.map(event => {
		const segmentEvent = {
			type: "track",
			userId: event.distinct_id,
			event: event.event,
			timestamp: new Date(event.time * 1000).toISOString(),
		};

		delete event.distinct_id;
		delete event.time;
		delete event.event;

		segmentEvent.properties = { ...event };
		return segmentEvent;
	});

	const eventsJobConfig = {
		url: SEGMENT_BATCH_ENDPOINT,
		data: segmentEvents,
		batchSize: 200,
		concurrency: 10,
		bodyParams: {
			writeKey: SEGMENT_WRITE_KEY,
			dataKey: "batch",
		},
	};

	console.log(`sending ${u.comma(segmentEvents.length)} events to Segment...\n`);
	const eventResponses = await batchQueue(eventsJobConfig);
	console.log(`\n... sent ${u.comma(segmentEvents.length)} events to Segment.`);

	const segmentUsers = userProfilesData.map(user => {
		const segmentUser = {
			type: "identify",
			userId: user.distinct_id,
		};
		delete user.distinct_id;

		segmentUser.traits = { ...user };
		return segmentUser;
	});

	const usersJobConfig = {
		url: SEGMENT_BATCH_ENDPOINT,
		data: segmentUsers,
		batchSize: 200,
		concurrency: 10,
		bodyParams: {
			writeKey: SEGMENT_WRITE_KEY,
			dataKey: "batch",
		}
	};

	console.log(`\nsending ${u.comma(segmentUsers.length)} users to Segment...\n`);
	const userResponses = await batchQueue(usersJobConfig);
	console.log(`\n... sent ${u.comma(segmentUsers.length)} users to Segment.`);

	return {
		users: userResponses,
		events: eventResponses
	};
}

if (require.main === module) {
	main()
		.then(() => {
			console.log("\n\nDone.\n\n");
		})
		.catch((err) => {
			debugger;
		})
		.finally(() => console.log(`\n\n\t... your lucky numbers are ${u.rand(1, 42)} ${u.rand(1, 42)} ${u.rand(1, 42)}\n\n`));
}
else {
	module.exports = main;
}

