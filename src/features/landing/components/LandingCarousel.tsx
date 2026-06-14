import { useEffect, useMemo, useState, type ReactNode } from 'react'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { Box, IconButton, Stack, useMediaQuery } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'

type LandingCarouselFlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse'
type LandingCarouselDirection = 'forward' | 'backward'
type LandingCarouselViewport = 1 | 2 | 3

type LandingCarouselProps<Item> = {
  items: Item[]
  isPaused?: boolean
  previousAriaLabel: string
  nextAriaLabel: string
  controlSx?: SxProps<Theme>
  useFlexGap?: boolean
  flexWrap?: LandingCarouselFlexWrap
  renderItems: (visibleItems: Item[]) => ReactNode
}

const CAROUSEL_AUTOPLAY_MS = 6500
const CAROUSEL_INTERACTION_PAUSE_MS = 10000
const CAROUSEL_TRANSITION_MS = 420

const defaultCarouselControlSx: SxProps<Theme> = {
  width: { xs: 52, md: 64 },
  height: { xs: 52, md: 64 },
  flexShrink: 0,
  alignSelf: 'center',
  border: '2px outset beige',
  borderRadius: '1rem !important',
  background:
    'linear-gradient(180deg, rgba(255, 252, 244, 0.98) 0%, rgba(230, 222, 203, 0.98) 100%)',
  color: 'rgba(19, 40, 60, 0.92)',
  boxShadow: '0 10px 22px rgba(19, 40, 60, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.75)',
  transition: 'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
  '&:hover': {
    background: 'linear-gradient(180deg, rgba(255, 250, 239, 1) 0%, rgba(225, 214, 191, 1) 100%)',
    boxShadow: '0 14px 28px rgba(19, 40, 60, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    transform: 'translateY(-1px)',
  },
  '&.Mui-disabled': {
    background: 'rgba(236, 232, 219, 0.88)',
    color: 'rgba(19, 40, 60, 0.3)',
    boxShadow: 'none',
    borderColor: 'rgba(19, 40, 60, 0.05)',
  },
}

function LandingCarousel<Item>({
  items,
  isPaused = false,
  previousAriaLabel,
  nextAriaLabel,
  controlSx = defaultCarouselControlSx,
  useFlexGap = false,
  flexWrap,
  renderItems,
}: LandingCarouselProps<Item>) {
  const theme = useTheme()
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'))
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const [carouselStart, setCarouselStart] = useState(0)
  const [autoplayResumeAt, setAutoplayResumeAt] = useState(0)
  const [isCarouselHovered, setIsCarouselHovered] = useState(false)
  const [transitionDirection, setTransitionDirection] =
    useState<LandingCarouselDirection>('forward')
  const [transitionNonce, setTransitionNonce] = useState(0)
  const carouselLength = items.length
  const carouselViewport: LandingCarouselViewport = isMdUp ? 3 : isSmUp ? 2 : 1
  const canSlide = carouselLength > carouselViewport
  const normalizedCarouselStart = carouselLength === 0 ? 0 : carouselStart % carouselLength

  const visibleItems = useMemo(() => {
    if (carouselLength === 0) {
      return []
    }

    if (!canSlide) {
      return items
    }

    const nextItems: Item[] = []
    let index = normalizedCarouselStart

    for (let count = 0; count < carouselViewport; count += 1) {
      const item = items[index]

      if (!item) {
        break
      }

      nextItems.push(item)
      index = (index + 1) % carouselLength
    }

    return nextItems
  }, [canSlide, carouselLength, carouselViewport, items, normalizedCarouselStart])

  const pauseAutoplay = () => {
    setAutoplayResumeAt(Date.now() + CAROUSEL_INTERACTION_PAUSE_MS)
  }

  const queueTransition = (direction: LandingCarouselDirection) => {
    setTransitionDirection(direction)
    setTransitionNonce((previous) => previous + 1)
  }

  const showPreviousItems = () => {
    if (carouselLength === 0) {
      return
    }

    pauseAutoplay()
    queueTransition('backward')
    setCarouselStart((previous) => (previous - 1 + carouselLength) % carouselLength)
  }

  const showNextItems = () => {
    if (carouselLength === 0) {
      return
    }

    pauseAutoplay()
    queueTransition('forward')
    setCarouselStart((previous) => (previous + 1) % carouselLength)
  }

  useEffect(() => {
    if (!canSlide || isCarouselHovered || isPaused) {
      return undefined
    }

    const now = Date.now()
    const delay = autoplayResumeAt > now ? autoplayResumeAt - now : CAROUSEL_AUTOPLAY_MS
    const timeoutId = window.setTimeout(() => {
      queueTransition('forward')
      setCarouselStart((previous) => (previous + 1) % carouselLength)
    }, delay)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [autoplayResumeAt, canSlide, carouselLength, carouselStart, isCarouselHovered, isPaused])

  return (
    <Stack
      direction="row"
      spacing={{ xs: 1.5, md: 2 }}
      alignItems="stretch"
      onMouseEnter={() => setIsCarouselHovered(true)}
      onMouseLeave={() => setIsCarouselHovered(false)}
    >
      <IconButton
        onClick={showPreviousItems}
        disabled={!canSlide}
        aria-label={previousAriaLabel}
        sx={{
          ...controlSx,
          display: { xs: 'none', md: 'inline-flex' },
        }}
      >
        <ChevronLeftRoundedIcon sx={{ fontSize: { xs: 34, md: 42 } }} />
      </IconButton>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            useFlexGap={useFlexGap}
            flexWrap={flexWrap}
            sx={{
              minWidth: 0,
              willChange: transitionNonce === 0 ? 'auto' : 'transform, opacity',
              animation:
                transitionNonce === 0
                  ? 'none'
                  : `${
                      transitionDirection === 'backward'
                        ? transitionNonce % 2 === 0
                          ? 'carouselSlideBackwardA'
                          : 'carouselSlideBackwardB'
                        : transitionNonce % 2 === 0
                          ? 'carouselSlideForwardA'
                          : 'carouselSlideForwardB'
                    } ${CAROUSEL_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              '@keyframes carouselSlideForward': {
                from: {
                  opacity: 0.82,
                  transform: 'translate3d(18px, 0, 0)',
                },
                to: {
                  opacity: 1,
                  transform: 'translate3d(0, 0, 0)',
                },
              },
              '@keyframes carouselSlideBackward': {
                from: {
                  opacity: 0.82,
                  transform: 'translate3d(-18px, 0, 0)',
                },
                to: {
                  opacity: 1,
                  transform: 'translate3d(0, 0, 0)',
                },
              },
              '@keyframes carouselSlideForwardA': {
                from: {
                  opacity: 0.82,
                  transform: 'translate3d(18px, 0, 0)',
                },
                to: {
                  opacity: 1,
                  transform: 'translate3d(0, 0, 0)',
                },
              },
              '@keyframes carouselSlideForwardB': {
                from: {
                  opacity: 0.82,
                  transform: 'translate3d(18px, 0, 0)',
                },
                to: {
                  opacity: 1,
                  transform: 'translate3d(0, 0, 0)',
                },
              },
              '@keyframes carouselSlideBackwardA': {
                from: {
                  opacity: 0.82,
                  transform: 'translate3d(-18px, 0, 0)',
                },
                to: {
                  opacity: 1,
                  transform: 'translate3d(0, 0, 0)',
                },
              },
              '@keyframes carouselSlideBackwardB': {
                from: {
                  opacity: 0.82,
                  transform: 'translate3d(-18px, 0, 0)',
                },
                to: {
                  opacity: 1,
                  transform: 'translate3d(0, 0, 0)',
                },
              },
            }}
          >
            {renderItems(visibleItems)}
          </Stack>
        </Box>
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="center"
          sx={{ display: { xs: 'flex', md: 'none' }, mt: 1.5 }}
        >
          <IconButton
            onClick={showPreviousItems}
            disabled={!canSlide}
            aria-label={previousAriaLabel}
            sx={controlSx}
          >
            <ChevronLeftRoundedIcon sx={{ fontSize: { xs: 34, md: 42 } }} />
          </IconButton>
          <IconButton
            onClick={showNextItems}
            disabled={!canSlide}
            aria-label={nextAriaLabel}
            sx={controlSx}
          >
            <ChevronRightRoundedIcon sx={{ fontSize: { xs: 34, md: 42 } }} />
          </IconButton>
        </Stack>
      </Box>
      <IconButton
        onClick={showNextItems}
        disabled={!canSlide}
        aria-label={nextAriaLabel}
        sx={{
          ...controlSx,
          display: { xs: 'none', md: 'inline-flex' },
        }}
      >
        <ChevronRightRoundedIcon sx={{ fontSize: { xs: 34, md: 42 } }} />
      </IconButton>
    </Stack>
  )
}

export default LandingCarousel
