import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import mixpanel from 'mixpanel-browser';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {

	// INITIALIZE
	mixpanel.init('5daeef21e81cce2d44e4248d5e70a926', {
      debug: true,
      ignore_dnt: true,
      ip: true,
	  persistence: 'localStorage',
	  verbose: true,
	  batch_flush_interval_ms: 0,
      loaded: function (mixpanel) {
        console.log('mixpanel user id:', mixpanel.get_distinct_id());
      },
    });

	// EVENTS!
    mixpanel.track(
      'Hello Mixpanel!',
      { $source: 'ionic!', foo: 'bar' },
      (response) => {
		if (response === 0)	console.log('\t/track error')
		if (response === 1)	console.log('\t/track success')
      }
    );
  }

}
