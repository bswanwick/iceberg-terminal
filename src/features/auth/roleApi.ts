import { httpsCallable } from 'firebase/functions'
import { functions } from '../../firebase'
import type { AuthRole } from './roles'

type SetUserRoleRequest = {
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

const syncMyUserRoleCallable = httpsCallable<undefined, SyncMyRoleResponse>(
  functions,
  'syncMyUserRole',
)

const setUserRoleCallable = httpsCallable<SetUserRoleRequest, SetUserRoleResponse>(
  functions,
  'setUserRole',
)

export const syncMyUserRole = async (): Promise<SyncMyRoleResponse> => {
  const result = await syncMyUserRoleCallable()

  return result.data
}

export const setUserRole = async (request: SetUserRoleRequest): Promise<SetUserRoleResponse> => {
  const result = await setUserRoleCallable(request)

  return result.data
}
