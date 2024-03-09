const batchQueue = require('../batcher.js');
const dataSpec = require('../dungeon.js');
const { generate } = require('make-mp-data');
const u = require('ak-tools');
require('dotenv').config({ path: "../.env", debug: true, "encoding": "utf8" });

/** @typedef {import('../types.js').BatchRequestConfig} BatchReqConfig */
/** @typedef {import('../types.js').Dungeon} DungeonConfig */


const MPARTICLE_API_KEY = process.env.MPARTICLE_API_KEY;
const MPARTICLE_API_SECRET = process.env.MPARTICLE_API_SECRET;
const MPARTICLE_EVENT_ENDPOINT = `https://s2s.mparticle.com/v2/bulkevents`
const MIXPANEL_USERS_ENDPOINT = `https://api.mixpanel.com/engage`

// ? https://developers.Mixpanel.io/reference/bulk-track

async function main(spec = dataSpec) {
	console.log("\nGenerating Mixpanel data...\n\n");
	const data = await generate(spec);
	const { eventData, userProfilesData } = data;

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


	const mixpanelUsers = userProfilesData.map(user => {
		const mpUser = {
			$distinct_id: user.distinct_id,
			$token: MPARTICLE_API_KEY,
			$ip: 0
		};
		delete user.distinct_id;		
		mpUser.$set = { ...user };
		return mpUser;
	});

	const usersJobConfig = {
		url: MIXPANEL_USERS_ENDPOINT,
		data: mixpanelUsers,
		batchSize: 200,
		concurrency: 5,	
	};

	console.log(`\nsending ${u.comma(mixpanelUsers.length)} users to Mixpanel...\n`);
	const userResponses = await batchQueue(usersJobConfig);
	console.log(`\n... sent ${u.comma(mixpanelUsers.length)} users to Mixpanel.`);

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

