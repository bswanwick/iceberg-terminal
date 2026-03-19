import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import {
  selectAuthError,
  selectAuthReady,
  selectAuthStatus,
  selectAuthUser,
} from '../../features/auth/selectors'
import {
  selectCanonicalRecordMap,
  selectCanonicalRecordsError,
  selectCanonicalRecordsStatus,
} from '../../features/canonicalRecords/selectors'
import {
  selectInventory,
  selectInventoryError,
  selectInventoryStatus,
} from '../../features/inventory/selectors'
import type { InventoryItem } from '../../features/inventory/slice'
import {
  selectAppLocked,
  selectScreenLocked,
  selectUiControlsLocked,
} from '../../features/ui/selectors'

const parseTimestampForSort = (value: string | undefined): number => {
  if (!value) {
    return 0
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

type MetricCardProps = {
  label: string
  value: string
  caption: string
}

function MetricCard({ label, value, caption }: MetricCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid rgba(15, 72, 94, 0.15)',
        background: 'rgba(255, 255, 255, 0.75)',
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="overline" sx={{ fontFamily: 'IBM Plex Mono', lineHeight: 1.4 }}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {caption}
        </Typography>
      </Stack>
    </Paper>
  )
}

function DashboardRoute() {
  const authError = useAppSelector(selectAuthError)
  const authReady = useAppSelector(selectAuthReady)
  const authStatus = useAppSelector(selectAuthStatus)
  const user = useAppSelector(selectAuthUser)
  const appLocked = useAppSelector(selectAppLocked)
  const screenLocked = useAppSelector(selectScreenLocked)
  const controlsLocked = useAppSelector(selectUiControlsLocked)
  const inventory = useAppSelector(selectInventory)
  const inventoryError = useAppSelector(selectInventoryError)
  const inventoryStatus = useAppSelector(selectInventoryStatus)
  const canonicalRecordMap = useAppSelector(selectCanonicalRecordMap)
  const canonicalRecordsError = useAppSelector(selectCanonicalRecordsError)
  const canonicalRecordsStatus = useAppSelector(selectCanonicalRecordsStatus)

  const metrics = useMemo(() => {
    const inventoryCount = inventory.length
    const linkedCount = inventory.filter(
      (item) => item.canonicalRecordId && canonicalRecordMap.has(item.canonicalRecordId),
    ).length
    const withPhotosCount = inventory.filter((item) => item.photos.length > 0).length
    const withConditionReportCount = inventory.filter((item) => item.conditionReport).length
    const listingReadyCount = inventory.filter(
      (item) =>
        item.canonicalRecordId &&
        canonicalRecordMap.has(item.canonicalRecordId) &&
        item.photos.length > 0 &&
        item.conditionGrade.trim().length > 0,
    ).length

    return {
      inventoryCount,
      linkedCount,
      unlinkedCount: Math.max(inventoryCount - linkedCount, 0),
      withPhotosCount,
      withoutPhotosCount: Math.max(inventoryCount - withPhotosCount, 0),
      withConditionReportCount,
      missingConditionReportCount: Math.max(inventoryCount - withConditionReportCount, 0),
      listingReadyCount,
      needsEnrichmentCount: Math.max(inventoryCount - listingReadyCount, 0),
    }
  }, [canonicalRecordMap, inventory])

  const recentActivity = useMemo(
    () =>
      [...inventory]
        .sort((left, right) => {
          const leftValue = parseTimestampForSort(left.updatedAt ?? left.createdAt)
          const rightValue = parseTimestampForSort(right.updatedAt ?? right.createdAt)
          return rightValue - leftValue
        })
        .slice(0, 8),
    [inventory],
  )

  const appLockLabel = appLocked ? 'locked' : 'unlocked'
  const screenLockLabel = screenLocked ? 'screen lock on' : 'screen lock off'
  const controlsLockLabel = controlsLocked ? 'controls locked' : 'controls ready'

  if (authReady && !user) {
    return <Navigate to="/" replace />
  }

  return (
    <Stack spacing={2.5}>
      {authError && <Alert severity="error">{authError}</Alert>}
      {inventoryError && <Alert severity="error">{inventoryError}</Alert>}
      {canonicalRecordsError && <Alert severity="error">{canonicalRecordsError}</Alert>}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(18, 63, 84, 0.08), rgba(250, 241, 223, 0.95))',
          border: '1px solid rgba(18, 63, 84, 0.15)',
        }}
      >
        <Stack spacing={2}>
          <Typography variant="overline" sx={{ fontFamily: 'IBM Plex Mono' }}>
            Operations hub
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            Dashboard overview
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 780 }}>
            A shared operations view for business and IT. Inventory metrics are live; order flow,
            search hits, and reporting modules are staged as soon as their data pipelines land.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={`Auth: ${authStatus}`} variant="outlined" size="small" />
            <Chip label={`Inventory sync: ${inventoryStatus}`} variant="outlined" size="small" />
            <Chip
              label={`Canonical sync: ${canonicalRecordsStatus}`}
              variant="outlined"
              size="small"
            />
            <Chip label={`Application: ${appLockLabel}`} variant="outlined" size="small" />
            <Chip label={screenLockLabel} variant="outlined" size="small" />
            <Chip label={controlsLockLabel} variant="outlined" size="small" />
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        <MetricCard
          label="Inventory count"
          value={String(metrics.inventoryCount)}
          caption="Total records currently in managed inventory."
        />
        <MetricCard
          label="Canonical linkage"
          value={`${metrics.linkedCount} linked`}
          caption={`${metrics.unlinkedCount} records still need canonical pairing.`}
        />
        <MetricCard
          label="Photo coverage"
          value={`${metrics.withPhotosCount} with photos`}
          caption={`${metrics.withoutPhotosCount} records are still missing photos.`}
        />
        <MetricCard
          label="Condition reports"
          value={`${metrics.withConditionReportCount} completed`}
          caption={`${metrics.missingConditionReportCount} records still need condition reporting.`}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        <MetricCard
          label="Listing readiness"
          value={`${metrics.listingReadyCount} ready`}
          caption={`${metrics.needsEnrichmentCount} records still need enrichment.`}
        />
        <MetricCard
          label="Pending orders"
          value="Data source pending"
          caption="Order pipeline card will activate when the website starts submitting orders."
        />
        <MetricCard
          label="eBay search hits"
          value="Data source pending"
          caption="Inbound search-hit ingestion not wired yet; card is reserved for that feed."
        />
        <MetricCard
          label="Upcoming modules"
          value="Reporting, SEO, Firestore"
          caption="Reserved integration slots for additional business and IT intelligence modules."
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid rgba(18, 63, 84, 0.15)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: 'rgba(18, 63, 84, 0.04)' }}>
          <Typography variant="h6" fontWeight={700}>
            Recent inventory activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Most recently updated records to help triage catalog work across business and IT tasks.
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Updated</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Canonical</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Readiness</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tags</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentActivity.map((item: InventoryItem) => {
                const hasCanonical =
                  item.canonicalRecordId && canonicalRecordMap.has(item.canonicalRecordId)
                const listingReady =
                  hasCanonical && item.photos.length > 0 && item.conditionGrade.trim().length > 0

                return (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.title || 'Untitled inventory item'}</TableCell>
                    <TableCell>{item.updatedAt ?? item.createdAt}</TableCell>
                    <TableCell>{hasCanonical ? 'Linked' : 'Unlinked'}</TableCell>
                    <TableCell>{listingReady ? 'Ready to list' : 'Needs enrichment'}</TableCell>
                    <TableCell>{item.tags.length > 0 ? item.tags.join(', ') : 'No tags'}</TableCell>
                  </TableRow>
                )
              })}
              {recentActivity.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    Inventory activity appears here once records are loaded.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  )
}

export default DashboardRoute
