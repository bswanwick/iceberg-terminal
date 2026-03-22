import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { setGlobalOptions } from 'firebase-functions'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

setGlobalOptions({ maxInstances: 10, region: 'us-central1' })

initializeApp()

const AUTH_ROLE_ADMIN = 'admin'
const AUTH_ROLE_STAFF = 'staff'
const AUTH_ROLE_GUEST = 'guest'

type AuthRole = typeof AUTH_ROLE_ADMIN | typeof AUTH_ROLE_STAFF | typeof AUTH_ROLE_GUEST

type Claims = Record<string, unknown>

type SetUserRoleData = {
  uid: string
  role: AuthRole
}

type SetUserRoleResponse = {
  uid: string
  role: AuthRole
}

type SyncMyRoleResponse = {
  uid: string
  role: AuthRole
}

const parseCsv = (value: string | undefined): string[] => {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

const normalizeOrigin = (origin: string): string => {
  const trimmedOrigin = origin.trim()

  try {
    const parsedOrigin = new URL(trimmedOrigin)
    return `${parsedOrigin.protocol}//${parsedOrigin.host}`.toLowerCase()
  } catch {
    return trimmedOrigin.replace(/\/+$/, '').toLowerCase()
  }
}

const getAdminEmails = (): string[] =>
  parseCsv(process.env.AUTH_ALLOWED_ADMIN_EMAILS).map((email) => email.toLowerCase())

const getAllowedOrigins = (): string[] =>
  Array.from(
    new Set(parseCsv(process.env.AUTH_ALLOWED_ORIGINS).map((origin) => normalizeOrigin(origin))),
  )

const callableCors = (): true | string[] => {
  const allowedOrigins = getAllowedOrigins()
  console.log('[auth] Allowed CORS origins:', allowedOrigins)
  return allowedOrigins.length > 0 ? allowedOrigins : true
}

const isClaimsObject = (value: unknown): value is Claims =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isAuthRole = (value: unknown): value is AuthRole =>
  value === AUTH_ROLE_ADMIN || value === AUTH_ROLE_STAFF || value === AUTH_ROLE_GUEST

const toClaims = (value: unknown): Claims => {
  if (isClaimsObject(value)) {
    return value
  }

  return {}
}

const getRolesFromClaims = (claims: Claims): AuthRole[] => {
  const claimRoles = claims.roles

  if (Array.isArray(claimRoles)) {
    const roles = claimRoles.filter((role): role is AuthRole => isAuthRole(role))

    if (roles.length > 0) {
      return Array.from(new Set<AuthRole>(roles))
    }
  }

  const role = claims.role

  if (isAuthRole(role)) {
    return [role]
  }

  return []
}

const getRoleFromClaims = (claims: Claims): AuthRole | null => {
  const roles = getRolesFromClaims(claims)

  if (roles.length > 0) {
    return roles[0]
  }

  return null
}

const isAdminEmail = (email: unknown): boolean => {
  if (typeof email !== 'string') {
    return false
  }

  return getAdminEmails().includes(email.toLowerCase())
}

const assertSignedIn = (uid: string | undefined): string => {
  if (!uid) {
    throw new HttpsError('unauthenticated', 'You must be authenticated to perform this action.')
  }

  return uid
}

const assertAdmin = (claims: Claims, email: unknown): void => {
  const roles = getRolesFromClaims(claims)

  if (roles.includes(AUTH_ROLE_ADMIN) || isAdminEmail(email)) {
    return
  }

  throw new HttpsError('permission-denied', 'Only admins can modify roles.')
}

const parseUid = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', 'uid must be a non-empty string.')
  }

  const uid = value.trim()

  if (!uid) {
    throw new HttpsError('invalid-argument', 'uid must be a non-empty string.')
  }

  return uid
}

const parseRole = (value: unknown): AuthRole => {
  if (!isAuthRole(value)) {
    throw new HttpsError('invalid-argument', 'role must be one of: admin, staff, guest.')
  }

  return value
}

const setUserRoleClaim = async (uid: string, role: AuthRole): Promise<void> => {
  const auth = getAuth()
  const userRecord = await auth.getUser(uid)
  const existingClaims = toClaims(userRecord.customClaims)

  await auth.setCustomUserClaims(uid, { ...existingClaims, role })
}

const resolveDefaultRole = (claims: Claims, email: unknown): AuthRole => {
  if (isAdminEmail(email)) {
    return AUTH_ROLE_ADMIN
  }

  const claimRole = getRoleFromClaims(claims)

  if (claimRole) {
    return claimRole
  }

  return AUTH_ROLE_GUEST
}

export const syncMyUserRole = onCall(
  { cors: callableCors() },
  async (request): Promise<SyncMyRoleResponse> => {
    const uid = assertSignedIn(request.auth?.uid)
    const role = resolveDefaultRole(toClaims(request.auth?.token), request.auth?.token.email)

    await setUserRoleClaim(uid, role)

    return { uid, role }
  },
)

export const setUserRole = onCall<SetUserRoleData>(
  { cors: callableCors() },
  async (request): Promise<SetUserRoleResponse> => {
    assertSignedIn(request.auth?.uid)
    assertAdmin(toClaims(request.auth?.token), request.auth?.token.email)

    const uid = parseUid(request.data?.uid)
    const role = parseRole(request.data?.role)

    await setUserRoleClaim(uid, role)

    return { uid, role }
  },
)
