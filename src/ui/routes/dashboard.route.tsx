import {
  Alert,
  Box,
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
import { selectAuthError } from '../../features/auth/selectors'
import {
  selectCanonicalRecordMap,
  selectCanonicalRecordsError,
} from '../../features/canonicalRecords/selectors'
import {
  selectInventory,
  selectInventoryError,
  selectInventoryLineCounts,
} from '../../features/inventory/selectors'
import LandingPageControlsCard from '../../features/landingContent/components/LandingPageControlsCard'
import type { InventoryItem } from '../../features/inventory/slice'
import { selectNewsletterSignupCount } from '../../features/newsletter/selectors'
import { useRequireAuthenticatedRoute } from './useRequireAuthenticatedRoute'

const parseTimestampForSort = (value: string | undefined): number => {
  if (!value) {
    return 0
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

type MetricCardProps = {
  text: string
  caption: string
}

type MetricGroupProps = {
  title: string
  children: React.ReactNode
}

function MetricCard({ text, caption }: MetricCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        minHeight: 158,
        borderRadius: 2,
        border: '1px solid rgba(15, 72, 94, 0.15)',
        background: 'rgba(255, 255, 255, 0.75)',
      }}
    >
      <Stack spacing={0.75} sx={{ height: '100%', containerType: 'inline-size' }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            fontSize: 'clamp(1.25rem, 16cqi, 2.125rem)',
            lineHeight: 1.15,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
          {caption}
        </Typography>
      </Stack>
    </Paper>
  )
}

function MetricGroup({ title, children }: MetricGroupProps) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gridAutoRows: '1fr',
          gap: 2,
        }}
      >
        {children}
      </Box>
    </Stack>
  )
}

function DashboardRoute() {
  const authError = useAppSelector(selectAuthError)
  const inventory = useAppSelector(selectInventory)
  const inventoryError = useAppSelector(selectInventoryError)
  const inventoryLineCounts = useAppSelector(selectInventoryLineCounts)
  const newsletterSignupCount = useAppSelector(selectNewsletterSignupCount)
  const canonicalRecordMap = useAppSelector(selectCanonicalRecordMap)
  const canonicalRecordsError = useAppSelector(selectCanonicalRecordsError)
  const shouldRedirectHome = useRequireAuthenticatedRoute()

  const metrics = useMemo(() => {
    const inventoryCount = inventory.length
    const withFilesCount = inventory.filter((item) => (item.files?.length ?? 0) > 0).length
    const withConditionReportCount = inventory.filter((item) => item.conditionReport).length
    const listingReadyCount = inventory.filter(
      (item) =>
        item.canonicalRecordId &&
        canonicalRecordMap.has(item.canonicalRecordId) &&
        (item.files?.length ?? 0) > 0 &&
        (item.conditionGrade?.trim().length ?? 0) > 0,
    ).length

    return {
      inventoryCount,
      originalsCount: inventoryLineCounts.originals,
      reprintsCount: inventoryLineCounts.reprints,
      missingProductLineCount: inventoryLineCounts.missingProductLine,
      withFilesCount,
      withoutFilesCount: Math.max(inventoryCount - withFilesCount, 0),
      withConditionReportCount,
      missingConditionReportCount: Math.max(inventoryCount - withConditionReportCount, 0),
      listingReadyCount,
      needsEnrichmentCount: Math.max(inventoryCount - listingReadyCount, 0),
    }
  }, [canonicalRecordMap, inventory, inventoryLineCounts])

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

  if (shouldRedirectHome) {
    return <Navigate to="/" replace />
  }

  return (
    <Stack spacing={2.5}>
      {authError && <Alert severity="error">{authError}</Alert>}
      {inventoryError && <Alert severity="error">{inventoryError}</Alert>}
      {canonicalRecordsError && <Alert severity="error">{canonicalRecordsError}</Alert>}

      <Paper
        id="dashboard-overview"
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(18, 63, 84, 0.08), rgba(250, 241, 223, 0.95))',
          border: '3px inset rgba(18, 63, 84, 0.25)',
        }}
      >
        <Stack spacing={2}>
          <MetricGroup title="Analytics">
            <MetricCard
              text="Page hits pending"
              caption="Firebase Analytics is recording page views; admin rollups still need a reporting source."
            />
            <MetricCard
              text="Product clicks pending"
              caption="Product click events are tracked now; dashboard totals need an analytics aggregate."
            />
          </MetricGroup>

          <MetricGroup title="Inventory">
            <MetricCard
              text={`${metrics.inventoryCount} items`}
              caption="Total records currently loaded in managed inventory."
            />
            <MetricCard
              text={`${metrics.originalsCount} originals`}
              caption="Items classified in the Originals product line."
            />
            <MetricCard
              text={`${metrics.reprintsCount} reprints`}
              caption="Items classified in the Prints product line."
            />
            {metrics.missingProductLineCount > 0 && (
              <MetricCard
                text={`${metrics.missingProductLineCount} missing product line`}
                caption="Records missing a stored product line value in Firestore."
              />
            )}
            <MetricCard
              text={`${metrics.withFilesCount} with files`}
              caption={`${metrics.withoutFilesCount} records are still missing files.`}
            />
            <MetricCard
              text={`${metrics.withConditionReportCount} reports completed`}
              caption={`${metrics.missingConditionReportCount} records still need condition reporting.`}
            />
            <MetricCard
              text={`${metrics.listingReadyCount} ready to list`}
              caption={`${metrics.needsEnrichmentCount} records still need enrichment.`}
            />
          </MetricGroup>

          <MetricGroup title="People">
            <MetricCard
              text={
                newsletterSignupCount === null
                  ? 'Newsletter signups loading'
                  : `${newsletterSignupCount} newsletter signups`
              }
              caption="Counted from signup requests without loading every record."
            />
            <MetricCard
              text="User registrations pending"
              caption="Firebase Auth totals need a server-side source or mirrored user records."
            />
          </MetricGroup>
        </Stack>
      </Paper>

      <Paper
        id="dashboard-recent-activity"
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
                  hasCanonical &&
                  (item.files?.length ?? 0) > 0 &&
                  (item.conditionGrade?.trim().length ?? 0) > 0
                const tags = item.tags ?? []

                return (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.title || 'Untitled inventory item'}</TableCell>
                    <TableCell>{item.updatedAt ?? item.createdAt ?? 'Missing timestamp'}</TableCell>
                    <TableCell>{hasCanonical ? 'Linked' : 'Unlinked'}</TableCell>
                    <TableCell>{listingReady ? 'Ready to list' : 'Needs enrichment'}</TableCell>
                    <TableCell>{tags.length > 0 ? tags.join(', ') : 'No tags'}</TableCell>
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

      <LandingPageControlsCard />
    </Stack>
  )
}

export default DashboardRoute
