export const paperSurfaceQualityOptions = [
  'smooth',
  'lightly_textured',
  'textured',
  'coated',
  'uncoated',
] as const

export type PaperSurfaceQuality = (typeof paperSurfaceQualityOptions)[number]

export const glossLevelOptions = ['matte', 'semi_gloss', 'gloss'] as const

export type GlossLevel = (typeof glossLevelOptions)[number]

export const inkConditionOptions = [
  'strong',
  'slight_fading',
  'moderate_fading',
  'heavy_fading',
] as const

export type InkCondition = (typeof inkConditionOptions)[number]

export const surfaceIssueOptions = [
  'none',
  'light_scuffing',
  'handling_marks',
  'staining',
  'foxing',
  'soiling',
  'abrasion',
  'creasing',
] as const

export type SurfaceIssue = (typeof surfaceIssueOptions)[number]

export const paperRigidityOptions = [
  'crisp',
  'firm',
  'moderately_flexible',
  'soft',
  'fragile',
] as const

export type PaperRigidity = (typeof paperRigidityOptions)[number]

export const paperThicknessOptions = ['thin', 'medium', 'heavy_stock'] as const

export type PaperThickness = (typeof paperThicknessOptions)[number]

export const completenessStatusOptions = [
  'complete',
  'missing_pages',
  'detached_pages',
  'missing_inserts',
  'incomplete_unknown',
] as const

export type CompletenessStatus = (typeof completenessStatusOptions)[number]

export const edgeConditionOptions = [
  'sharp',
  'light_wear',
  'moderate_wear',
  'fraying',
  'chipping',
] as const

export type EdgeCondition = (typeof edgeConditionOptions)[number]

export const cornerConditionOptions = [
  'sharp',
  'light_rounding',
  'moderate_rounding',
  'creased',
  'blunted',
] as const

export type CornerCondition = (typeof cornerConditionOptions)[number]

export const toningLevelOptions = [0, 1, 2, 3, 4, 5] as const

export type ToningLevel = (typeof toningLevelOptions)[number]

export const ligninOdorLevelOptions = [0, 1, 2, 3, 4, 5] as const

export type LigninOdorLevel = (typeof ligninOdorLevelOptions)[number]

export const bindingTypeOptions = [
  'stapled',
  'saddle_stitch',
  'perfect_bound',
  'folded',
  'single_sheet',
  'other',
] as const

export type BindingType = (typeof bindingTypeOptions)[number]

export const stapleConditionOptions = [
  'not_applicable',
  'clean',
  'minor_oxidation',
  'rust_present',
  'heavy_rust',
  'removed_for_preservation',
] as const

export type StapleCondition = (typeof stapleConditionOptions)[number]

export const spineConditionOptions = [
  'not_applicable',
  'tight',
  'light_wear',
  'split',
  'partially_detached',
  'detached',
] as const

export type SpineCondition = (typeof spineConditionOptions)[number]

export const foldoutConditionOptions = [
  'not_applicable',
  'crisp',
  'light_fold_wear',
  'moderate_fold_wear',
  'tears',
  'reinforced',
  'detached',
] as const

export type FoldoutCondition = (typeof foldoutConditionOptions)[number]

export const pinholeStatusOptions = ['none', 'present', 'multiple'] as const

export type PinholeStatus = (typeof pinholeStatusOptions)[number]

export const presenceFlagOptions = ['none', 'present', 'unknown'] as const

export type PresenceFlag = (typeof presenceFlagOptions)[number]

export const writingMediumOptions = ['pencil', 'pen', 'marker', 'other'] as const

export type WritingMedium = (typeof writingMediumOptions)[number]

export const collectorConditionCategoryOptions = [
  'near_mint',
  'very_fine',
  'fine',
  'very_good',
  'good',
  'fair',
  'poor',
] as const

export type CollectorConditionCategory = (typeof collectorConditionCategoryOptions)[number]

export interface DimensionsInInches {
  width?: number
  height?: number
  depth?: number
}

export interface SurfaceAssessment {
  quality?: PaperSurfaceQuality
  gloss?: GlossLevel
  inkCondition?: InkCondition
  issues?: SurfaceIssue[]
  notes?: string
}

export interface StructureAssessment {
  rigidity?: PaperRigidity
  thickness?: PaperThickness
  completeness?: CompletenessStatus
  notes?: string
}

export interface EdgeCornerAssessment {
  edgeCondition?: EdgeCondition
  cornerCondition?: CornerCondition
  edgeToning?: ToningLevel
  notes?: string
}

export interface BindingAssessment {
  type?: BindingType
  stapleCondition?: StapleCondition
  spineCondition?: SpineCondition
  notes?: string
}

export interface FoldoutInsertAssessment {
  hasFoldouts?: boolean
  foldoutCondition?: FoldoutCondition
  insertStatus?: CompletenessStatus
  notes?: string
}

export interface StructuralMarksAssessment {
  foldJunctionPinholes?: PinholeStatus
  handlingCreases?: PresenceFlag
  notes?: string
}

export interface StampAssessment {
  status?: PresenceFlag
  text?: string
  location?: string
  notes?: string
}

export interface HandwritingAssessment {
  status?: PresenceFlag
  medium?: WritingMedium
  description?: string
  notes?: string
}

export interface RestorationAssessment {
  status?: PresenceFlag
  description?: string
  notes?: string
}

export interface AgingAssessment {
  toningScale?: ToningLevel
  ligninSmellScale?: LigninOdorLevel
  notes?: string
}

export interface VintagePaperConditionReport {
  itemTitle: string
  publisherOrLine?: string
  approximateYear?: string
  format?: string
  dimensionsInInches?: DimensionsInInches
  pageCount?: number

  surface?: SurfaceAssessment
  structure?: StructureAssessment
  edgesAndCorners?: EdgeCornerAssessment
  binding?: BindingAssessment
  foldoutsAndInserts?: FoldoutInsertAssessment
  structuralMarks?: StructuralMarksAssessment

  travelAgencyStamp?: StampAssessment
  handwrittenNotes?: HandwritingAssessment
  restorationNotes?: RestorationAssessment
  aging?: AgingAssessment

  overallConditionCategory?: CollectorConditionCategory
  overallSummary?: string
}
