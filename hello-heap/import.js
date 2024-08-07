const batchQueue = require('ak-fetch');
const dataSpec = require('../dungeon.js');
const { generate } = require('make-mp-data');
const u = require('ak-tools');
require('dotenv').config({ path: "../.env", debug: false, "encoding": "utf8" });
const dayjs = require('dayjs');

/** @typedef {import('ak-fetch').BatchRequestConfig} BatchReqConfig */
/** @typedef {import('../types').Dungeon} DungeonConfig */

const HEAP_EVENTS_ENDPOINT = `https://heapanalytics.com/api/track`;
const HEAP_USERS_ENDPOINT = `https://heapanalytics.com/api/add_user_properties`;
const HEAP_APP_ID = process.env.HEAP_APP_ID;

// ? https://developers.heap.io/reference/bulk-track

async function main(spec = dataSpec) {
	console.log("\nGenerating Heap data...\n\n");
	const data = await generate(spec);
	const { eventData, userProfilesData } = data;

	const heapEvents = eventData.map(event => {
		const heapEvent = {
			identity: event.$user_id,
			event: event.event,
			timestamp: event.time,
		};

		
		delete event.distinct_id;
		delete event.$source;
		delete event.time;
		delete event.event;

		heapEvent.properties = { ...event };
		
		return heapEvent;
	});

	const eventsJobConfig = {
		url: HEAP_EVENTS_ENDPOINT,
		data: heapEvents,
		batchSize: 1000,
		concurrency: 10,
		bodyParams: {
			app_id: HEAP_APP_ID,
			dataKey: "events",
		},
	};

	console.log(`sending ${u.comma(heapEvents.length)} events to Heap...\n`);
	const eventResponses = await batchQueue(eventsJobConfig);	
	console.log(`\n... sent ${u.comma(heapEvents.length)} events to Heap.`);


	const heapUsers = userProfilesData.map(user => {
		const heapUser = {
			identity: user.distinct_id,
		};
		delete user.distinct_id;

		// heap don't allow list props for users 0_o
		for (const key in user) {
			if (Array.isArray(user[key])) {
				user[key] = JSON.stringify(user[key]);
			}
		}
		heapUser.properties = { ...user };
		return heapUser;
	});

	const usersJobConfig = {
		url: HEAP_USERS_ENDPOINT,
		data: heapUsers,
		batchSize: 100,
		concurrency: 5,
		bodyParams: {
			app_id: HEAP_APP_ID,
			dataKey: "users"
		}
	};

	console.log(`\nsending ${u.comma(heapUsers.length)} users to Heap...\n`);
	const userResponses = await batchQueue(usersJobConfig);
	console.log(`\n... sent ${u.comma(heapUsers.length)} users to Heap.`);

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
		.finally(() => console.log(`\n\n\t... your lucky numbers are \t${u.rand(1, 42)} \t${u.rand(1, 42)} \t${u.rand(1, 42)}\n\n`));
}
else {
	module.exports = main;
}

