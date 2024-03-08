const batchQueue = require('../batcher.js');
const dataSpec = require('../spec.js');
const { generate } = require('make-mp-data');
const u = require('ak-tools');
require('dotenv').config({ path: "./" });

// ? https://www.docs.developers.amplitude.com/analytics/apis/http-v2-api/#upload-request
async function main() {
	console.log("\nGenerating Amplitude data...\n\n");
	const data = await generate(dataSpec);
	const { eventData, userProfilesData } = data;
	const AMP_EVENTS_ENDPOINT = `https://api.amplitude.com/2/httpapi`;
	const AMP_USERS_ENDPOINT = `https://api2.amplitude.com/identify`;
	const AMP_API_KEY = process.env.AMPLITUDE_API_KEY;
	const amplitudeEvents = eventData.map(event => {
		const ampEvent = {
			user_id: event.distinct_id,
			event_type: event.event,
			...event,
		};
		delete ampEvent.distinct_id;
		delete ampEvent.event;
		delete ampEvent.$source;
		return ampEvent;
	});

	const eventsJobConfig = {
		url: AMP_EVENTS_ENDPOINT,
		data: amplitudeEvents,
		batchSize: 100,
		concurrency: 10,
		bodyParams: {
			api_key: AMP_API_KEY,
			dataKey: "events",
		},
	};

	console.log(`sending ${u.comma(amplitudeEvents.length)} events to Amplitude...\n`);
	const eventResponses = await batchQueue(eventsJobConfig);
	const eventsSent = eventResponses.reduce((acc, res) => acc + res.events_ingested, 0);
	console.log(`\n... sent ${u.comma(eventsSent)} events to Amplitude.`);

	
	const amplitudeUsers = userProfilesData.map(user => {
		const ampUser = {
			user_id: user.distinct_id,
		};
		delete user.distinct_id;
		delete user.$source;
		ampUser.user_properties = { ...user };
		return ampUser;
	});

	const usersJobConfig = {
		url: AMP_USERS_ENDPOINT,
		data: amplitudeUsers,
		batchSize: 10,
		concurrency: 2,
		contentType: 'application/x-www-form-urlencoded',
		bodyParams: {
			api_key: AMP_API_KEY,
			dataKey: "identification"
		}
	};

	console.log(`\nsending ${u.comma(amplitudeUsers.length)} users to Amplitude...\n`);
	const userResponses = await batchQueue(usersJobConfig);
	const usersSent = userResponses.reduce((acc, res) => acc + res.events_ingested, 0);
	console.log(`\n... sent ${u.comma(amplitudeUsers.length)} events to Amplitude.`);


	debugger;
}



main().then(console.log).catch(console.error).finally(() => console.log("Done."));