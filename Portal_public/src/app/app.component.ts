import { Component, NgZone } from '@angular/core';
import { Route, RouterEvent, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'patientportal';
  /**
   *
   */
  constructor(private router: Router, private ngZone: NgZone) {
    router.events.subscribe((event: RouterEvent) => {
      this._navigationInterceptor(event);
    });
  }

  private _navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.ngZone.runOutsideAngular(() => {
        // this.loaderService.start();
      });
    }
    if (event instanceof NavigationEnd) {
      window.scrollTo(0, 0);
      // this._hideSpinner();
    }
    if (event instanceof NavigationCancel) {
      // this._hideSpinner()
    }
    if (event instanceof NavigationError) {
      // this._hideSpinner();
    }
  }
}
