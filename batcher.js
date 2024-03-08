const RunQueue = require("run-queue");
const fetch = require("fetch-retry")(global.fetch);
const u = require("ak-tools");
const readline = require('readline');
const querystring = require('querystring');

async function makePostRequest(url, data, searchParams = null, contentType = 'application/json', bodyParams) {
	if (!url) return Promise.resolve("No URL provided");
	if (!data) return Promise.resolve("No data provided");

	let requestUrl = new URL(url);
	if (searchParams) {
		let params = new URLSearchParams(searchParams);
		requestUrl.search = params;
	}

	try {
		const request = {
			method: "POST",
			headers: {
				"Content-Type": contentType,
			},
			searchParams: searchParams,
			retries: 3,
			retryDelay: 1000,
			retryOn: [429, 500, 502, 503, 504],
		};

		let payload;

		if (contentType === 'application/x-www-form-urlencoded') {
			payload = { [bodyParams["dataKey"]]: JSON.stringify(data), ...bodyParams };
			delete payload.dataKey;
			request.body = querystring.stringify(payload);
		}

		else if (bodyParams) {
			payload = { [bodyParams["dataKey"]]: data, ...bodyParams };
			request.body = JSON.stringify(payload);
		}

		else {
			request.body = JSON.stringify(data);
		}
		const response = await fetch(requestUrl, request);

		  // Check for non-2xx responses and log them
		  if (!response.ok) {
            console.error('Response Status:', response.status);
            console.error('Response Text:', await response.text());
			debugger;          
        }

		let responseBody = await response.text();
		if (u.isJSONStr(responseBody)) return JSON.parse(responseBody);
		else return responseBody;
		
		return responseData;

	} catch (error) {
		console.error("Error making POST request:", error);
		console.error("Data:", data);
		throw error; // Important to propagate the error to the queue
	}
}

function batchData(data, batchSize, bodyParams = null) {
	const batches = [];
	for (let i = 0; i < data.length; i += batchSize) {
		let batch = data.slice(i, i + batchSize);
		batches.push(batch);
	}
	return batches;
}

/**
 * @typedef {Object} JobConfig - The configuration object for the batch request job.
 * @property {string} url - The URL of the API endpoint.
 * @property {Object[]} data - An array of data objects to be sent in the requests.
 * @property {number} batchSize - The number of records to be sent in each batch.
 * @property {number} concurrency - The level of concurrency for the requests.
 * @property {Object | null} searchParams - An object representing the search parameters to be appended to the URL.
 */

/**
 * A function to send a batch of POST requests to an API endpoint.
 * @param  {JobConfig} PARAMS
 * @returns {Promise<Object[]>} - An array of responses from the API.
 * @example
 * const jobConfig = { url: "https://api.example.com", data: [{...}, {...}], searchParams: {verbose: "1"} };
 * const responses = await main(jobConfig);
 * 
 * 
 */
async function main(PARAMS) {
	const {
		url = "",
		batchSize = 100,
		concurrency = 10,
		data = null,
		bodyParams = null,
		searchParams = null,
		contentType = 'application/json'  //'application/x-www-form-urlencoded'
	} = PARAMS;

	const queue = new RunQueue({
		maxConcurrency: concurrency,
	});

	const batches = batchData(data, batchSize);
	const totalReq = batches.length;
	const responses = [];

	batches.forEach((batch, index) => {
		queue.add(0, async () => {
			const response = await makePostRequest(url, batch, searchParams, contentType, bodyParams);
			responses.push(response);

			// Progress bar
			readline.cursorTo(process.stdout, 0);
			const msg = `completed ${u.comma(index + 1)} of ${u.comma(totalReq)} requests    ${Math.floor((index + 1) / totalReq * 100)}%`.trim();
			process.stdout.write(`\t${msg}\t`);
		});
	});

	try {
		await queue.run();
		console.log("All batches have been processed.");
		return responses;
	} catch (error) {
		console.error("An error occurred:", error);
		throw error; // Important to propagate the error for handling outside the function
	}
}

module.exports = main;
