import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import {
  bindingTypeOptions,
  collectorConditionCategoryOptions,
  completenessStatusOptions,
  cornerConditionOptions,
  edgeConditionOptions,
  foldoutConditionOptions,
  glossLevelOptions,
  inkConditionOptions,
  ligninOdorLevelOptions,
  paperRigidityOptions,
  paperSurfaceQualityOptions,
  paperThicknessOptions,
  pinholeStatusOptions,
  presenceFlagOptions,
  spineConditionOptions,
  stapleConditionOptions,
  surfaceIssueOptions,
  toningLevelOptions,
  writingMediumOptions,
  type AgingAssessment,
  type BindingAssessment,
  type EdgeCornerAssessment,
  type FoldoutInsertAssessment,
  type HandwritingAssessment,
  type RestorationAssessment,
  type StampAssessment,
  type StructuralMarksAssessment,
  type StructureAssessment,
  type SurfaceAssessment,
  type VintagePaperConditionReport,
} from '../condition-report'
import {
  selectInventoryAddForm,
  selectInventoryConditionReportDialogForm,
  selectInventoryConditionReportDialogOpen,
  selectInventoryEditForm,
} from '../selectors'
import { inventorySlice } from '../slice'

const conditionReportSteps = [
  'Basics',
  'Surface & structure',
  'Edges & binding',
  'Inserts & marks',
  'Aging & summary',
] as const

const createEmptyReport = (): VintagePaperConditionReport => ({
  itemTitle: '',
})

const hasValue = (value: unknown) =>
  value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)

const mergeSection = <T extends object>(current: T | undefined, updates: Partial<T>) => {
  const next = { ...(current ?? {}), ...updates }
  return Object.values(next).some(hasValue) ? next : undefined
}

const toOptionalNumber = (value: string) => {
  if (!value.trim()) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

const isOptionValue = <T extends readonly string[]>(
  options: T,
  value: string,
): value is T[number] => options.includes(value)

const toOptionValue = <T extends readonly string[]>(options: T, value: string) =>
  isOptionValue(options, value) ? value : undefined

const toOptionArray = <T extends readonly string[]>(options: T, value: string | string[]) => {
  const entries = Array.isArray(value) ? value : value.split(',').filter(Boolean)
  const filtered = entries.filter((entry): entry is T[number] => isOptionValue(options, entry))
  return filtered.length > 0 ? filtered : undefined
}

const isNumberOptionValue = <T extends readonly number[]>(
  options: T,
  value: number,
): value is T[number] => options.includes(value)

const toNumberOptionValue = <T extends readonly number[]>(options: T, value: string) => {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  return isNumberOptionValue(options, parsed) ? parsed : undefined
}

const ConditionReportDialog = () => {
  const dispatch = useAppDispatch()
  const dialogOpen = useAppSelector(selectInventoryConditionReportDialogOpen)
  const dialogForm = useAppSelector(selectInventoryConditionReportDialogForm)
  const addForm = useAppSelector(selectInventoryAddForm)
  const editForm = useAppSelector(selectInventoryEditForm)
  const [activeStep, setActiveStep] = useState(0)
  const [draft, setDraft] = useState<VintagePaperConditionReport>(createEmptyReport)

  const currentReport = dialogForm === 'edit' ? editForm.conditionReport : addForm.conditionReport

  const initializeDraft = () => {
    setDraft(currentReport ?? createEmptyReport())
    setActiveStep(0)
  }

  const closeDialog = () => {
    dispatch(inventorySlice.actions.conditionReportDialogClosed())
  }

  const handleSave = () => {
    if (!dialogForm) {
      closeDialog()
      return
    }

    dispatch(
      inventorySlice.actions.inventoryConditionReportSaved({
        form: dialogForm,
        report: draft,
      }),
    )
    closeDialog()
  }

  const handleClear = () => {
    if (!dialogForm) {
      closeDialog()
      return
    }

    dispatch(
      inventorySlice.actions.inventoryConditionReportSaved({
        form: dialogForm,
        report: null,
      }),
    )
    closeDialog()
  }

  const updateReport = (updates: Partial<VintagePaperConditionReport>) => {
    setDraft((current) => ({
      ...current,
      ...updates,
    }))
  }

  const updateDimensions = (field: 'width' | 'height' | 'depth', value: string) => {
    setDraft((current) => ({
      ...current,
      dimensionsInInches: mergeSection(current.dimensionsInInches, {
        width: field === 'width' ? toOptionalNumber(value) : current.dimensionsInInches?.width,
        height: field === 'height' ? toOptionalNumber(value) : current.dimensionsInInches?.height,
        depth: field === 'depth' ? toOptionalNumber(value) : current.dimensionsInInches?.depth,
      }),
    }))
  }

  const updateSurface = (updates: Partial<SurfaceAssessment>) => {
    setDraft((current) => ({
      ...current,
      surface: mergeSection(current.surface, updates),
    }))
  }

  const updateStructure = (updates: Partial<StructureAssessment>) => {
    setDraft((current) => ({
      ...current,
      structure: mergeSection(current.structure, updates),
    }))
  }

  const updateEdges = (updates: Partial<EdgeCornerAssessment>) => {
    setDraft((current) => ({
      ...current,
      edgesAndCorners: mergeSection(current.edgesAndCorners, updates),
    }))
  }

  const updateBinding = (updates: Partial<BindingAssessment>) => {
    setDraft((current) => ({
      ...current,
      binding: mergeSection(current.binding, updates),
    }))
  }

  const updateFoldouts = (updates: Partial<FoldoutInsertAssessment>) => {
    setDraft((current) => ({
      ...current,
      foldoutsAndInserts: mergeSection(current.foldoutsAndInserts, updates),
    }))
  }

  const updateMarks = (updates: Partial<StructuralMarksAssessment>) => {
    setDraft((current) => ({
      ...current,
      structuralMarks: mergeSection(current.structuralMarks, updates),
    }))
  }

  const updateStamp = (updates: Partial<StampAssessment>) => {
    setDraft((current) => ({
      ...current,
      travelAgencyStamp: mergeSection(current.travelAgencyStamp, updates),
    }))
  }

  const updateHandwriting = (updates: Partial<HandwritingAssessment>) => {
    setDraft((current) => ({
      ...current,
      handwrittenNotes: mergeSection(current.handwrittenNotes, updates),
    }))
  }

  const updateRestoration = (updates: Partial<RestorationAssessment>) => {
    setDraft((current) => ({
      ...current,
      restorationNotes: mergeSection(current.restorationNotes, updates),
    }))
  }

  const updateAging = (updates: Partial<AgingAssessment>) => {
    setDraft((current) => ({
      ...current,
      aging: mergeSection(current.aging, updates),
    }))
  }

  const canSave = draft.itemTitle.trim().length > 0
  const isLastStep = activeStep === conditionReportSteps.length - 1

  const handleNext = () => {
    setActiveStep((step) => Math.min(step + 1, conditionReportSteps.length - 1))
  }

  const handleBack = () => {
    setActiveStep((step) => Math.max(step - 1, 0))
  }

  const renderBasics = () => (
    <Stack spacing={2}>
      <TextField
        label="Item title"
        value={draft.itemTitle}
        onChange={(event) => updateReport({ itemTitle: event.target.value })}
        required
        fullWidth
      />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Publisher or line"
          value={draft.publisherOrLine ?? ''}
          onChange={(event) => updateReport({ publisherOrLine: event.target.value })}
          fullWidth
        />
        <TextField
          label="Approximate year"
          value={draft.approximateYear ?? ''}
          onChange={(event) => updateReport({ approximateYear: event.target.value })}
          fullWidth
        />
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Format"
          value={draft.format ?? ''}
          onChange={(event) => updateReport({ format: event.target.value })}
          fullWidth
        />
        <TextField
          label="Page count"
          type="number"
          value={draft.pageCount ?? ''}
          onChange={(event) => updateReport({ pageCount: toOptionalNumber(event.target.value) })}
          fullWidth
        />
      </Stack>
      <Typography variant="subtitle2" color="text.secondary">
        Dimensions (inches)
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Width"
          type="number"
          value={draft.dimensionsInInches?.width ?? ''}
          onChange={(event) => updateDimensions('width', event.target.value)}
          fullWidth
        />
        <TextField
          label="Height"
          type="number"
          value={draft.dimensionsInInches?.height ?? ''}
          onChange={(event) => updateDimensions('height', event.target.value)}
          fullWidth
        />
        <TextField
          label="Depth"
          type="number"
          value={draft.dimensionsInInches?.depth ?? ''}
          onChange={(event) => updateDimensions('depth', event.target.value)}
          fullWidth
        />
      </Stack>
    </Stack>
  )

  const renderSurfaceStructure = () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">
        Surface assessment
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          select
          label="Surface quality"
          value={draft.surface?.quality ?? ''}
          onChange={(event) =>
            updateSurface({
              quality: toOptionValue(paperSurfaceQualityOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {paperSurfaceQualityOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Gloss"
          value={draft.surface?.gloss ?? ''}
          onChange={(event) =>
            updateSurface({ gloss: toOptionValue(glossLevelOptions, event.target.value) })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {glossLevelOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Ink condition"
          value={draft.surface?.inkCondition ?? ''}
          onChange={(event) =>
            updateSurface({
              inkCondition: toOptionValue(inkConditionOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {inkConditionOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <TextField
        select
        label="Surface issues"
        value={draft.surface?.issues ?? []}
        SelectProps={{
          multiple: true,
          renderValue: (selected) =>
            Array.isArray(selected) ? selected.join(', ') : String(selected),
        }}
        onChange={(event) => {
          const nextValue = toOptionArray(surfaceIssueOptions, event.target.value)
          updateSurface({ issues: nextValue })
        }}
        fullWidth
      >
        {surfaceIssueOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option.replace(/_/g, ' ')}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Surface notes"
        value={draft.surface?.notes ?? ''}
        onChange={(event) => updateSurface({ notes: event.target.value })}
        fullWidth
        multiline
        minRows={2}
      />
      <Typography variant="subtitle2" color="text.secondary">
        Structure assessment
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          select
          label="Rigidity"
          value={draft.structure?.rigidity ?? ''}
          onChange={(event) =>
            updateStructure({ rigidity: toOptionValue(paperRigidityOptions, event.target.value) })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {paperRigidityOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Thickness"
          value={draft.structure?.thickness ?? ''}
          onChange={(event) =>
            updateStructure({
              thickness: toOptionValue(paperThicknessOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {paperThicknessOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Completeness"
          value={draft.structure?.completeness ?? ''}
          onChange={(event) =>
            updateStructure({
              completeness: toOptionValue(completenessStatusOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {completenessStatusOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <TextField
        label="Structure notes"
        value={draft.structure?.notes ?? ''}
        onChange={(event) => updateStructure({ notes: event.target.value })}
        fullWidth
        multiline
        minRows={2}
      />
    </Stack>
  )

  const renderEdgesBinding = () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">
        Edges & corners
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          select
          label="Edge condition"
          value={draft.edgesAndCorners?.edgeCondition ?? ''}
          onChange={(event) =>
            updateEdges({
              edgeCondition: toOptionValue(edgeConditionOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {edgeConditionOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Corner condition"
          value={draft.edgesAndCorners?.cornerCondition ?? ''}
          onChange={(event) =>
            updateEdges({
              cornerCondition: toOptionValue(cornerConditionOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {cornerConditionOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Edge toning"
          value={draft.edgesAndCorners?.edgeToning ?? ''}
          onChange={(event) =>
            updateEdges({ edgeToning: toNumberOptionValue(toningLevelOptions, event.target.value) })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {toningLevelOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <TextField
        label="Edge notes"
        value={draft.edgesAndCorners?.notes ?? ''}
        onChange={(event) => updateEdges({ notes: event.target.value })}
        fullWidth
        multiline
        minRows={2}
      />
      <Typography variant="subtitle2" color="text.secondary">
        Binding
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          select
          label="Binding type"
          value={draft.binding?.type ?? ''}
          onChange={(event) =>
            updateBinding({ type: toOptionValue(bindingTypeOptions, event.target.value) })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {bindingTypeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Staple condition"
          value={draft.binding?.stapleCondition ?? ''}
          onChange={(event) =>
            updateBinding({
              stapleCondition: toOptionValue(stapleConditionOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {stapleConditionOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Spine condition"
          value={draft.binding?.spineCondition ?? ''}
          onChange={(event) =>
            updateBinding({
              spineCondition: toOptionValue(spineConditionOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {spineConditionOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <TextField
        label="Binding notes"
        value={draft.binding?.notes ?? ''}
        onChange={(event) => updateBinding({ notes: event.target.value })}
        fullWidth
        multiline
        minRows={2}
      />
    </Stack>
  )

  const renderInsertsMarks = () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">
        Foldouts & inserts
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          select
          label="Has foldouts"
          value={
            draft.foldoutsAndInserts?.hasFoldouts === undefined
              ? ''
              : String(draft.foldoutsAndInserts?.hasFoldouts)
          }
          onChange={(event) =>
            updateFoldouts({
              hasFoldouts: event.target.value === '' ? undefined : event.target.value === 'true',
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </TextField>
        <TextField
          select
          label="Foldout condition"
          value={draft.foldoutsAndInserts?.foldoutCondition ?? ''}
          onChange={(event) =>
            updateFoldouts({
              foldoutCondition: toOptionValue(foldoutConditionOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {foldoutConditionOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Insert status"
          value={draft.foldoutsAndInserts?.insertStatus ?? ''}
          onChange={(event) =>
            updateFoldouts({
              insertStatus: toOptionValue(completenessStatusOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {completenessStatusOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <TextField
        label="Foldout notes"
        value={draft.foldoutsAndInserts?.notes ?? ''}
        onChange={(event) => updateFoldouts({ notes: event.target.value })}
        fullWidth
        multiline
        minRows={2}
      />
      <Typography variant="subtitle2" color="text.secondary">
        Structural marks
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          select
          label="Fold junction pinholes"
          value={draft.structuralMarks?.foldJunctionPinholes ?? ''}
          onChange={(event) =>
            updateMarks({
              foldJunctionPinholes: toOptionValue(pinholeStatusOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {pinholeStatusOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Handling creases"
          value={draft.structuralMarks?.handlingCreases ?? ''}
          onChange={(event) =>
            updateMarks({
              handlingCreases: toOptionValue(presenceFlagOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {presenceFlagOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <TextField
        label="Structural marks notes"
        value={draft.structuralMarks?.notes ?? ''}
        onChange={(event) => updateMarks({ notes: event.target.value })}
        fullWidth
        multiline
        minRows={2}
      />
      <Typography variant="subtitle2" color="text.secondary">
        Stamps & handwriting
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          select
          label="Travel agency stamp"
          value={draft.travelAgencyStamp?.status ?? ''}
          onChange={(event) =>
            updateStamp({ status: toOptionValue(presenceFlagOptions, event.target.value) })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {presenceFlagOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Stamp text"
          value={draft.travelAgencyStamp?.text ?? ''}
          onChange={(event) => updateStamp({ text: event.target.value })}
          fullWidth
        />
        <TextField
          label="Stamp location"
          value={draft.travelAgencyStamp?.location ?? ''}
          onChange={(event) => updateStamp({ location: event.target.value })}
          fullWidth
        />
      </Stack>
      <TextField
        label="Stamp notes"
        value={draft.travelAgencyStamp?.notes ?? ''}
        onChange={(event) => updateStamp({ notes: event.target.value })}
        fullWidth
        multiline
        minRows={2}
      />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          select
          label="Handwritten notes"
          value={draft.handwrittenNotes?.status ?? ''}
          onChange={(event) =>
            updateHandwriting({ status: toOptionValue(presenceFlagOptions, event.target.value) })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {presenceFlagOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Writing medium"
          value={draft.handwrittenNotes?.medium ?? ''}
          onChange={(event) =>
            updateHandwriting({ medium: toOptionValue(writingMediumOptions, event.target.value) })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {writingMediumOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Handwriting description"
          value={draft.handwrittenNotes?.description ?? ''}
          onChange={(event) => updateHandwriting({ description: event.target.value })}
          fullWidth
        />
      </Stack>
      <TextField
        label="Handwriting notes"
        value={draft.handwrittenNotes?.notes ?? ''}
        onChange={(event) => updateHandwriting({ notes: event.target.value })}
        fullWidth
        multiline
        minRows={2}
      />
      <TextField
        select
        label="Restoration status"
        value={draft.restorationNotes?.status ?? ''}
        onChange={(event) =>
          updateRestoration({ status: toOptionValue(presenceFlagOptions, event.target.value) })
        }
        fullWidth
      >
        <MenuItem value="">Not set</MenuItem>
        {presenceFlagOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option.replace(/_/g, ' ')}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Restoration description"
        value={draft.restorationNotes?.description ?? ''}
        onChange={(event) => updateRestoration({ description: event.target.value })}
        fullWidth
      />
      <TextField
        label="Restoration notes"
        value={draft.restorationNotes?.notes ?? ''}
        onChange={(event) => updateRestoration({ notes: event.target.value })}
        fullWidth
        multiline
        minRows={2}
      />
    </Stack>
  )

  const renderAgingSummary = () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">
        Aging
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          select
          label="Toning scale"
          value={draft.aging?.toningScale ?? ''}
          onChange={(event) =>
            updateAging({
              toningScale: toNumberOptionValue(toningLevelOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {toningLevelOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Lignin odor scale"
          value={draft.aging?.ligninSmellScale ?? ''}
          onChange={(event) =>
            updateAging({
              ligninSmellScale: toNumberOptionValue(ligninOdorLevelOptions, event.target.value),
            })
          }
          fullWidth
        >
          <MenuItem value="">Not set</MenuItem>
          {ligninOdorLevelOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <TextField
        label="Aging notes"
        value={draft.aging?.notes ?? ''}
        onChange={(event) => updateAging({ notes: event.target.value })}
        fullWidth
        multiline
        minRows={2}
      />
      <Typography variant="subtitle2" color="text.secondary">
        Overall summary
      </Typography>
      <TextField
        select
        label="Overall condition"
        value={draft.overallConditionCategory ?? ''}
        onChange={(event) =>
          updateReport({
            overallConditionCategory: toOptionValue(
              collectorConditionCategoryOptions,
              event.target.value,
            ),
          })
        }
        fullWidth
      >
        <MenuItem value="">Not set</MenuItem>
        {collectorConditionCategoryOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option.replace(/_/g, ' ')}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Overall summary"
        value={draft.overallSummary ?? ''}
        onChange={(event) => updateReport({ overallSummary: event.target.value })}
        fullWidth
        multiline
        minRows={3}
      />
    </Stack>
  )

  const stepContent = () => {
    switch (activeStep) {
      case 0:
        return renderBasics()
      case 1:
        return renderSurfaceStructure()
      case 2:
        return renderEdgesBinding()
      case 3:
        return renderInsertsMarks()
      case 4:
        return renderAgingSummary()
      default:
        return null
    }
  }

  return (
    <Dialog
      open={dialogOpen}
      onClose={closeDialog}
      maxWidth="md"
      fullWidth
      TransitionProps={{ onEnter: initializeDraft }}
    >
      <DialogTitle>Condition report</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {conditionReportSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {stepContent()}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button variant="text" color="error" onClick={handleClear}>
          Clear report
        </Button>
        <Stack direction="row" spacing={1}>
          <Button variant="text" onClick={closeDialog}>
            Cancel
          </Button>
          <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0}>
            Back
          </Button>
          {isLastStep ? (
            <Button variant="contained" onClick={handleSave} disabled={!canSave}>
              Save report
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  )
}

export default ConditionReportDialog
