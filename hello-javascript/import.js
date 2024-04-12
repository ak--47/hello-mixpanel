const batchQueue = require('ak-fetch');
const dataSpec = require('../dungeon.js');
const { generate } = require('make-mp-data');
const u = require('ak-tools');
require('dotenv').config({ path: "../.env", debug: false, "encoding": "utf8" });

/** @typedef {import('ak-fetch').BatchRequestConfig} BatchReqConfig */
/** @typedef {import('../types.js').Dungeon} DungeonConfig */


const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN;
const MIXPANEL_EVENTS_ENDPOINT = `https://api.mixpanel.com/import`
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
		url: MIXPANEL_EVENTS_ENDPOINT,
		data: mixpanelEvents,
		batchSize: 2000,
		concurrency: 10,
		searchParams: {
			verbose: 1
		},
		headers: {
			authorization: `Basic ${Buffer.from(`${MIXPANEL_TOKEN}:`).toString('base64')}`,
			'Content-Type': 'application/json'
		},			
	};

	console.log(`sending ${u.comma(mixpanelEvents.length)} events to Mixpanel...\n`);
	const eventResponses = await batchQueue(eventsJobConfig);	
	console.log(`\n... sent ${u.comma(mixpanelEvents.length)} events to Mixpanel.`);


	const mixpanelUsers = userProfilesData.map(user => {
		const mpUser = {
			$distinct_id: user.distinct_id,
			$token: MIXPANEL_TOKEN,
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
		.finally(() => console.log(`\n\n\t... your lucky numbers are \t${u.rand(1, 42)} \t${u.rand(1, 42)} \t${u.rand(1, 42)}\n\n`));
}
else {
	module.exports = main;
}

