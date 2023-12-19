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
    mixpanel.init('6ebe0a4fe373712a9dea3fa4b069b224', {
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

    // STATE!
    mixpanel.register({ $source: 'ionic!' });

    // EVENTS!
    mixpanel.track('Hello Mixpanel!', { foo: 'bar' }, (response) => {
      if (response === 0) console.log('\t/track error');
      if (response === 1) console.log('\t/track success');
    });
  }
}
