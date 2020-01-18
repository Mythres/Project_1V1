import {AuthCredentials} from "./AuthCredentials";

export interface UpdateAccountResult {
  success: boolean;
  errorMsg: string;
  credentials: AuthCredentials;
}
