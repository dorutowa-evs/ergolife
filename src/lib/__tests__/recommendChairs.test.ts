import {
  validateParams,
  scoreChair,
  recommendChairs,
  generateDescription,
  type UserParams,
} from '../recommendChairs'
import type { Chair } from '@/types/catalog'

const baseChair: Chair = {
  id: 'c001', name: 'Test Chair', price: 1000, imageUrl: '', description: '',
  material: 'mesh', color: 'black',
  hasLumbar: true, isLumbarAdjustable: true,
  headrestAdjustment: '3D', armrestAdjustment: '4D',
  backHeight: 55, seatHeight: 47, recliningAngle: 120,
}

describe('validateParams', () => {
  it('returns error for missing height', () => {
    const errs = validateParams({ weight: 70 })
    expect(errs.height).toBeTruthy()
  })
  it('returns error for missing weight', () => {
    const errs = validateParams({ height: 175 })
    expect(errs.weight).toBeTruthy()
  })
  it('returns error for out-of-range height', () => {
    const errs = validateParams({ height: 50, weight: 70 })
    expect(errs.height).toBeTruthy()
  })
  it('returns error for out-of-range weight', () => {
    const errs = validateParams({ height: 175, weight: 5 })
    expect(errs.weight).toBeTruthy()
  })
  it('returns error for out-of-range thighLength', () => {
    const errs = validateParams({ height: 175, weight: 70, thighLength: 5 })
    expect(errs.thighLength).toBeTruthy()
  })
  it('returns error for out-of-range shoulderWidth', () => {
    const errs = validateParams({ height: 175, weight: 70, shoulderWidth: 100 })
    expect(errs.shoulderWidth).toBeTruthy()
  })
  it('returns no errors for valid required params', () => {
    const errs = validateParams({ height: 175, weight: 70 })
    expect(Object.keys(errs)).toHaveLength(0)
  })
  it('returns no errors for valid full params', () => {
    const errs = validateParams({ height: 175, weight: 70, thighLength: 45, shoulderWidth: 45 })
    expect(Object.keys(errs)).toHaveLength(0)
  })
})

describe('scoreChair', () => {
  const params: UserParams = { height: 175, weight: 70 }
  it('returns a number between 0 and 100', () => {
    const score = scoreChair(baseChair, params)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
  it('scores higher when seatHeight closely matches ideal', () => {
    const ideal = Math.round(175 * 0.25)
    const good = { ...baseChair, seatHeight: ideal }
    const poor = { ...baseChair, seatHeight: ideal + 12 }
    expect(scoreChair(good, params)).toBeGreaterThan(scoreChair(poor, params))
  })
  it('scores higher when backHeight meets minimum for user height', () => {
    const minBack = Math.round(175 * 0.285)
    const good = { ...baseChair, backHeight: minBack + 5 }
    const poor = { ...baseChair, backHeight: minBack - 10 }
    expect(scoreChair(good, params)).toBeGreaterThan(scoreChair(poor, params))
  })
  it('penalises missing lumbar when hasBackPain is true', () => {
    const withPain: UserParams = { height: 175, weight: 70, hasBackPain: true }
    const withLumbar = { ...baseChair, hasLumbar: true }
    const noLumbar = { ...baseChair, hasLumbar: false, isLumbarAdjustable: false }
    expect(scoreChair(withLumbar, withPain)).toBeGreaterThan(scoreChair(noLumbar, withPain))
  })
  it('uses thighLength for seat height scoring when provided', () => {
    const thighLength = 50
    const paramsWithThigh: UserParams = { height: 175, weight: 70, thighLength }
    const goodFit = { ...baseChair, seatHeight: thighLength }
    const poorFit = { ...baseChair, seatHeight: thighLength + 15 }
    expect(scoreChair(goodFit, paramsWithThigh)).toBeGreaterThan(scoreChair(poorFit, paramsWithThigh))
  })
})

describe('recommendChairs', () => {
  const chairs = [baseChair, { ...baseChair, id: 'c002', name: 'Chair B', seatHeight: 38, backHeight: 40 }]
  const params: UserParams = { height: 175, weight: 70 }
  it('returns scored chairs sorted by score descending', () => {
    const results = recommendChairs(chairs, params)
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score)
  })
  it('returns all chairs (even low scorers)', () => {
    const results = recommendChairs(chairs, params)
    expect(results).toHaveLength(2)
  })
})

describe('generateDescription', () => {
  it('includes height and weight in output', () => {
    const desc = generateDescription({ height: 175, weight: 70 })
    expect(desc).toContain('175')
    expect(desc).toContain('70')
  })
  it('mentions lumbar when hasBackPain is true', () => {
    const desc = generateDescription({ height: 175, weight: 70, hasBackPain: true })
    expect(desc).toContain('腰')
  })
  it('mentions headrest for tall users', () => {
    const desc = generateDescription({ height: 185, weight: 80 })
    expect(desc).toContain('头枕')
  })
  it('mentions headrest for users sitting more than 8 hours', () => {
    const desc = generateDescription({ height: 170, weight: 70, sittingHours: '>8' })
    expect(desc).toContain('头枕')
  })
})
