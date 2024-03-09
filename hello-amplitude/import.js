const batchQueue = require('../batcher.js');
const dataSpec = require('../dungeon.js');
const { generate } = require('make-mp-data');
const u = require('ak-tools');
require('dotenv').config({ path: "../.env", debug: true, "encoding": "utf8"});

// ? https://www.docs.developers.amplitude.com/analytics/apis/http-v2-api/#upload-request
async function main(spec = dataSpec) {
	console.log("\nGenerating Amplitude data...\n\n");
	const data = await generate(spec);
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
	console.log(`\n... sent ${u.comma(amplitudeUsers.length)} events to Amplitude.`);

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
		.finally(() => console.log(`\n\n\t... your lucky numbers are ${u.rand(1, 42)} ${u.rand(1, 42)} ${u.rand(1, 42)}`));
}
else {
	module.exports = main;
}

