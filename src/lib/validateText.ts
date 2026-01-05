import { analyzePerspectiveDirect } from './analyzePerspectiveDirect'

/**
 * テキストが投稿可能かを判定する
 * true  = OK
 * false = NG
 */
export async function validateText(
  text: string,
  options?: {
    enablePerspective?: boolean
    perspectiveTimeoutMs?: number
  }
): Promise<boolean> {
  // =======================
  // 前処理
  // =======================
  const content = text.trim()
  if (content.length === 0) return false

  // =======================
  // ① NGワード
  // =======================
  const NG_WORDS = [
    '死ね',
    '殺す',
    '障害者',
    'レイプ',
    '薬物',
    '爆破',
    '自殺',
  ]

  if (NG_WORDS.some(w => content.includes(w))) {
    return false
  }

  // =======================
  // ② 個人情報
  // =======================
  const personalPatterns: RegExp[] = [
    /\b0\d{1,4}-\d{1,4}-\d{3,4}\b/,              // 固定電話
    /\b0\d{9,10}\b/,                             // 携帯
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // email
    /\b\d{3}-\d{4}\b/,                           // 郵便番号
  ]

  if (personalPatterns.some(re => re.test(content))) {
    return false
  }

  // =======================
  // ③ Perspective（任意）
  // =======================
  const enablePerspective = options?.enablePerspective ?? true
  if (!enablePerspective) {
    return true
  }

  const timeoutMs = options?.perspectiveTimeoutMs ?? 3000

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const result = await analyzePerspectiveDirect(
      content,
      controller.signal
    )

    clearTimeout(timeoutId)

    const toxicity =
      result.attributeScores?.TOXICITY?.summaryScore?.value ?? 0
    const insult =
      result.attributeScores?.INSULT?.summaryScore?.value ?? 0
    const profanity =
      result.attributeScores?.PROFANITY?.summaryScore?.value ?? 0

    if (
      toxicity > 0.75 ||
      insult > 0.7 ||
      profanity > 0.65
    ) {
      return false
    }
  } catch {
    // Perspective が死んでも通す
    return true
  }

  return true
}
