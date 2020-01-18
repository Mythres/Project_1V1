package handler

import (
  "encoding/json"
  jwt "github.com/dgrijalva/jwt-go"
  f "github.com/fauna/faunadb-go/faunadb"
  "net/http"
  "os"
  "regexp"
  "strings"
  "time"
)

type updateInformation struct {
  Username *string `json:"username" fauna:"username"`
  Email *string `json:"email" fauna:"email"`
  PasswordHash *string `json:"passwordHash" fauna:"password"`
}

type jwtClaims struct {
  Username string `json:"username"`
  Email string `json:"email"`
  jwt.StandardClaims
}

type response struct {
  Success bool `json:"success"`
  Token string `json:"token"`
  ErrorMsg string `json:"errorMsg"`
}

func Handler(rw http.ResponseWriter, r *http.Request) {
  authHeader := r.Header.Get("Authorization")

  if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
    rw.Header().Set("WWW-Authenticate", "Bearer realm=\"update account info\"")
    http.Error(rw, "Missing access token", http.StatusUnauthorized)
    return
  }

  tokenString := strings.SplitN(authHeader, " ", 2)[1]
  claims, err := parseJwtToken(tokenString)

  if err != nil {
    rw.Header().Set("WWW-Authenticate", "Bearer realm=\"update account info\"")
    http.Error(rw, "Invalid access token", http.StatusUnauthorized)
    return
  }

  d := json.NewDecoder(r.Body)
  d.DisallowUnknownFields()

  var data updateInformation
  err = d.Decode(&data)

  if handleError(&rw, err, http.StatusBadRequest) {
    return
  }

  if data.Username == nil || data.Email == nil || data.PasswordHash == nil {
    http.Error(rw, "JSON object is incomplete", http.StatusBadRequest)
    return
  }

  client := f.NewFaunaClient(os.Getenv("FAUNADB_SECRET"))
  var resp response

  if *data.Username != claims.Username {
    res, reason, err := validateUsername(data.Username, client)

    if handleError(&rw, err, http.StatusInternalServerError) {
      return
    }
    if !res {
      resp = response{
        false,
        "",
        reason,
      }

      e := json.NewEncoder(rw)
      err = e.Encode(&resp)
      _ = handleError(&rw, err, http.StatusInternalServerError)
      return
    }
  }

  if *data.Email != claims.Email  {
    res, reason, err := validateEmail(data.Email, client)

    if handleError(&rw, err, http.StatusInternalServerError) {
      return
    }
    if !res {
      resp = response{
        false,
        "",
        reason,
      }

      e := json.NewEncoder(rw)
      err = e.Encode(&resp)
      _ = handleError(&rw, err, http.StatusInternalServerError)
      return
    }
  }

  updatedValues := getUpdatedValues(claims, &data)

  res, err := client.Query(
    f.Update(
      f.Select(
        "ref",
        f.Get(
          f.MatchTerm(
            f.Index("users_by_username"),
            claims.Username,
          ),
        ),
      ),
      updatedValues,
    ),
  )

  if handleError(&rw, err, http.StatusInternalServerError) {
    return
  }

  var userData updateInformation
  err = res.At(f.ObjKey("data")).Get(&userData)

  if handleError(&rw, err, http.StatusInternalServerError) {
    return
  }

  tokenString, err = generateJwtToken(&userData)

  if handleError(&rw, err, http.StatusInternalServerError) {
    return
  }

  resp = response{
    Success:  true,
    Token: tokenString,
    ErrorMsg: "",
  }

  e := json.NewEncoder(rw)
  err = e.Encode(&resp)

  _ = handleError(&rw, err, http.StatusInternalServerError)

  return
}

func parseJwtToken(tokenString string) (*jwtClaims, error) {
  pubKey, err :=
    jwt.ParseRSAPublicKeyFromPEM([]byte(strings.ReplaceAll(os.Getenv("JWT_PUBLIC"), `\n`, "\n")))

  if err != nil {
    return &jwtClaims{}, err
  }

  token, err := jwt.ParseWithClaims(tokenString, &jwtClaims{}, func(token *jwt.Token) (interface{}, error) {
    return pubKey, nil
  })

  if err != nil {
    return &jwtClaims{}, err
  }

  if claims, ok := token.Claims.(*jwtClaims); ok && token.Valid {
    return claims, nil
  } else {
    return &jwtClaims{}, err
  }
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

func getUpdatedValues(claims *jwtClaims, data *updateInformation) f.Obj {
  updatedValues := f.Obj{
     "data": f.Obj{},
  }

  if claims.Username != *data.Username {
    updatedValues["data"].(f.Obj)["username"] = *data.Username
  }
  if claims.Email != *data.Email {
    updatedValues["data"].(f.Obj)["email"] = *data.Email
  }
  if len(*data.PasswordHash) > 0 {
    updatedValues["data"].(f.Obj)["password"] = *data.PasswordHash
  }

  return updatedValues
}

func generateJwtToken(data *updateInformation) (tokenString string, err error) {
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
