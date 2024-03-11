const batchQueue = require('../batcher.js');
const dataSpec = require('../dungeon.js');
const { generate } = require('make-mp-data');
const u = require('ak-tools');
require('dotenv').config({ path: "../.env", debug: false, "encoding": "utf8" });

/** @typedef {import('../types.js').BatchRequestConfig} BatchReqConfig */
/** @typedef {import('../types.js').Dungeon} DungeonConfig */


const MPARTICLE_API_KEY = process.env.MPARTICLE_API_KEY;
const MPARTICLE_API_SECRET = process.env.MPARTICLE_API_SECRET;
const MPARTICLE_EVENT_ENDPOINT = `https://s2s.mparticle.com/v2/bulkevents`;
// const MIXPANEL_USERS_ENDPOINT = `https://api.mixpanel.com/engage`;

// ? https://docs.mparticle.com/developers/server/http/

async function main(spec = dataSpec) {
	console.log("\nGenerating mParticle data...\n\n");
	const data = await generate(spec);
	const { eventData, userProfilesData } = data;


	const mParticleData = userProfilesData.map(e => {
		const mpParticleUserAndEvents = {
			"events": [],
			"device_info": {},
			"source_request_id": e.distinct_id,
			"user_attributes": {},
			"deleted_user_attributes": [],
			"user_identities": {
				"customer_id": e.distinct_id,
			},
			"application_info": {},
			"schema_version": 2,
			"environment": "production",
			"context": {},
			// "mpid": user.distinct_id,
		};
		const uuid = e.distinct_id;
		delete e.distinct_id;
		// heap don't allow list props for users 0_o
		for (const key in e) {
			if (Array.isArray(e[key])) {
				e[key] = JSON.stringify(e[key]);
			}
		}
		mpParticleUserAndEvents.user_attributes = { ...e };
		eventData;
		const userEvents = eventData.filter(event => event.distinct_id === uuid).map((e) => {

			const mparticleEvent = {
				"data": {
					// "event_id": randInt64(),
					"event_num": 0,
					// "session_id": randInt64(),
					"timestamp_unixtime_ms": e.time * 1000,
					// "location": {},
					// "device_current_state": {},
					"custom_attributes": {},
					"custom_flags": {},
					"event_name": e.event
				},
				"event_type": "custom_event"
			};

			delete e.event;
			delete e.distinct_id;
			delete e.time;
			for (const key in e) {
				if (Array.isArray(e[key])) {
					e[key] = JSON.stringify(e[key]);
				}
			}
			mparticleEvent.data.custom_attributes = { ...e };
			return mparticleEvent;

		});

		mpParticleUserAndEvents.events = userEvents;
		return mpParticleUserAndEvents;
	});

	const usersJobConfig = {
		url: MPARTICLE_EVENT_ENDPOINT,
		data: mParticleData,
		batchSize: 1,
		concurrency: 5,
		headers: {
			authorization: `Basic ${Buffer.from(`${MPARTICLE_API_KEY}:${MPARTICLE_API_SECRET}`).toString('base64')}`,
			'Content-Type': 'application/json'
		},
	};

	console.log(`\nsending ${u.comma(mParticleData.length)} users and ${u.comma(eventData.length)} events to mParticle...\n`);
	const userResponses = await batchQueue(usersJobConfig);
	console.log(`\n... sent ${u.comma(mParticleData.length)} users and ${u.comma(eventData.length)} events to mParticle.`);


	return {
		users: userResponses,
		events: mParticleData
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



function randInt64() {
	// Generate a random 32-bit integer for high bits
	let high = Math.floor(Math.random() * Math.pow(2, 32));

	// Generate a random 32-bit integer for low bits
	let low = Math.floor(Math.random() * Math.pow(2, 32));

	// Combine the high and low bits
	// Note: This representation is not a true 64-bit integer but a simulation
	let combined = high * Math.pow(2, 32) + low;

	return combined;
}