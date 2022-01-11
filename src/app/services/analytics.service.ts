import { Injectable} from '@angular/core';
import { saveAs } from 'file-saver';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { CONFIG } from '../config';
import { Subject } from 'rxjs';

@Injectable()
export class AnalyticsService {

  constructor(private http: Http) { }

  backendURL = `${CONFIG.api_url}/metrics`;
  public transactionCompletedEvent = new Subject<string>();

  private static jwt() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      const headers = new Headers({ 'x-access-token': currentUser.token });
      return new RequestOptions({ headers: headers });
    }
  }

  private static handleError(err): void {
    console.log('ERROR');
    console.log(err);
  }

  /**
   * Saves a file, given a Blob of content
   * @param res: response with data to save
   * @param filename: filename to save as
   * @param mimeType: type of file
   */
  private static saveFile(res, filename: string, mimeType: string) {
    const blob = new Blob([res._body], { type: mimeType });
    saveAs(blob, filename);
  }

  /**
   * Extracts filename from backend response. Expects Content-disposition header
   * @param res: angular response from backend
   */
  private static extractFilename(res: Response) {
    const contentDisposition = res.headers.get('Content-disposition');
    // regex to extract filename
    const reg = new RegExp('filename=(.*)');
    const matches = reg.exec(contentDisposition);
    return (matches[1] || 'untitled').trim();
  }


  /**
   * Gets a count of inpatient bikes, both those waiting to be picked up
   * and those not yet completed. No other bikes are included in these totals.
   */
  getBikeCounts() {
    return this.http.get(`${this.backendURL}/transactions/bike_count`, AnalyticsService.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => AnalyticsService.handleError(err));
  }

  /**
   * Notifies this service a transaction was completed or reopened
   * and that completed transaction counts must be updated
   * @param id: transaction string that was completed or reopened
   */
  notifyTransactionStatusChange(id: string) {
    this.transactionCompletedEvent.next(id);
  }

  /**
   * Gets transactions from the backend between start and end. A csv file is returned and downloaded.
   * @param start: start Date for transaction interval
   * @param end: end Date for transaction interval
   */
  getTransactionData(start: Date, end: Date) {
    const url = `${this.backendURL}/transactions/daterange?start=${start.getTime()}&end=${end.getTime()}`;
    return this.http.get(url, AnalyticsService.jwt())
      .toPromise()
      .then(res => {
        const filename = AnalyticsService.extractFilename(res);
        AnalyticsService.saveFile(res, filename, 'text/csv');
      }).catch(err => AnalyticsService.handleError(err));
  }

  /**
   * Gets employee productivity metrics from the backend, tallied between start and end. A csv file is returned and downloaded.
   * @param start: start Date for tallying
   * @param end: end Date for tallying
   */
  getAllEmployeeMetrics(start: Date, end: Date) {
    const url = `${this.backendURL}/employees/groupmetrics/?start=${start.getTime()}&end=${end.getTime()}`;
    return this.http.get(url, AnalyticsService.jwt())
      .toPromise()
      .then(res => {
        const filename = AnalyticsService.extractFilename(res);
        AnalyticsService.saveFile(res, filename, 'text/csv');
      }).catch(err => AnalyticsService.handleError(err));
  }

  /**
   * Checks to see if platform is supported for downloading files
   */
  checkSupport(): boolean {
    try {
      return !!new Blob;
    } catch (e) {
      return false;
    }
  }
}
