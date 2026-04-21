import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded'
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded'
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded'
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded'
import FormatUnderlinedRoundedIcon from '@mui/icons-material/FormatUnderlinedRounded'
import RedoRoundedIcon from '@mui/icons-material/RedoRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import UndoRoundedIcon from '@mui/icons-material/UndoRounded'
import { Alert, Box, Button, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { selectHasElevatedAccess } from '../../auth/selectors'
import {
  type LandingPageContent,
  buildTelegramWireMessage,
  normalizeTelegramMessageLines,
  sanitizeLandingHeroHtml,
} from '../content'
import {
  selectLandingContent,
  selectLandingContentFetchError,
  selectLandingContentFetchStatus,
  selectLandingContentSaveError,
  selectLandingContentSaveStatus,
} from '../selectors'
import { landingContentSlice } from '../slice'

const createToolbarButtonSx = (isActive: boolean) => ({
  minWidth: 0,
  width: 40,
  height: 36,
  px: 0,
  borderRadius: 1.5,
  borderColor: isActive ? 'rgba(181, 58, 45, 0.45)' : 'rgba(18, 63, 84, 0.15)',
  backgroundColor: isActive ? 'rgba(181, 58, 45, 0.1)' : 'rgba(255, 255, 255, 0.88)',
})

type LandingPageControlsFormProps = {
  content: LandingPageContent
  fetchStatus: 'idle' | 'loading'
  saveStatus: 'idle' | 'saving' | 'success' | 'error'
  hasElevatedAccess: boolean
}

function LandingPageControlsForm({
  content,
  fetchStatus,
  saveStatus,
  hasElevatedAccess,
}: LandingPageControlsFormProps) {
  const dispatch = useAppDispatch()
  const [heroBodyHtmlDraft, setHeroBodyHtmlDraft] = useState(content.heroBodyHtml)
  const [telegramMessageLinesDraft, setTelegramMessageLinesDraft] = useState(
    content.telegramMessageLines,
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
      }),
      Underline,
    ],
    content: content.heroBodyHtml,
    onUpdate: ({ editor: currentEditor }) => {
      setHeroBodyHtmlDraft(currentEditor.getHTML())
    },
  })

  const normalizedHeroBodyHtmlDraft = useMemo(
    () => sanitizeLandingHeroHtml(heroBodyHtmlDraft),
    [heroBodyHtmlDraft],
  )
  const normalizedTelegramMessageLinesDraft = useMemo(
    () => normalizeTelegramMessageLines(telegramMessageLinesDraft),
    [telegramMessageLinesDraft],
  )
  const hasChanges =
    normalizedHeroBodyHtmlDraft !== content.heroBodyHtml ||
    JSON.stringify(normalizedTelegramMessageLinesDraft) !==
      JSON.stringify(content.telegramMessageLines)

  const wirePreview = useMemo(
    () => buildTelegramWireMessage(normalizedTelegramMessageLinesDraft),
    [normalizedTelegramMessageLinesDraft],
  )

  const updateTelegramLine = (index: number, value: string) => {
    setTelegramMessageLinesDraft((currentLines) =>
      currentLines.map((currentLine, currentIndex) =>
        currentIndex === index ? value : currentLine,
      ),
    )
  }

  const addTelegramLine = () => {
    setTelegramMessageLinesDraft((currentLines) => [...currentLines, ''])
  }

  const removeTelegramLine = (index: number) => {
    setTelegramMessageLinesDraft((currentLines) => {
      const nextLines = currentLines.filter((_, currentIndex) => currentIndex !== index)
      return nextLines.length > 0 ? nextLines : ['']
    })
  }

  const moveTelegramLine = (index: number, direction: 'up' | 'down') => {
    setTelegramMessageLinesDraft((currentLines) => {
      const nextIndex = direction === 'up' ? index - 1 : index + 1
      if (nextIndex < 0 || nextIndex >= currentLines.length) {
        return currentLines
      }

      const nextLines = [...currentLines]
      const itemToMove = nextLines[index]
      nextLines[index] = nextLines[nextIndex]
      nextLines[nextIndex] = itemToMove
      return nextLines
    })
  }

  const handleSave = () => {
    dispatch(
      landingContentSlice.actions.landingContentSaveRequested({
        heroBodyHtml: normalizedHeroBodyHtmlDraft,
        telegramMessageLines: normalizedTelegramMessageLinesDraft,
      }),
    )
  }

  return (
    <Stack spacing={2.5}>
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Hero text
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This rich text field replaces the current long-form paragraph in the public hero.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button
            variant="outlined"
            size="small"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            sx={createToolbarButtonSx(Boolean(editor?.isActive('bold')))}
          >
            <FormatBoldRoundedIcon fontSize="small" />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            sx={createToolbarButtonSx(Boolean(editor?.isActive('italic')))}
          >
            <FormatItalicRoundedIcon fontSize="small" />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            sx={createToolbarButtonSx(Boolean(editor?.isActive('underline')))}
          >
            <FormatUnderlinedRoundedIcon fontSize="small" />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            sx={createToolbarButtonSx(Boolean(editor?.isActive('bulletList')))}
          >
            <FormatListBulletedRoundedIcon fontSize="small" />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            sx={createToolbarButtonSx(Boolean(editor?.isActive('orderedList')))}
          >
            <FormatListNumberedRoundedIcon fontSize="small" />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => editor?.chain().focus().undo().run()}
            sx={createToolbarButtonSx(false)}
          >
            <UndoRoundedIcon fontSize="small" />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => editor?.chain().focus().redo().run()}
            sx={createToolbarButtonSx(false)}
          >
            <RedoRoundedIcon fontSize="small" />
          </Button>
        </Stack>

        <Box
          sx={{
            border: '1px solid rgba(18, 63, 84, 0.18)',
            borderRadius: 2,
            backgroundColor: '#fffdf8',
            overflow: 'hidden',
            '& .ProseMirror': {
              minHeight: 220,
              p: 2,
              outline: 'none',
              color: '#10222f',
            },
            '& .ProseMirror p': {
              my: 0,
            },
            '& .ProseMirror ul, & .ProseMirror ol': {
              pl: 3,
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Stack>

      <Divider />

      <Stack spacing={1.5}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Wire telegram message
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Each line becomes its own transmission segment. The app adds the [STOP] markers for you.
          </Typography>
        </Box>

        <Stack spacing={1.25}>
          {telegramMessageLinesDraft.map((line, index) => (
            <Stack
              key={`telegram-line-${index}`}
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
            >
              <TextField
                fullWidth
                label={`Line ${index + 1}`}
                value={line}
                onChange={(event) => updateTelegramLine(index, event.target.value)}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => moveTelegramLine(index, 'up')}
                  disabled={index === 0}
                  sx={{ minWidth: 44 }}
                >
                  <ArrowUpwardRoundedIcon fontSize="small" />
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => moveTelegramLine(index, 'down')}
                  disabled={index === telegramMessageLinesDraft.length - 1}
                  sx={{ minWidth: 44 }}
                >
                  <ArrowDownwardRoundedIcon fontSize="small" />
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => removeTelegramLine(index)}
                  disabled={telegramMessageLinesDraft.length === 1}
                  sx={{ minWidth: 44 }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </Button>
              </Stack>
            </Stack>
          ))}
        </Stack>

        <Box>
          <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={addTelegramLine}>
            Add message line
          </Button>
        </Box>

        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(18, 63, 84, 0.04)' }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            Transmission preview
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'IBM Plex Mono', mt: 0.5 }}>
            {wirePreview}
          </Typography>
        </Paper>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          {fetchStatus === 'loading'
            ? 'Refreshing landing-page content...'
            : 'Ready to publish changes.'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveRoundedIcon />}
          onClick={handleSave}
          disabled={!hasElevatedAccess || !hasChanges || saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save landing page'}
        </Button>
      </Stack>
    </Stack>
  )
}

function LandingPageControlsCard() {
  const content = useAppSelector(selectLandingContent)
  const fetchStatus = useAppSelector(selectLandingContentFetchStatus)
  const fetchError = useAppSelector(selectLandingContentFetchError)
  const saveStatus = useAppSelector(selectLandingContentSaveStatus)
  const saveError = useAppSelector(selectLandingContentSaveError)
  const hasElevatedAccess = useAppSelector(selectHasElevatedAccess)
  const contentRevisionKey = useMemo(
    () => JSON.stringify([content.heroBodyHtml, content.telegramMessageLines, content.updatedAt]),
    [content.heroBodyHtml, content.telegramMessageLines, content.updatedAt],
  )

  return (
    <Paper
      id="dashboard-landing-page-controls"
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        border: '1px solid rgba(18, 63, 84, 0.15)',
        background: 'rgba(255, 255, 255, 0.92)',
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="overline" sx={{ fontFamily: 'IBM Plex Mono', color: '#0f485e' }}>
            Landing Page
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            Landing page controls
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage public-facing hero copy and wire transmission messaging without a deploy.
          </Typography>
          {content.updatedAt && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Last synced {content.updatedAt}
              {content.updatedBy ? ` by ${content.updatedBy}` : ''}
            </Typography>
          )}
        </Box>

        {fetchError && <Alert severity="error">{fetchError}</Alert>}
        {saveError && <Alert severity="error">{saveError}</Alert>}
        {saveStatus === 'success' && (
          <Alert severity="success">Landing page content saved to Firestore.</Alert>
        )}
        {!hasElevatedAccess && (
          <Alert severity="warning">
            Your account can view these controls, but Firestore writes require elevated access.
          </Alert>
        )}

        <Divider />

        <LandingPageControlsForm
          key={contentRevisionKey}
          content={content}
          fetchStatus={fetchStatus}
          saveStatus={saveStatus}
          hasElevatedAccess={hasElevatedAccess}
        />
      </Stack>
    </Paper>
  )
}

export default LandingPageControlsCard
