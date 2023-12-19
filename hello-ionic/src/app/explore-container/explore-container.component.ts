import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import mixpanel from 'mixpanel-browser';
mixpanel.init('6ebe0a4fe373712a9dea3fa4b069b224', {
	debug: true,
	ignore_dnt: true,
	ip: true,
	persistence: 'localStorage',
	verbose: true,
	batch_flush_interval_ms: 0
  });


@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
  imports: [IonicModule],
  standalone: true,
})
export class ExploreContainerComponent {
  @Input() name?: string;

  onButtonClick(event: MouseEvent) {
    const button = event.target as HTMLIonButtonElement;
    // Access properties of the button, e.g., button.fill
    mixpanel.track("click!", { buttonFill: button.fill, buttonText: button.textContent });
  }
}
