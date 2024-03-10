const batchQueue = require('../batcher.js');
const dataSpec = require('../dungeon.js');
const { generate } = require('make-mp-data');
const u = require('ak-tools');
require('dotenv').config({ path: "../.env", debug: true, "encoding": "utf8" });

/** @typedef {import('../types.js').BatchRequestConfig} BatchReqConfig */
/** @typedef {import('../types.js').Dungeon} DungeonConfig */


const MPARTICLE_API_KEY = process.env.MPARTICLE_API_KEY;
const MPARTICLE_API_SECRET = process.env.MPARTICLE_API_SECRET;
const MPARTICLE_EVENT_ENDPOINT = `https://s2s.mparticle.com/v2/bulkevents`;
const MIXPANEL_USERS_ENDPOINT = `https://api.mixpanel.com/engage`;

// ? https://docs.mparticle.com/developers/server/http/

async function main(spec = dataSpec) {
	console.log("\nGenerating mParticle data...\n\n");
	const data = await generate(spec);
	const { eventData, userProfilesData } = data;

	var mock = {
		"events": [
			{
				"data": {
					"event_id": 6004677780660780000,
					"event_num": 0,
					"source_message_id": "e8335d31-2031-4bff-afec-17ffc1784697",
					"session_id": 4957918240501247982,
					"session_uuid": "91b86d0c-86cb-4124-a8b2-edee107de454",
					"timestamp_unixtime_ms": 1402521613976,
					"location": {},
					"device_current_state": {},
					"custom_attributes": {},
					"custom_flags": {}
				},
				"event_type": "custom_event"
			}
		],
		"device_info": {},
		"source_request_id": "7fa67be4-f83a-429f-9d73-38b660c50825",
		"user_attributes": {},
		"deleted_user_attributes": [],
		"user_identities": {},
		"application_info": {},
		"schema_version": 2,
		"environment": "production",
		"context": {},
		"mpid": 7346244611012968789,
		"ip": "172.217.12.142"
	};


	const mParticleData = userProfilesData.map(user => {
		const mpUserEvents = {
			"events": [],
			"device_info": {},
			"source_request_id": user.distinct_id,
			"user_attributes": {},
			"deleted_user_attributes": [],
			"user_identities": {},
			"application_info": {},
			"schema_version": 2,
			"environment": "production",
			"context": {},
			"mpid": user.distinct_id,
		};
		delete user.distinct_id;
		mpUserEvents.user_attributes = { ...user };		
		return mpUserEvents;
	});

	const usersJobConfig = {
		url: MIXPANEL_USERS_ENDPOINT,
		data: mParticleData,
		batchSize: 200,
		concurrency: 5,
	};

	console.log(`\nsending ${u.comma(mParticleData.length)} users to Mixpanel...\n`);
	const userResponses = await batchQueue(usersJobConfig);
	console.log(`\n... sent ${u.comma(mParticleData.length)} users to Mixpanel.`);


	const mixpanelEvents = eventData.map(event => {
		const mixpanelEvent = {
			event: event.event,
		};
		delete event.event;

		mixpanelEvent.properties = { ...event };
		return mixpanelEvent;
	});

	/** @type {BatchReqConfig} */
	const eventsJobConfig = {
		url: MPARTICLE_EVENT_ENDPOINT,
		data: mixpanelEvents,
		batchSize: 2000,
		concurrency: 10,
		searchParams: {
			verbose: 1
		},
		headers: {
			authorization: `Basic ${Buffer.from(`${MPARTICLE_API_KEY}:${MPARTICLE_API_SECRET}`).toString('base64')}`,
			'Content-Type': 'application/json'
		},
	};

	console.log(`sending ${u.comma(mixpanelEvents.length)} events to Mixpanel...\n`);
	const eventResponses = await batchQueue(eventsJobConfig);
	console.log(`\n... sent ${u.comma(mixpanelEvents.length)} events to Mixpanel.`);


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

