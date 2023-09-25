import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Bike } from "../../models/bike";
import { Customer } from "../../models/customer";
import { AdminService } from "../../services/admin.service";
import { SearchService } from "../../services/search.service";
import { TransactionService } from "../../services/transaction.service";
import { AlertService } from '../../services/alert.service';


@Component({
    selector: 'app-new-bike-transaction',
    templateUrl: './new-bike-transaction.component.html',
    styleUrls: ['./new-bike-transaction.component.css', '../../app.component.css']
})
export class NewBikeTransactionComponent implements OnInit {

    transactionForm: FormGroup;
    bike: Bike = new Bike();


    constructor(
        private router: Router,
        private adminService: AdminService,
        private searchService: SearchService,
        private transactionService: TransactionService,
        private alertService: AlertService
    ) {

    }

    ngOnInit(): void {
        this.transactionForm = new FormGroup({
            bike_model: new FormControl('', [
                Validators.required
            ]),
            bike_size: new FormControl('', [
                Validators.required,
                Validators.pattern('[1-9][0-9]')
            ]),
            bike_color: new FormControl('', [
                Validators.required
            ])
        })
    }



    /**
     * Finds head mechanic user, converts to customer, 
     * creates new transaction w/ bike
     */
    async submitTransaction(): Promise<void> {
        // get head mechanic user
        const hm_user = await this.adminService.getUsers()
            .then(users => users.find(user => user.roles.includes('head_mechanic')))

        if (!hm_user) {
            this.alertService.error(
                "No head mechanic found",
                "No head mechanic found. Please ask an admin to mark a user as head mechanic",
                0, true)
            this.router.navigate(['/transactions']);
            return
        }

        // search for customer matching email
        let hm_customer = await this.searchService.customerSearch(hm_user.username).toPromise()
            .then(customers => customers[0])

        const bike = new Bike();
        bike.make = 'Retrospec'
        bike.model = this.transactionForm.value['bike_model']
        bike.description = this.transactionForm.value['bike_size'] + " / " +
            this.transactionForm.value['bike_color']

        if (!hm_customer) {
            hm_customer = new Customer()
            new Customer();
            hm_customer.email = hm_user.email;
            hm_customer.first_name = hm_user.first_name;
            hm_customer.last_name = hm_user.last_name;
        }

        this.transactionService.createTransaction('retrospec', hm_customer)
            .then(trans => {
                this.transactionService.addNewBikeToTransaction(trans._id, bike);
                return trans._id;
            })
            .then((trans_id) => this.router.navigate(['/transactions', trans_id]));
    }
}
