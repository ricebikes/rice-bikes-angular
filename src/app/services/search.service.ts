import { Injectable } from '@angular/core';
import {Http, URLSearchParams, RequestOptions} from "@angular/http";
import {Observable} from "rxjs";
import {Transaction} from "../models/transaction";
import {Customer} from "../models/customer";

@Injectable()
export class SearchService {

  private customerUrl: string = 'http://localhost:5000/api/customer';

  constructor(private http: Http) {}

  customerSearch(field: string, term: string): Observable<Transaction[]> {
    let filters = {"filters": [{"name": field, "op": "like", "val": `%${term}%`}]};
    let params = new URLSearchParams();
    let requestOptions = new RequestOptions();
    params.set('q', JSON.stringify(filters));
    requestOptions.params = params;
    return this.http.get(this.customerUrl, requestOptions)
      .map(res => res.json().objects as Customer[])
  }

}
