import { useMemo, useState } from 'react'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import FilePresentRoundedIcon from '@mui/icons-material/FilePresentRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import { Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material'
import type { FeaturedInventoryFile, FeaturedInventoryItem } from '../../featuredInventory/slice'

export type ListingViewGalleryPalette = {
  galleryBackground: string
  galleryShellBackground: string
  galleryShellBorder: string
  galleryViewportBackground: string
  galleryViewportBorder: string
  galleryText: string
  galleryMutedText: string
  galleryAccent: string
  galleryButtonBorder: string
}

type ListingViewGalleryProps = {
  item: FeaturedInventoryItem
  listingPalette: ListingViewGalleryPalette
}

const isImageFile = (storedFile: FeaturedInventoryFile) => {
  if (storedFile.contentType.toLowerCase().startsWith('image/')) {
    return true
  }

  const extension = (storedFile.name || storedFile.url).split('.').at(-1)?.toLowerCase() ?? ''
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif', 'tif', 'tiff'].includes(
    extension,
  )
}

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function ListingViewGallery({ item, listingPalette }: ListingViewGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const imageFiles = useMemo(
    () => item.files.filter((storedFile) => isImageFile(storedFile)),
    [item.files],
  )
  const attachmentFiles = useMemo(
    () => item.files.filter((storedFile) => !isImageFile(storedFile)),
    [item.files],
  )
  const activeImageIndex =
    imageFiles.length === 0 ? 0 : Math.min(selectedImageIndex, imageFiles.length - 1)
  const activeImage = imageFiles[activeImageIndex] ?? null
  const canCycleImages = imageFiles.length > 1

  const showPreviousImage = () => {
    if (imageFiles.length === 0) {
      return
    }

    setSelectedImageIndex((previous) => (previous === 0 ? imageFiles.length - 1 : previous - 1))
  }

  const showNextImage = () => {
    if (imageFiles.length === 0) {
      return
    }

    setSelectedImageIndex((previous) => (previous + 1) % imageFiles.length)
  }

  return (
    <Box
      sx={{
        width: { xs: '100%', md: '54%' },
        background: listingPalette.galleryBackground,
        color: listingPalette.galleryText,
        p: { xs: 2, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          p: { xs: 1.5, md: 2 },
          borderRadius: 4,
          background: listingPalette.galleryShellBackground,
          border: `1px solid ${listingPalette.galleryShellBorder}`,
        }}
      >
        <Stack spacing={1.5} sx={{ height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" sx={{ color: listingPalette.galleryText }}>
              Photo Gallery
            </Typography>
            {canCycleImages ? (
              <Paper
                elevation={0}
                sx={{
                  px: 0.5,
                  py: 0.375,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.25,
                  borderRadius: 999,
                  background: listingPalette.galleryShellBackground,
                  border: `1px solid ${listingPalette.galleryButtonBorder}`,
                }}
              >
                <IconButton
                  aria-label="Show previous listing image"
                  onClick={showPreviousImage}
                  size="small"
                  sx={{
                    color: listingPalette.galleryText,
                    width: 34,
                    height: 34,
                  }}
                >
                  <ChevronLeftRoundedIcon fontSize="small" />
                </IconButton>
                <Typography
                  variant="caption"
                  sx={{
                    minWidth: 44,
                    textAlign: 'center',
                    color: listingPalette.galleryText,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                  }}
                >
                  {activeImageIndex + 1} / {imageFiles.length}
                </Typography>
                <IconButton
                  aria-label="Show next listing image"
                  onClick={showNextImage}
                  size="small"
                  sx={{
                    color: listingPalette.galleryText,
                    width: 34,
                    height: 34,
                  }}
                >
                  <ChevronRightRoundedIcon fontSize="small" />
                </IconButton>
              </Paper>
            ) : imageFiles.length > 0 ? (
              <Paper
                elevation={0}
                sx={{
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 999,
                  background: listingPalette.galleryShellBackground,
                  border: `1px solid ${listingPalette.galleryButtonBorder}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: listingPalette.galleryText,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                  }}
                >
                  1 / 1
                </Typography>
              </Paper>
            ) : null}
          </Stack>

          <Box
            sx={{
              flex: 1,
              minHeight: { xs: 320, md: 520 },
              borderRadius: 2,
              overflow: 'hidden',
              display: 'grid',
              placeItems: 'center',
              background: listingPalette.galleryViewportBackground,
              border: `1px solid ${listingPalette.galleryViewportBorder}`,
            }}
          >
            {activeImage ? (
              <Box
                component="img"
                src={activeImage.url}
                alt={activeImage.name || item.title}
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Stack
                spacing={1}
                sx={{ px: 4, textAlign: 'center', color: listingPalette.galleryMutedText }}
              >
                <Typography variant="h6">No listing image available yet</Typography>
                <Typography variant="body2">
                  This preview can still show the item details and attachments below.
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </Paper>

      {imageFiles.length > 0 ? (
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5, pt: 0.25 }}>
          {imageFiles.map((storedFile, index) => (
            <Box
              key={`${storedFile.url}-${storedFile.displayOrder}`}
              component="button"
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              sx={{
                p: 0,
                width: 88,
                height: 88,
                borderRadius: 2,
                overflow: 'hidden',
                border:
                  index === activeImageIndex
                    ? `2px solid ${listingPalette.galleryAccent}`
                    : `1px solid ${listingPalette.galleryButtonBorder}`,
                background: listingPalette.galleryShellBackground,
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <Box
                component="img"
                src={storedFile.url}
                alt={storedFile.name || `${item.title} image ${index + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Stack>
      ) : null}

      {attachmentFiles.length > 0 ? (
        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ color: listingPalette.galleryAccent }}>
            Attachments
          </Typography>
          <Stack spacing={1}>
            {attachmentFiles.map((storedFile) => (
              <Paper
                key={`${storedFile.url}-${storedFile.displayOrder}`}
                elevation={0}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  background: listingPalette.galleryShellBackground,
                  border: `1px solid ${listingPalette.galleryShellBorder}`,
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                  <FilePresentRoundedIcon
                    fontSize="small"
                    sx={{ color: listingPalette.galleryAccent }}
                  />
                  <Stack sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: listingPalette.galleryText }} noWrap>
                      {storedFile.name || 'Attachment'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: listingPalette.galleryMutedText }}>
                      {storedFile.size > 0 ? formatFileSize(storedFile.size) : 'Document'}
                    </Typography>
                  </Stack>
                </Stack>
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                  href={storedFile.url}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ borderColor: listingPalette.galleryButtonBorder }}
                >
                  Open
                </Button>
              </Paper>
            ))}
          </Stack>
        </Stack>
      ) : null}
    </Box>
  )
}

export default ListingViewGallery
