/*
  Alert.ts: Model for alert (can be used for success, generally for error messages
 */
export class Alert {
  title: string;
  message: string;
  code: number;
  type: string; // success" or "error"
}
