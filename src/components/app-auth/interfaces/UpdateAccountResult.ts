import {AuthCredentials} from "./AuthCredentials";
import {AuthStatus} from "./AuthStatus";

export interface UpdateAccountResult {
  success: boolean;
  errorMsg: string;
  credentials: AuthCredentials;
  authStatus: AuthStatus;
}
