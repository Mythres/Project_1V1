import {AuthStatus} from "./AuthStatus";
import {GetMatchResponse} from "./GetMatchResponse";

export interface GetMatchResult {
  success: boolean
  authStatus: AuthStatus
  data: GetMatchResponse
}
