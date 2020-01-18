package handler

import (
  "encoding/json"
  f "github.com/fauna/faunadb-go/faunadb"
  "golang.org/x/crypto/bcrypt"
  "net/http"
  "os"
  "regexp"
)

type registerInformation struct {
  Username *string `json:"username"`
  Email *string `json:"email"`
  Password *string `json:"password"`
}

type response struct {
  Success bool `json:"success"`
  ErrorMsg string `json:"errorMsg"`
}

func Handler(rw http.ResponseWriter, r *http.Request) {
  d := json.NewDecoder(r.Body)
  d.DisallowUnknownFields()

  var data registerInformation
  err := d.Decode(&data)

  if handleError(&rw, err, http.StatusBadRequest) {
    return
  }

  if data.Username == nil || data.Email == nil || data.Password == nil {
    http.Error(rw, "JSON object is incomplete", http.StatusBadRequest)
    return
  }

  client := f.NewFaunaClient(os.Getenv("FAUNADB_SECRET"))
  var resp response

  res, reason, err := validateUsername(data.Username, client)

  if handleError(&rw, err, http.StatusInternalServerError) {
    return
  }
  if !res {
    resp = response{
      false,
      reason,
    }
  } else {
    res, reason, err = validateEmail(data.Email, client)

    if handleError(&rw, err, http.StatusInternalServerError) {
      return
    }
    if !res {
      resp = response{
        false,
        reason,
      }
    } else {
      hash, err := bcrypt.GenerateFromPassword([]byte(*data.Password), bcrypt.MinCost)
      if handleError(&rw, err, http.StatusInternalServerError) {
        return
      }

      hashString := string(hash)

      _, err = client.Query(
        f.Create(
          f.Ref("collections/Users"),
          f.Obj{
            "data": f.Obj{
              "username": data.Username,
              "email":    data.Email,
              "password": hashString,
            },
          },
        ),
      )

      if handleError(&rw, err, http.StatusInternalServerError) {
        return
      }

      resp = response{
        Success:  true,
        ErrorMsg: "",
      }
    }
  }

  e := json.NewEncoder(rw)
  err = e.Encode(&resp)

  _ = handleError(&rw, err, http.StatusInternalServerError)

  return
}

func handleError(rw *http.ResponseWriter, err error, status int) bool {
  if err != nil {
    http.Error(*rw, err.Error(), status)
    return true
  }

  return false
}

func validateUsername(username *string, client *f.FaunaClient) (value bool, reason string, err error) {
  res, err := client.Query(
    f.Paginate(
      f.MatchTerm(
        f.Index("users_by_username"),
        *username,
      ),
    ),
  )

  if err != nil {
    return false, "", err
  }

  var matches []interface{}
  err = res.At(f.ObjKey("data")).Get(&matches)

  if err != nil {
    return false, "", err
  }

  if len(matches) != 0 {
    return false, "Username already exists", nil
  }

  return true,  "", nil
}

func validateEmail(email *string, client *f.FaunaClient) (value bool, reason string, err error) {
  matched, err := regexp.MatchString(`^[^\s@]+@[^\s@]+\.[^\s@]+$`, *email)

  if err != nil {
    return false, "", err
  }

  if !matched {
    return false, "Invalid email address", nil
  }

  res, err := client.Query(
    f.Paginate(
      f.MatchTerm(
        f.Index("users_by_email"),
        *email,
      ),
    ),
  )

  if err != nil {
    return false, "", err
  }

  var matches []interface{}
  err = res.At(f.ObjKey("data")).Get(&matches)

  if err != nil {
    return false, "", err
  }

  if len(matches) != 0 {
    return false, "This email address is already in use", nil
  }

  return true, "", nil
}
