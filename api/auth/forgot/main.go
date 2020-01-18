package handler

import (
  cryptoRand "crypto/rand"
  "encoding/binary"
  "encoding/json"
  f "github.com/fauna/faunadb-go/faunadb"
  "golang.org/x/crypto/bcrypt"
  "math/rand"
  "net/http"
  "net/smtp"
  "os"
  "regexp"
  "strings"
  "time"
)

type forgotInformation struct {
  Email *string `json:"email"`
}

type user struct {
  Username string `fauna:"username"`
  Email string `fauna:"email"`
  Password string `fauna:"password"`
}

type response struct {
  Success bool `json:"success"`
  ErrorMsg string `json:"errorMsg"`
}

func Handler(rw http.ResponseWriter, r *http.Request) {
  seedRand(&rw)

  d := json.NewDecoder(r.Body)
  d.DisallowUnknownFields()

  var data forgotInformation
  err := d.Decode(&data)

  if handleError(&rw, err, http.StatusBadRequest) {
    return
  }

  if data.Email == nil {
    http.Error(rw, "JSON object is incomplete", http.StatusBadRequest)
    return
  }

  client := f.NewFaunaClient(os.Getenv("FAUNADB_SECRET"))
  var resp response

  res, reason, err := validateEmail(data.Email, client)

  if handleError(&rw, err, http.StatusInternalServerError) {
    return
  }

  if !res {
    resp = response{
      false,
      reason,
    }

    e := json.NewEncoder(rw)
    err = e.Encode(&resp)

    _ = handleError(&rw, err, http.StatusInternalServerError)
    return
  }

  password := generatePassword(8)

  hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)
  if handleError(&rw, err, http.StatusInternalServerError) {
    return
  }

  hashString := string(hash)

  queryRes, err := client.Query(
    f.Update(
      f.Select(
        "ref",
        f.Get(
          f.MatchTerm(
            f.Index("users_by_email"),
            data.Email,
          ),
        ),
      ),
      f.Obj{
        "data": f.Obj {
          "password": hashString,
        },
      },
    ),
  )

  if handleError(&rw, err, http.StatusInternalServerError) {
    return
  }

  var user user
  err = queryRes.At(f.ObjKey("data")).Get(&user)

  if handleError(&rw, err, http.StatusInternalServerError) {
    return
  }

  err = sendEmail(user.Email, password)

  if handleError(&rw, err, http.StatusInternalServerError) {
    return
  }

  resp = response{
    true,
    "",
  }

  e := json.NewEncoder(rw)
  err = e.Encode(&resp)

  _ = handleError(&rw, err, http.StatusInternalServerError)
  return
}

func generatePassword(length int) string {
  chars := []rune(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "abcdefghijklmnopqrstuvwxyz" +
    "0123456789")

  var sb strings.Builder
  for i := 0; i < length; i++ {
    sb.WriteRune(chars[rand.Intn(len(chars))])
  }

  return sb.String()
}

func sendEmail(emailAdress string, password string) error {
  auth := smtp.PlainAuth(
    "1v1 Arena",
    "68c9e4fc6f614a3eb3a1451ac63efb36",
    "5bd49749fb684bdfa670d6411a1b10e3",
    "smtp.mailspons.com")
  to := []string{emailAdress}
  msg := []byte("To: " + emailAdress + "\r\n" +
    "From: noreply@1v1.ykooistra.dev\r\n" +
    "Subject: Reset Password\r\n" +
    "Date: " + time.Now().Format(time.RubyDate) + "\r\n" +
    "\r\n" +
    "Please log in using the following password: " + password + "\r\n")

  err := smtp.SendMail("smtp.mailspons.com:25", auth, "noreply@1v1.ykooistra.dev", to, msg)
  return err
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

  if len(matches) == 0 {
    return false, "No account exists with this email address", nil
  }

  return true, "", nil
}

func seedRand(rw *http.ResponseWriter) {
  var b [8]byte
  _, err := cryptoRand.Read(b[:])
  if err != nil {
    http.Error(*rw, "", http.StatusInternalServerError)
    return
  }
  rand.Seed(int64(binary.LittleEndian.Uint64(b[:])))
}

func handleError(rw *http.ResponseWriter, err error, status int) bool {
  if err != nil {
    http.Error(*rw, err.Error(), status)
    return true
  }

  return false
}
