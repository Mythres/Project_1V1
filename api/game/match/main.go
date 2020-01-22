package handler

import (
  "encoding/json"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/aws/credentials"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/gamelift"
  jwt "github.com/dgrijalva/jwt-go"
  "net/http"
  "os"
  "strconv"
  "strings"
)

type response struct {
  PlayerSessionId string `json:"playerSessionId"`
  IpAddress string `json:"ipAddress"`
  Port string `json:"port"`
}

type jwtClaims struct {
  Username string `json:"username"`
  Email string `json:"email"`
  jwt.StandardClaims
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

  var gameSessionId *string
  svc, err := startGameLiftSession()

  if handleError(&rw, err, http.StatusInternalServerError) {
    return
  }

  out, err := svc.DescribeGameSessions(&gamelift.DescribeGameSessionsInput{
    FleetId: aws.String("fleet-123"),
    StatusFilter: aws.String("ACTIVE"),
  })

  if handleError(&rw, err, http.StatusInternalServerError) {
    return
  }

  if len(out.GameSessions) > 0 {
    gameSessionId = out.GameSessions[0].GameSessionId
  } else {
    out, err := svc.CreateGameSession(&gamelift.CreateGameSessionInput{
      CreatorId:                 aws.String(claims.Username),
      FleetId:                   aws.String("fleet-123"),
      MaximumPlayerSessionCount: aws.Int64(2),
    })

    if handleError(&rw, err, http.StatusInternalServerError) {
      return
    }

    gameSessionId = out.GameSession.GameSessionId
  }

  for {
    out, err := svc.DescribeGameSessions(&gamelift.DescribeGameSessionsInput{
      FleetId: aws.String("fleet-123"),
      StatusFilter: aws.String("ACTIVE"),
    })

    if handleError(&rw, err, http.StatusInternalServerError) {
      return
    }

    if len(out.GameSessions) > 0 {
      break
    }
  }

  pOut, pErr := svc.CreatePlayerSession(&gamelift.CreatePlayerSessionInput{
    GameSessionId: gameSessionId,
    PlayerId:      aws.String(r.URL.Path[len("/getMatch/"):]),
  })

  if handleError(&rw, pErr, http.StatusInternalServerError) {
    return
  }

  playerSessionData := response{
    *pOut.PlayerSession.PlayerSessionId,
    *pOut.PlayerSession.IpAddress,
    strconv.FormatInt(*pOut.PlayerSession.Port, 10),
  }


  encoder := json.NewEncoder(rw)
  jErr := encoder.Encode(&playerSessionData)

  if handleError(&rw, jErr, http.StatusInternalServerError) {
    return
  }

  return
}

func startGameLiftSession() (*gamelift.GameLift, error) {
  sess, err := session.NewSession(&aws.Config{
    Credentials:                       credentials.NewStaticCredentials("id1", "secret1", "tok1"),
    Endpoint:                          aws.String("http://localhost:8080"),
    Region:                            aws.String("eu-central-1"),
    DisableSSL:                        aws.Bool(true),
    LogLevel:                          aws.LogLevel(1),
    DisableEndpointHostPrefix:         nil,
  })

  if err != nil {
    return nil, err
  }

  svc := gamelift.New(sess)

  return svc, nil
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

func handleError(rw *http.ResponseWriter, err error, status int) bool {
  if err != nil {
    http.Error(*rw, err.Error(), status)
    return true
  }

  return false
}
