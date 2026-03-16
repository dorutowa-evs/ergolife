import type { Chair } from '@/types/catalog'

export type PosturePreference = 'upright' | 'reclined' | 'forward'

export interface UserParams {
  height: number
  weight: number
  legLength?: number // 站立时髋部到地面的距离；idealSeat ≈ legLength * 0.5
  posture?: PosturePreference
}

export interface FormErrors {
  height?: string
  weight?: string
  legLength?: string
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
  if (params.legLength !== undefined) {
    if (params.legLength < 60 || params.legLength > 120) {
      errors.legLength = '请输入合理数值（60–120cm）'
    }
  }
  return errors
}

// idealSeat: if legLength provided, calf ≈ legLength * 0.5; else height * 0.25
// Weights: seat 35 + back 30 + lumbar 20 + headrest 15 = 100 max
export function scoreChair(chair: Chair, params: UserParams): number {
  let score = 0

  const idealSeat = params.legLength
    ? Math.round(params.legLength * 0.5)
    : Math.round(params.height * 0.25)
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

  if (params.posture === 'reclined' && chair.recliningAngle > 110) score += 10
  if (params.posture === 'upright' && chair.hasLumbar && chair.isLumbarAdjustable) score += 5

  if (chair.headrestAdjustment !== null) {
    score += 15
  }

  return Math.max(0, Math.min(100, score))
}

export function recommendChairs(chairs: Chair[], params: UserParams): ScoredChair[] {
  return chairs
    .map((chair) => ({ chair, score: scoreChair(chair, params) }))
    .sort((a, b) => b.score - a.score)
}

export function generateDescription(params: UserParams): string {
  const idealSeat = params.legLength
    ? Math.round(params.legLength * 0.5)
    : Math.round(params.height * 0.25)
  const seatMin = idealSeat - 3
  const seatMax = idealSeat + 4
  const minBack = Math.round(params.height * 0.285)
  let desc = `根据你的身材（${params.height}cm / ${params.weight}kg），建议座高 ${seatMin}–${seatMax}cm、靠背高度 ${minBack}cm 以上，推荐配备腰靠的椅子`
  if (params.height > 175) {
    desc += '，建议配备头枕'
  }
  if (params.posture === 'reclined') {
    desc += '，偏好后仰姿势建议选择后仰角度大于 110° 的椅子'
  } else if (params.posture === 'forward') {
    desc += '，偏好前倾姿势建议确认椅子是否支持前倾锁定功能'
  }
  return desc
}
