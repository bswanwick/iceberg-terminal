import type { Epic } from 'redux-observable'
import { timer } from 'rxjs'
import { debounce, filter, map } from 'rxjs/operators'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { screenLock, uiIsLoading } from './slice'

const SCREEN_LOCK_MIN_INTERVAL_MS = 2500

export const uiScreenLockEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (action$) => {
  let lastScreenLockEmissionAt = 0

  return action$.pipe(
    filter(uiIsLoading.match),
    debounce(() => {
      const now = Date.now()
      const elapsedSinceLastEmission = now - lastScreenLockEmissionAt
      const delayMs =
        lastScreenLockEmissionAt === 0 || elapsedSinceLastEmission >= SCREEN_LOCK_MIN_INTERVAL_MS
          ? 0
          : SCREEN_LOCK_MIN_INTERVAL_MS - elapsedSinceLastEmission

      return timer(delayMs)
    }),
    map(({ payload }) => {
      lastScreenLockEmissionAt = Date.now()
      return screenLock(payload)
    }),
  )
}
