# hello-mixpanel

<img src="https://aktunes.neocities.org/hello-mixpanel.gif" />

this repo implements 'hello world' for many common SaaS analytics tools like Mixpanel, Amplitude, Google Analytics, Heap, Pendo, etc...

each tool has its own folder, and each folder has its own readme with instructions for setting up the SDK and bulk importing data.

you can use this repo to test out different analytics tools, or to compare how different tools implement the same basic functionality; you will need to provide your own APIs key; many of the tools offer free trials... i like to use a temporary inbox for to sign up for these trials, like [temp-mail](https://temp-mail.org/en/)

### usage

- cloning the repo

- install the dependencies (one time) with:
```bash
npm install
```

- boot up all the demos:
```bash
npm run start
```

- or you can boot up a single demo:
```bash
cd hello-mixpanel
npm run start
```
with the server alive, visit `http://localhost:3000` in your browser to see the demo.

### bulk importing data
many of SaaS tools in this repo support bulk importing of historical data; this is useful for demoing the tools with enough data to see the features in action.

to import data, you will need to provide your own API key, and then run the import script for the tool you are interested in. you can either specify the API key as an environment variable: 

```bash
cd hello-javascript
MIXPANEL_TOKEN=your-proj-token npm run import
```

or you can add it to a `.env` file in the root of the project that looks like:

```env
MIXPANEL_TOKEN=your-proj-token
AMPLITUDE_API_TOKEN=your-amp-token
AMPLITUDE_API_KEY=your-amp-api-key
GA4_MEASUREMENT_ID=your-ga4-measurement-id
HEAP_APP_ID=your-heap-app-id
```

the repo comes with a `.env.example` file that you can modify (and rename) to get started.

there is a file `dungeon.js` in the top level of the repo that contains the 'spec' for the events and properties that get generated; feel free to modify this to customize the sample data.

in most cases, you will run imports with:
```bash
npm run import
```
from within the folder of the tool you are interested importing data in. see the readme in each tool's folder for the details you need to create accounts, get API keys, and run the import script.


