const batchQueue = require('ak-fetch');
const dataSpec = require('../dungeon.js');
const { generate } = require('make-mp-data');
const u = require('ak-tools');
require('dotenv').config({ path: "../.env", debug: false, "encoding": "utf8", override: false });
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);


/** @typedef {import('ak-fetch').BatchRequestConfig} BatchReqConfig */
/** @typedef {import('../types').Dungeon} DungeonConfig */

// const GA4_ENDPOINT = `https://www.google-analytics.com/debug/mp/collect`;
const GA4_ENDPOINT = `https://www.google-analytics.com/mp/collect`;
const GA4_API_SECRET = process.env.GA4_API_SECRET;
const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID;



/**
 * this will generate generic events and user profiles
 * then it will convert them to GA4 format
 * then it sends them to GA4 using measurement protocol
 * ? https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag
 * @param  {DungeonConfig} spec=dataSpec
 */
async function main(spec = dataSpec) {
	console.log("\nGenerating GA4 data...\n\n");

	const data = await generate(spec);
	const { eventData, userProfilesData } = data;

	const ga4Events = eventData.map(e => {
		const { time, event, ...rest } = e;
		const unixTime = dayjs.utc(time).valueOf();
		const ga4Event = {
			"name": event.replace(/ /g, "_"),
			"params": {
				"debug_mode": true,
				engagement_time_msec: u.rand(1000, 10000),
			},
			"timestamp_micros": (unixTime * 1_000).toString(),
		};

		loopProps: for (const key in rest) {
			if (key === "cart") continue loopProps;
			const value = rest[key];
			let ga4Key = key
				.replace(/ /g, "_")
				.replace(/\$/g, "")
				.replace(/[^\w\s]/gi, "");
			ga4Event.params[ga4Key] = value;
		}
		return ga4Event;

	});

	const ga4UserProfiles = userProfilesData.map(u => {
		const { distinct_id: user_id, ...rest } = u;
		const ga4User = {
			"client_id": "abc-123-xyz-456",
			"user_id": user_id,
			"user_properties": {
			}
		};

		loopProps: for (const key in rest) {
			if (key === "cart") continue loopProps;
			const propVal = u[key];
			const propType = typeof propVal;
			let actualVal;

			switch (propType) {
				case "string":
					actualVal = propVal;
					break;
				case "number":
					actualVal = propVal.toString();
					break;
				case "boolean":
					actualVal = propVal.toString();
					break;
				default:
					continue loopProps;
			}

			let ga4Key = key
				.replace(/ /g, "_")
				.replace(/\$/g, "")
				.replace(/[^\w\s]/gi, "");
			ga4User.user_properties[ga4Key] = { value: actualVal };
		}
		return ga4User;
	});

	// group events by user_id
	const eventsByUser = ga4Events.reduce((acc, event) => {
		const userId = event.params?.user_id;
		if (!acc[userId]) acc[userId] = [];
		acc[userId].push(event);
		return acc;
	}, {});

	const requests = [];
	for (const [userId, events] of Object.entries(eventsByUser)) {
		let req = {
			"client_id": "123456789.987654321",
			"user_id": userId,
			events: []
		};
		for (const event of events) {
			req.events.push(event);
			if (req.events.length === 25) {
				requests.push(req);
				req = {
					"client_id": "123456789.987654321",
					"user_id": userId,
					events: []
				};
			}
		}
		// Push the last batch if it has any events
		if (req.events.length > 0) {
			requests.push(req);
		}
	}


	/** @type {BatchReqConfig} */
	const eventsJobConfig = {
		url: GA4_ENDPOINT,
		data: requests,
		batchSize: 0,
		dryRun: false,
		concurrency: 10,
		searchParams: {
			api_secret: GA4_API_SECRET,
			measurement_id: GA4_MEASUREMENT_ID
		}
	};

	/** @type {BatchReqConfig} */
	const userJobConfig = {
		url: GA4_ENDPOINT,
		data: ga4UserProfiles,
		batchSize: 0,
		dryRun: false,
		concurrency: 10,
		searchParams: {
			api_secret: GA4_API_SECRET,
			measurement_id: GA4_MEASUREMENT_ID
		}
	};

	console.log(`sending ${u.comma(ga4Events.length)} events to GA4...\n\n`);
	const eventResponses = await batchQueue(eventsJobConfig);
	console.log(`\n\nsent ${u.comma(ga4Events.length)} events to GA4...\n\n`);
	console.log(`sending ${u.comma(ga4UserProfiles.length)} user profiles to GA4...\n\n`);
	const userResponses = await batchQueue(userJobConfig);
	console.log(`\n\nsent ${u.comma(ga4UserProfiles.length)} user profiles to GA4...\n\n`);



	return {
		events: eventResponses,
		users: userResponses
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

