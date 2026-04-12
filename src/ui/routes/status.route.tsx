import { Alert, Avatar, Box, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material'
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { useState } from 'react'
import { useAppSelector } from '../../app/hooks'
import { db } from '../../firebase'
import {
  selectAuthReady,
  selectAuthStatus,
  selectAuthUser,
  selectHasElevatedAccess,
} from '../../features/auth/selectors'
import { FilesStorageExplorer } from '../../features/files'
import {
  LEGACY_NEWSLETTER_SUBSCRIPTIONS_COLLECTION,
  SIGNUP_FORM_KIND_ACCESS,
  SIGNUP_REQUESTS_COLLECTION,
  type SignupCommunicationPreference,
  type SignupFormKind,
} from '../../features/newsletter/formUtils'

type SignupRequestRecord = {
  id: string
  sourceCollection: string
  kind: SignupFormKind
  name: string
  email: string
  cell: string
  communicationPreference: SignupCommunicationPreference
  message: string
  interests: string[]
  createdAtLabel: string
  createdAtValue: number
}

const toTimestampValue = (value: unknown): number => {
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    return value.toDate().getTime()
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = Date.parse(String(value))
    return Number.isNaN(parsed) ? 0 : parsed
  }

  return 0
}

const toTimestampLabel = (value: unknown): string => {
  const timestampValue = toTimestampValue(value)

  if (timestampValue <= 0) {
    return 'Pending timestamp'
  }

  return new Date(timestampValue).toLocaleString()
}

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map((entry) => String(entry).trim()).filter((entry) => entry.length > 0)
    : []

const mapSignupRequest = (
  documentSnapshot: QueryDocumentSnapshot<DocumentData>,
  sourceCollection: string,
): SignupRequestRecord => {
  const data = documentSnapshot.data()
  const createdAtValue = toTimestampValue(data.createdAt)
  const nameValue = typeof data.name === 'string' ? data.name : ''
  const legacyFirstName = typeof data.firstName === 'string' ? data.firstName : ''
  const communicationPreferenceValue = data.communicationPreference === 'text' ? 'text' : 'email'

  return {
    id: documentSnapshot.id,
    sourceCollection,
    kind: data.kind === SIGNUP_FORM_KIND_ACCESS ? SIGNUP_FORM_KIND_ACCESS : 'newsletter',
    name: nameValue || legacyFirstName || 'Unknown requester',
    email: typeof data.email === 'string' ? data.email : '',
    cell: typeof data.cell === 'string' ? data.cell : '',
    communicationPreference: communicationPreferenceValue,
    message: typeof data.message === 'string' ? data.message : '',
    interests: toStringArray(data.interests),
    createdAtLabel: toTimestampLabel(data.createdAt),
    createdAtValue,
  }
}

const downloadSignupRequestsCsv = (records: SignupRequestRecord[]) => {
  const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`
  const rows = [
    [
      'createdAt',
      'sourceCollection',
      'kind',
      'name',
      'email',
      'cell',
      'communicationPreference',
      'message',
      'interests',
    ].join(','),
    ...records.map((record) =>
      [
        escapeCell(record.createdAtLabel),
        escapeCell(record.sourceCollection),
        escapeCell(record.kind),
        escapeCell(record.name),
        escapeCell(record.email),
        escapeCell(record.cell),
        escapeCell(record.communicationPreference),
        escapeCell(record.message),
        escapeCell(record.interests.join(' | ')),
      ].join(','),
    ),
  ]

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = 'signup-requests.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

function PlatformRoute() {
  const user = useAppSelector(selectAuthUser)
  const authReady = useAppSelector(selectAuthReady)
  const authStatus = useAppSelector(selectAuthStatus)
  const hasElevatedAccess = useAppSelector(selectHasElevatedAccess)
  const [signupRequestsLoading, setSignupRequestsLoading] = useState(false)
  const [signupRequestsError, setSignupRequestsError] = useState('')
  const [signupRequests, setSignupRequests] = useState<SignupRequestRecord[]>([])

  const handleLoadSignupRequests = async () => {
    if (!authReady || !user) {
      setSignupRequestsError('Sign in to review signup requests.')
      return
    }

    if (!hasElevatedAccess) {
      setSignupRequestsError('Elevated access is required to review signup requests.')
      return
    }

    try {
      setSignupRequestsLoading(true)
      setSignupRequestsError('')

      const [currentSnapshot, legacySnapshot] = await Promise.all([
        getDocs(
          query(
            collection(db, SIGNUP_REQUESTS_COLLECTION),
            orderBy('createdAt', 'desc'),
            limit(25),
          ),
        ),
        getDocs(
          query(
            collection(db, LEGACY_NEWSLETTER_SUBSCRIPTIONS_COLLECTION),
            orderBy('createdAt', 'desc'),
            limit(25),
          ),
        ),
      ])

      const nextRequests = [
        ...currentSnapshot.docs.map((entry) => mapSignupRequest(entry, SIGNUP_REQUESTS_COLLECTION)),
        ...legacySnapshot.docs.map((entry) =>
          mapSignupRequest(entry, LEGACY_NEWSLETTER_SUBSCRIPTIONS_COLLECTION),
        ),
      ].sort((left, right) => right.createdAtValue - left.createdAtValue)

      setSignupRequests(nextRequests)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load signup request history.'
      setSignupRequestsError(message)
      setSignupRequests([])
    } finally {
      setSignupRequestsLoading(false)
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(20, 71, 102, 0.08), rgba(255, 235, 196, 0.6))',
        border: '1px solid rgba(20, 71, 102, 0.15)',
      }}
    >
      <Stack id="platform-session-summary" spacing={2}>
        <Typography variant="overline" sx={{ fontFamily: 'IBM Plex Mono' }}>
          Platform
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          Platform status
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 560 }}>
          Operational platform checks for authentication and Firebase services. Use the explorer to
          verify Storage folder structure and object visibility.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
          <Chip label={`Auth ready: ${authReady ? 'yes' : 'no'}`} variant="outlined" />
          <Chip label={`Session: ${authStatus}`} variant="outlined" />
        </Stack>
        {user ? (
          <Stack id="platform-auth-details" direction="row" spacing={2} alignItems="center">
            <Avatar src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
            <Box>
              <Typography fontWeight={600}>{user.displayName ?? 'Signed-in user'}</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'IBM Plex Mono' }}>
                {user.email}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Alert id="platform-auth-details" severity="info">
            Sign in to see your session details here.
          </Alert>
        )}

        <Divider />

        <Stack id="platform-signup-requests" spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Signup requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review newsletter subscribers and members-area access requests, then export the current
            snapshot as CSV.
          </Typography>
          {!user ? (
            <Alert severity="info">Sign in to review signup requests.</Alert>
          ) : !hasElevatedAccess ? (
            <Alert severity="warning">Admin or staff access is required to review requests.</Alert>
          ) : (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-start">
                <Button
                  variant="contained"
                  onClick={handleLoadSignupRequests}
                  disabled={signupRequestsLoading}
                >
                  {signupRequestsLoading ? 'Loading requests...' : 'Load requests'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => downloadSignupRequestsCsv(signupRequests)}
                  disabled={signupRequests.length === 0 || signupRequestsLoading}
                >
                  Export CSV
                </Button>
              </Stack>
              {signupRequestsError && <Alert severity="error">{signupRequestsError}</Alert>}
              {signupRequests.length > 0 ? (
                <Stack spacing={1.5}>
                  {signupRequests.map((request) => (
                    <Paper
                      key={`${request.sourceCollection}:${request.id}`}
                      variant="outlined"
                      sx={{ p: 2 }}
                    >
                      <Stack spacing={1.5}>
                        <Stack
                          direction={{ xs: 'column', md: 'row' }}
                          spacing={1}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', md: 'center' }}
                        >
                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            <Chip
                              size="small"
                              label={
                                request.kind === SIGNUP_FORM_KIND_ACCESS
                                  ? 'Access request'
                                  : 'Newsletter'
                              }
                              color={
                                request.kind === SIGNUP_FORM_KIND_ACCESS ? 'secondary' : 'default'
                              }
                            />
                            <Chip
                              size="small"
                              variant="outlined"
                              label={request.sourceCollection}
                            />
                            <Chip size="small" variant="outlined" label={request.createdAtLabel} />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            Preferred reply: {request.communicationPreference}
                          </Typography>
                        </Stack>
                        <Stack spacing={0.25}>
                          <Typography variant="h6">{request.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {request.email || 'No email provided'}
                            {request.cell ? ` | ${request.cell}` : ''}
                          </Typography>
                        </Stack>
                        {request.message && (
                          <Typography variant="body2">{request.message}</Typography>
                        )}
                        {request.interests.length > 0 && (
                          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                            {request.interests.map((interest) => (
                              <Chip
                                key={`${request.id}:${interest}`}
                                size="small"
                                label={interest}
                              />
                            ))}
                          </Stack>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No signup requests loaded yet.
                </Typography>
              )}
            </Stack>
          )}
        </Stack>

        <Divider />

        <FilesStorageExplorer />
      </Stack>
    </Paper>
  )
}

export default PlatformRoute
