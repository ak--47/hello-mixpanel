# hello-mixpanel

this repo implements 'hello world' for many common SaaS analytics tools like Mixpanel, Amplitude, Google Analytics, Heap, Pendo, etc...

each tool has its own folder, and each folder has its own README.md with instructions for setting up the SDK and bulk importing data.

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


### adding keys