export const AUTH_ROLE_ADMIN = 'admin'
export const AUTH_ROLE_STAFF = 'staff'
export const AUTH_ROLE_GUEST = 'guest'

export type AuthRole = typeof AUTH_ROLE_ADMIN | typeof AUTH_ROLE_STAFF | typeof AUTH_ROLE_GUEST

const authRoles: AuthRole[] = [AUTH_ROLE_ADMIN, AUTH_ROLE_STAFF, AUTH_ROLE_GUEST]

const roleSet = new Set<AuthRole>(authRoles)

const isString = (value: unknown): value is string => typeof value === 'string'

const normalizeRole = (value: string): AuthRole | null => {
  const normalized = value.trim().toLowerCase()
  const role = authRoles.find((candidate) => candidate === normalized)

  if (role && roleSet.has(role)) {
    return role
  }

  return null
}

export const parseRolesFromClaims = (claims: Record<string, unknown>): AuthRole[] => {
  const rolesValue = claims.roles

  if (Array.isArray(rolesValue)) {
    const roles = rolesValue
      .filter(isString)
      .map((value) => normalizeRole(value))
      .filter((value): value is AuthRole => value !== null)

    if (roles.length > 0) {
      return Array.from(new Set<AuthRole>(roles))
    }
  }

  const roleValue = claims.role

  if (isString(roleValue)) {
    const role = normalizeRole(roleValue)

    if (role) {
      return [role]
    }
  }

  return []
}

export const hasElevatedAccess = (roles: AuthRole[]): boolean =>
  roles.includes(AUTH_ROLE_ADMIN) || roles.includes(AUTH_ROLE_STAFF)

export const canManageRoles = (roles: AuthRole[]): boolean => roles.includes(AUTH_ROLE_ADMIN)
