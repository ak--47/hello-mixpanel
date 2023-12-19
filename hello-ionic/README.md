# Hello Mixpanel with Ionic

this is a demo application which uses [`mixpanel-browser`](https://www.npmjs.com/package/mixpanel-browser) inside an ionic (angular) app to track events.

## Demo

<a href="https://youtu.be/MXN91w8u26E"><img src="https://aktunes.neocities.org/ionic.png" alt="mixpanel ionic demo"/></a>

## Quickstart

- Install Dependencies

```bash
npm install --save mixpanel-browser@latest
npm install --save-dev @types/mixpanel-browser@latest
```

- Initialize Mixpanel

```javascript
mixpanel.init("YOUR_MIXPANEL_TOKEN", {
  debug: true, // development mode
  persistence: "localStorage", // or 'cookie'
  batch_flush_interval_ms: 0, // batch events immediately; not recommended for production
  loaded: function (mixpanel) {
    console.log("mixpanel loaded; current $device_id is:", mixpanel.get_distinct_id());
  },
});
```

- Track Events

```javascript
mixpanel.track("Hello Mixpanel!", { foo: "bar" }, (response) => {
  if (response === 0) console.log("\t/track error");
  if (response === 1) console.log("\t/track success");
});
```

- Set Application State

```javascript
//sent app name = AK's app with all future events
mixpanel.register({ "app name": "AK's app" });
```

- Identify Users

```javascript
mixpanel.identify("UNIQUE USER ID");
```

- Set People Properties

```javascript
mixpanel.people.set({$name: "AK", $email: "ak@mixpanel.com"})
mixpanel.identify("ak-123");
```




