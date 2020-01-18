package handler

import (
  "encoding/json"
  jwt "github.com/dgrijalva/jwt-go"
  f "github.com/fauna/faunadb-go/faunadb"
  "net/http"
  "os"
  "strings"
  "time"
)

type loginInformation struct {
  Username *string `json:"username"`
  PasswordHash *string `json:"passwordHash"`
}

type user struct {
  Username *string `fauna:"username"`
  Email *string `fauna:"email"`
  Password *string `fauna:"password"`
}

type jwtToken struct {
  Token string `json:"token"`
}

func Handler(rw http.ResponseWriter, r *http.Request) {
  d := json.NewDecoder(r.Body)
  d.DisallowUnknownFields()

  var data loginInformation
  err := d.Decode(&data)

  if handleError(&rw, err, http.StatusBadRequest) {
    return
  }
  if data.Username == nil || data.PasswordHash == nil {
    http.Error(rw, "JSON object is incomplete", http.StatusBadRequest)
    return
  }

  client := f.NewFaunaClient(os.Getenv("FAUNADB_SECRET"))

  res, err := client.Query(
    f.Get(
      f.MatchTerm(
        f.Index("users_by_username_password"),
        f.Arr{data.Username, data.PasswordHash},
      ),
    ),
  )

  var responseToken jwtToken

  if err != nil {

    responseToken = jwtToken{
      Token: "",
    }

    e := json.NewEncoder(rw)
    err := e.Encode(&responseToken)

    _ = handleError(&rw, err, http.StatusBadRequest)

    return
  }

  var user user
  err = res.At(f.ObjKey("data")).Get(&user)

  if handleError(&rw, err, http.StatusInternalServerError) {
    return
  }

  tokenString, err := generateJwtToken(&user)

  if handleError(&rw, err, http.StatusInternalServerError) {
    return
  }

  responseToken = jwtToken{
    Token: tokenString,
  }

  e := json.NewEncoder(rw)
  err = e.Encode(&responseToken)

  _ = handleError(&rw, err, http.StatusInternalServerError)

  return
}

func generateJwtToken(data *user) (tokenString string, err error) {
  genToken := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
    "username": data.Username,
    "email": data.Email,
    "exp":  time.Now().Add(15 * time.Minute).Unix(),
  })

  secret, err :=
    jwt.ParseRSAPrivateKeyFromPEM([]byte(strings.ReplaceAll(os.Getenv("JWT_PRIVATE"), `\n`, "\n")))

  if err != nil {
    return "", err
  }

  tokenString, err = genToken.SignedString(secret)

  if err != nil {
    return "", err
  }

  return tokenString, nil
}

func handleError(rw *http.ResponseWriter, err error, status int) bool {
  if err != nil {
    http.Error(*rw, err.Error(), status)
    return true
  }

  return false
}
