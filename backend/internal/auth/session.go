package auth

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

const SessionCookieName = "blog_ai_admin_session"

var ErrInvalidSession = errors.New("invalid session")

type Service struct {
	username      string
	password      string
	sessionSecret []byte
	sessionTTL    time.Duration
}

func NewService(username, password, sessionSecret string) Service {
	return Service{
		username:      username,
		password:      password,
		sessionSecret: []byte(sessionSecret),
		sessionTTL:    7 * 24 * time.Hour,
	}
}

func (s Service) Authenticate(username, password string) bool {
	usernameOK := subtle.ConstantTimeCompare([]byte(username), []byte(s.username)) == 1
	passwordOK := subtle.ConstantTimeCompare([]byte(password), []byte(s.password)) == 1
	return usernameOK && passwordOK
}

func (s Service) Username() string {
	return s.username
}

func (s Service) SessionTTL() time.Duration {
	return s.sessionTTL
}

func (s Service) NewSessionValue() (string, error) {
	expiresAt := time.Now().Add(s.sessionTTL).Unix()
	nonce := make([]byte, 16)
	if _, err := rand.Read(nonce); err != nil {
		return "", fmt.Errorf("read nonce: %w", err)
	}

	payload := strings.Join([]string{
		s.username,
		strconv.FormatInt(expiresAt, 10),
		hex.EncodeToString(nonce),
	}, ":")
	signature := s.sign(payload)
	return base64.RawURLEncoding.EncodeToString([]byte(payload + "." + signature)), nil
}

func (s Service) ValidateSessionValue(value string) error {
	raw, err := base64.RawURLEncoding.DecodeString(value)
	if err != nil {
		return ErrInvalidSession
	}

	parts := strings.SplitN(string(raw), ".", 2)
	if len(parts) != 2 {
		return ErrInvalidSession
	}

	payload, signature := parts[0], parts[1]
	expectedSignature := s.sign(payload)
	if subtle.ConstantTimeCompare([]byte(signature), []byte(expectedSignature)) != 1 {
		return ErrInvalidSession
	}

	payloadParts := strings.Split(payload, ":")
	if len(payloadParts) != 3 {
		return ErrInvalidSession
	}

	if subtle.ConstantTimeCompare([]byte(payloadParts[0]), []byte(s.username)) != 1 {
		return ErrInvalidSession
	}

	expiresAt, err := strconv.ParseInt(payloadParts[1], 10, 64)
	if err != nil || time.Now().Unix() > expiresAt {
		return ErrInvalidSession
	}

	return nil
}

func (s Service) sign(payload string) string {
	mac := hmac.New(sha256.New, s.sessionSecret)
	mac.Write([]byte(payload))
	return hex.EncodeToString(mac.Sum(nil))
}
