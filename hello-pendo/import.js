const batchQueue = require('../batcher.js');
const dataSpec = require('../dungeon.js');
const { generate } = require('make-mp-data');
const u = require('ak-tools');
require('dotenv').config({ path: "../.env", debug: true, "encoding": "utf8" });

/** @typedef {import('../types.js').BatchRequestConfig} BatchReqConfig */
/** @typedef {import('../types.js').Dungeon} DungeonConfig */


const PENDO_API_KEY = process.env.PENDO_API_KEY;
const PENDO_EVENT_SECRET = process.env.PENDO_EVENT_SECRET;
const PENDO_EVENT_ENDPOINT = `https://app.pendo.io/data/track`;

// ? https://engageapi.pendo.io/#3ec5d561-6094-4336-8a33-0a6c23041797

async function main(spec = dataSpec) {
	console.log("\nGenerating Pendo data...\n\n");
	const data = await generate(spec);
	const { eventData, userProfilesData } = data;

	// var mock = {
	// 	"type": "track",
	// 	"event": "Registered",
	// 	"visitorId": "unique-string-id",
	// 	"accountId": "account-id-of-visitor",
	// 	"timestamp": 1680373680000,
	// 	"properties": {},
	// 	"context": {
	// 		"ip": "76.253.187.23",
	// 		"userAgent": "Mozilla/5.0",
	// 		"url": "http://MuqrevujORTeLIzvMFcBSW.vitaO",
	// 		"title": "My Page - Admin"
	// 	}
	// };

	const pendoEvents = eventData.map(event => {
		const pendoEvent = {
			type: "track",
			event: event.event,
			visitorId: event.distinct_id,
			timestamp: event.time,
			properties: {},
			context: {}				
		};
		delete event.event;
		delete event.distinct_id;
		delete event.time;

		pendoEvent.properties = { ...event };
		return pendoEvent;
	});

	/** @type {BatchReqConfig} */
	const eventsJobConfig = {
		url: PENDO_EVENT_ENDPOINT,
		data: pendoEvents,
		batchSize: 1,
		concurrency: 10,
		searchParams: {	},
		headers: {
			'Content-Type': 'application/json',
			'x-pendo-integration-key': PENDO_EVENT_SECRET
		},
	};

	console.log(`sending ${u.comma(pendoEvents.length)} events to Pendo...\n`);
	const eventResponses = await batchQueue(eventsJobConfig);
	console.log(`\n... sent ${u.comma(pendoEvents.length)} events to Pendo.`);


	// const pendoUsers = userProfilesData.map(user => {
	// 	const pendoUser = {
	// 		$distinct_id: user.distinct_id,
	// 		$token: PENDO_API_KEY,
	// 		$ip: 0
	// 	};
	// 	delete user.distinct_id;
	// 	pendoUser.$set = { ...user };
	// 	return pendoUser;
	// });

	// const usersJobConfig = {
	// 	url: Pendo_USERS_ENDPOINT,
	// 	data: pendoUsers,
	// 	batchSize: 200,
	// 	concurrency: 5,
	// };

	// console.log(`\nsending ${u.comma(pendoUsers.length)} users to Pendo...\n`);
	// const userResponses = await batchQueue(usersJobConfig);
	// console.log(`\n... sent ${u.comma(pendoUsers.length)} users to Pendo.`);

	return {
		users: [],
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

