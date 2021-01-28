import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Observable } from 'rxjs/Observable';
import { CONFIG } from '../../config';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-navbar',
  templateUrl: 'navbar.component.html',
  styleUrls: ['navbar.component.css']
})
export class NavbarComponent implements OnInit {

  loggedIn: Observable<boolean>;
  isAdmin: Observable<boolean>;
  authUrl = `${CONFIG.cas_auth_url}?service=${CONFIG.service_url}`;

  // Number of inpatient bikes not completed
  incompleteInpatientCount = 0;
  // Number of inpatient bikes completed but not picked up
  incompleteWaitingPickupCount = 0;

  constructor(private auth: AuthenticationService, private router: Router,
    private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.loggedIn = this.auth.isLoggedIn;
    this.isAdmin = this.auth.isAdmin;
    /**
     * Get all incomplete transactions, including those waiting on pickup.
     * This allows us to count the number of bikes in the shop
     * 
     * We subscribe to the transaction status event, so that we can update this
     * count when a transaction is completed
     */
    this.analyticsService.transactionCompletedEvent.subscribe(x => {
      /**
       * The backend won't have updated the counts yet. 
       * Wait 500 ms before making request
       */
      setTimeout(() => {
        this.analyticsService.getBikeCounts().then(res => {
          console.log(res);
          this.incompleteInpatientCount = res.incomplete;
          this.incompleteWaitingPickupCount = res.complete;
        });
      }, 500);
    })
    // This triggers the subscription above to run
    this.analyticsService.notifyTransactionStatusChange("none");
  }

  logout() {
    this.auth.logout().then(() => window.location.href = 'https://idp.rice.edu/idp/profile/cas/logout');
  }

  /**
   * Checks if user is viewing the transactions window
   */
  viewingTransactions() {
    return this.router.url.includes('transactions')
  }
}
