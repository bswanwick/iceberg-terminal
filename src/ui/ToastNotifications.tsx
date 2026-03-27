import type { MouseEvent, ReactNode } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { Alert, IconButton, Stack } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectUiToasts } from '../features/ui/selectors'
import uiSlice, { type UiToastIcon, type UiToastTone } from '../features/ui/slice'

const severityByTone: Record<UiToastTone, 'info' | 'warning' | 'error'> = {
  info: 'info',
  warn: 'warning',
  error: 'error',
}

const iconByName: Record<UiToastIcon, ReactNode | false> = {
  info: <InfoOutlinedIcon fontSize="inherit" />,
  warn: <WarningAmberRoundedIcon fontSize="inherit" />,
  error: <ErrorOutlineRoundedIcon fontSize="inherit" />,
  none: false,
}

function ToastNotifications() {
  const dispatch = useAppDispatch()
  const toasts = useAppSelector(selectUiToasts)

  const dismissToast = (toastId: string) => {
    dispatch(uiSlice.actions.uiToastDismissed(toastId))
  }

  const handleCloseClick = (event: MouseEvent<HTMLButtonElement>, toastId: string) => {
    event.stopPropagation()
    dismissToast(toastId)
  }

  return (
    <Stack
      spacing={1.5}
      sx={(theme) => ({
        position: 'fixed',
        top: { xs: 16, md: 24 },
        right: { xs: 16, md: 24 },
        width: { xs: 'calc(100vw - 32px)', sm: 420 },
        maxWidth: 'calc(100vw - 32px)',
        zIndex: theme.zIndex.modal + 1,
        pointerEvents: 'none',
      })}
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          severity={severityByTone[toast.tone]}
          icon={iconByName[toast.icon]}
          variant="filled"
          onClick={toast.dismissOnClick ? () => dismissToast(toast.id) : undefined}
          action={
            <IconButton
              size="small"
              color="inherit"
              aria-label="Dismiss notification"
              onClick={(event) => handleCloseClick(event, toast.id)}
            >
              <CloseRoundedIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{
            pointerEvents: 'auto',
            alignItems: 'center',
            boxShadow: 6,
            cursor: toast.dismissOnClick ? 'pointer' : 'default',
          }}
        >
          {toast.text}
        </Alert>
      ))}
    </Stack>
  )
}

export default ToastNotifications
