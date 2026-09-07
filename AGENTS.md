# Project Agent Instructions

## NextAuth for Multiple Applications on a Shared Domain

When this application shares a domain with other systems, do not use NextAuth's
default cookie names. They use `Path=/` and can overwrite the session of
another application on the same domain.

- Choose a stable, lowercase, hyphenated identifier for this application:
  `<project-slug>`. It must be unique among all applications on the shared
  domain, for example `booking-area`,`new-transfer`,`new-borrows`.
- Namespace every NextAuth cookie with `<project-slug>`. In production, use
  names such as `__Secure-<project-slug>.session-token`. This includes
  `sessionToken`, `callbackUrl`, `csrfToken`, `pkceCodeVerifier`, `state`, and
  `nonce`.
- Keep the cookie definitions in `src/lib/authCookies.ts`, which must remain
  safe to import from Edge Middleware: do not import Prisma or Node-only code
  into that module.
- `authOptions.cookies` and `getToken()` in `src/middleware.ts` must use the
  same `sessionToken` cookie name.
- In production, use secure, HTTP-only, `SameSite=Lax` cookies. Do not fall
  back to the unnamespaced default NextAuth cookie name.
- Do not log raw `Cookie` headers, session tokens, authentication secrets, or
  credentials.
- Keep the public deployment path consistent across reverse-proxy settings,
  `NEXTAUTH_URL`, `NEXT_PUBLIC_BASE_PATH`, and Next.js routing configuration.

Before changing authentication, verify that signing in or out of another
application on the shared domain does not change this application's
`__Secure-<project-slug>.*` cookies.
