import {Injectable} from '@angular/core';
import {saveAs} from 'file-saver';
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import {CONFIG} from '../config';

@Injectable()
export class AnalyticsService {

  constructor(private http: Http) {}

  private static jwt() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.token) {
      const headers = new Headers({ 'x-access-token': currentUser.token });
      return new RequestOptions({ headers: headers });
    }
  }

  private handleError(err): void {
    console.log('ERROR');
    console.log(err);
  }

  /**
   * Saves a file, given a Blob of content
   * @param blobContent: Blob to save
   * @param filename: filename to save as
   */
  private saveFile(blobContent: Blob, filename: string) {
    const blob = new Blob([blobContent], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  }

  /**
   * Extracts filename from backend response. Expects Content-disposition header
   * @param res: angular response from backend
   */
  private extractFilename(res: Response) {
    const contentDisposition = res.headers.get('Content-disposition');
    // regex to extract filename
    const matches = /filename=([^;]+)/ig.exec(contentDisposition);
     return (matches[1] || 'untitled').trim();
  }

  /**
   * Gets transactions from the backend between start and end. A csv file is returned and downloaded.
   * @param start: start Date for transaction interval
   * @param end: end Date for transaction interval
   */
  getTransactionData(start: Date, end: Date) {
    const url = `${CONFIG.api_url}/analytics/transactions/daterange/?start=${start.getTime()}&end=${end.getTime()}`;
    return this.http.get(url, AnalyticsService.jwt())
      .toPromise()
      .then(res => {
        const filename = this.extractFilename(res);
        this.saveFile(res.blob(), filename);
      }).catch(err => this.handleError(err));
  }

  /**
   * Gets employee productivity metrics from the backend, tallied between start and end. A csv file is returned and downloaded.
   * @param start: start Date for tallying
   * @param end: end Date for tallying
   */
  getAllEmployeeMetrics(start: Date, end: Date) {
    const url = `${CONFIG.api_url}/analytics/employees/groupmetrics/?start=${start.getTime()}&end=${end.getTime()}`;
    return this.http.get(url, AnalyticsService.jwt())
      .toPromise()
      .then(res => {
        const filename = this.extractFilename(res);
        this.saveFile(res.blob(), filename);
      }).catch(err => this.handleError(err));
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
