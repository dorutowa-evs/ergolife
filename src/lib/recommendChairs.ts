import type { Chair } from '@/types/catalog'

export type SittingHours = '<4' | '4-8' | '>8'
export type PainLevel = 'none' | 'moderate' | 'severe'

export interface UserParams {
  height: number
  weight: number
  thighLength?: number
  shoulderWidth?: number // collected and validated; not yet used in scoring (Chair type has no shoulderWidth field — future extension)
  sittingHours?: SittingHours
  hasBackPain?: boolean
  neckPain?: PainLevel
}

export interface FormErrors {
  height?: string
  weight?: string
  thighLength?: string
  shoulderWidth?: string
}

export interface ScoredChair {
  chair: Chair
  score: number // 0–100
}

export function validateParams(params: Partial<UserParams>): FormErrors {
  const errors: FormErrors = {}
  if (params.height == null) {
    errors.height = '请填写此项'
  } else if (params.height < 100 || params.height > 220) {
    errors.height = '请输入合理数值（100–220cm）'
  }
  if (params.weight == null) {
    errors.weight = '请填写此项'
  } else if (params.weight < 30 || params.weight > 200) {
    errors.weight = '请输入合理数值（30–200kg）'
  }
  if (params.thighLength !== undefined) {
    if (params.thighLength < 30 || params.thighLength > 70) {
      errors.thighLength = '请输入合理数值（30–70cm）'
    }
  }
  if (params.shoulderWidth !== undefined) {
    if (params.shoulderWidth < 30 || params.shoulderWidth > 60) {
      errors.shoulderWidth = '请输入合理数值（30–60cm）'
    }
  }
  return errors
}

// Weights: seat 35 + back 30 + lumbar 20 + headrest 15 = 100 max
export function scoreChair(chair: Chair, params: UserParams): number {
  let score = 0
  const idealSeat = params.thighLength ?? Math.round(params.height * 0.25)
  const seatDelta = Math.abs(chair.seatHeight - idealSeat)
  if (seatDelta <= 3) score += 35
  else if (seatDelta <= 6) score += 20
  else if (seatDelta <= 10) score += 5
  const minBackHeight = Math.round(params.height * 0.285)
  if (chair.backHeight >= minBackHeight) score += 30
  else if (chair.backHeight >= minBackHeight - 4) score += 15
  if (chair.hasLumbar) {
    score += 10
    if (chair.isLumbarAdjustable) score += 10
  }
  if (params.hasBackPain && !chair.hasLumbar) score -= 20
  const hasNeckPain = params.neckPain && params.neckPain !== 'none'
  if (chair.headrestAdjustment !== null) {
    score += 10
    if (params.height > 175 || params.sittingHours === '>8') score += 5
    if (hasNeckPain) score += 5
  } else if (hasNeckPain) {
    score -= 15
  }
  return Math.max(0, Math.min(100, score))
}

export function recommendChairs(chairs: Chair[], params: UserParams): ScoredChair[] {
  return chairs
    .map((chair) => ({ chair, score: scoreChair(chair, params) }))
    .sort((a, b) => b.score - a.score)
}

export function generateDescription(params: UserParams): string {
  const idealSeat = params.thighLength ?? Math.round(params.height * 0.25)
  const seatMin = idealSeat - 3
  const seatMax = idealSeat + 4
  const minBack = Math.round(params.height * 0.285)
  let desc = `根据你的身材（${params.height}cm / ${params.weight}kg），建议座高 ${seatMin}–${seatMax}cm、靠背高度 ${minBack}cm 以上`
  if (params.hasBackPain) {
    desc += '，有腰部问题建议优先选择带可调节腰靠的椅子'
  } else {
    desc += '，推荐配备腰靠的椅子'
  }
  if (params.neckPain && params.neckPain !== 'none') {
    desc += '，有颈椎酸痛建议优先选择带头枕的椅子'
  } else if (params.height > 175 || params.sittingHours === '>8') {
    desc += '，建议配备头枕'
  }
  return desc
}
