import { Injectable } from '@angular/core';
import {Http, URLSearchParams, RequestOptions} from "@angular/http";
import {Observable} from "rxjs";
import {Customer} from "../models/customer";
import {Repair} from "../models/repair";

@Injectable()
export class SearchService {

  private customerUrl: string = 'http://localhost:5000/api/customer';
  private repairUrl: string = 'http://localhost:5000/api/repair';

  constructor(private http: Http) {}

  customerSearch(field: string, term: string): Observable<Customer[]> {
    let filters = {"filters": [{"name": field, "op": "like", "val": `%${term}%`}]};
    let params = new URLSearchParams();
    let requestOptions = new RequestOptions();
    params.set('q', JSON.stringify(filters));
    requestOptions.params = params;
    return this.http.get(this.customerUrl, requestOptions)
      .map(res => res.json().objects as Customer[])
  }

  repairSearch(term: string): Observable<Repair[]> {
    let filters = {"filters": [{"name": "name", "op": "like", "val": `%${term}%`}]};
    let params = new URLSearchParams();
    let requestOptions = new RequestOptions();
    params.set('q', JSON.stringify(filters));
    requestOptions.params = params;
    return this.http.get(this.repairUrl, requestOptions)
      .map(res => res.json().objects as Repair[])
  }

}
