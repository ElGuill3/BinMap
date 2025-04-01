import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet} from '@ionic/angular/standalone';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, ToolbarComponent],
})
export class AppComponent {
  constructor() {}
}
