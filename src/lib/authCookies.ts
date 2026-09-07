import type { NextAuthConfig } from "next-auth";

const PROJECT_SLUG = "new-transfer";
const isProduction = process.env.NODE_ENV === "production";
const useSecureCookies = isProduction;
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export const SESSION_TOKEN_COOKIE_NAME = `${cookiePrefix}${PROJECT_SLUG}.session-token`;
export const CALLBACK_URL_COOKIE_NAME = `${cookiePrefix}${PROJECT_SLUG}.callback-url`;
export const CSRF_TOKEN_COOKIE_NAME = `${useSecureCookies ? "__Host-" : ""}${PROJECT_SLUG}.csrf-token`;
export const PKCE_VERIFIER_COOKIE_NAME = `${cookiePrefix}${PROJECT_SLUG}.pkce.code_verifier`;
export const STATE_COOKIE_NAME = `${cookiePrefix}${PROJECT_SLUG}.state`;
export const NONCE_COOKIE_NAME = `${cookiePrefix}${PROJECT_SLUG}.nonce`;

export const authCookies: NextAuthConfig["cookies"] = {
  sessionToken: {
    name: SESSION_TOKEN_COOKIE_NAME,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: useSecureCookies,
    },
  },
  callbackUrl: {
    name: CALLBACK_URL_COOKIE_NAME,
    options: {
      sameSite: "lax",
      path: "/",
      secure: useSecureCookies,
    },
  },
  csrfToken: {
    name: CSRF_TOKEN_COOKIE_NAME,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: useSecureCookies,
    },
  },
  pkceCodeVerifier: {
    name: PKCE_VERIFIER_COOKIE_NAME,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: useSecureCookies,
      maxAge: 60 * 15,
    },
  },
  state: {
    name: STATE_COOKIE_NAME,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: useSecureCookies,
      maxAge: 60 * 15,
    },
  },
  nonce: {
    name: NONCE_COOKIE_NAME,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: useSecureCookies,
    },
  },
};
