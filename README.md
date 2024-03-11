# 👋 hello-mixpanel

<img src="https://aktunes.neocities.org/hello-mixpanel.gif" />

this repo implements 'hello world' and bulk imports for many common SaaS analytics tools like Mixpanel, Amplitude, Google Analytics, Heap, Pendo, etc...

each tool has its own `hello-` folder, and each folder has its own readme with instructions for setting up the SDK and bulk importing data.

you can use this repo to test out different analytics tools, or to compare how different tools implement the same basic functionality; you will need to provide your own APIs key; many of the tools offer free trials... i like to use a temporary inbox for to sign up for these trials, like [temp-mail](https://temp-mail.org/en/)

### usage

- cloning the repo

```bash
git clone https://github.com/ak--47/hello-mixpanel.git
cd hello-mixpanel
```

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

in most cases, you will run imports with:

```bash
npm run import
```

from within the folder of the tool you are interested importing data in. see the readme in each tool's folder for the details/links you need to create accounts, get API keys, and run the import script.

to import data, you will usually need to provide some kind of token or key you can either specify the API key as an environment variable:

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

### customizing the data

there is a file `dungeon.js` in the top level of the repo that contains the 'spec' for the events and properties that get generated; feel free to modify this to customize the sample data.

```javascript
/** event properties should be an array or a function reference */
const events = [
  {
    event: "hello world",
    weight: 1,
    isFirstEvent: true,
    properties: {
      feeling: ["sleepy", "happy", "sad", "angry", "confused"],
    },
  },
  {
    event: "goodbye world",
    weight: 4,
    properties: {
      luckyNumber: [1, 2, 42, 420],
    },
  },
];

/** super properties go on every event */
const superProps = {
  platform: ["app", "web"],
  device: ["desktop", "laptop", "tablet", "phone"],
};

/** user properties are also arrays or functions which return arrays */
const userProps = {
  spiritAnimal: () => {
    return ["🦄", "🐻", "🐍"];
  },
};

/** job config ditcates how many things... */
const config = {
  seed: "foo bar baz", //seed for random number generator
  numDays: 30, //how many days worth of data
  numEvents: 10000, //how many events
  numUsers: 250, //how many users
  events,
  superProps,
  userProps,
  //etc...
};
```
