import { useAppSelector } from '../../app/hooks'
import { selectAuthReady, selectAuthUser } from '../../features/auth/selectors'

export const useRequireAuthenticatedRoute = () => {
  const authReady = useAppSelector(selectAuthReady)
  const user = useAppSelector(selectAuthUser)

  return authReady && !user
}
