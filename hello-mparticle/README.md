# hello-mparticle
 
### links

- Free Account (14 day trial):
https://app.us2.mparticle.com/login?return=

(contact AK if you need a test account)

- SDK docs:
https://docs.mparticle.com/developers/sdk/web/event-tracking/

- Bulk Import:
https://docs.mparticle.com/developers/server/http/#upload-multiple-event-batches
https://docs.mparticle.com/developers/server/json-reference/


### sdk setup

```bash
npm run start
```

- edit your `MPARTICLE_API_KEY` in `index.html`

- navigate to http://localhost:3000


### bulk import

```bash
MPARTICLE_API_KEY=your-api-key MPARTICLE_API_SECRET=your-api-secret npm run import
```