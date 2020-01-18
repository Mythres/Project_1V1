import {AuthCredentials} from "./AuthCredentials";

export interface LoginResult {
  success: boolean;
  errorMsg: string;
  credentials: AuthCredentials;
}
