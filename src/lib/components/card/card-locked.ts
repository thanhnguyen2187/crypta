import { aesGcmDecrypt } from '../../utitlities/encryption'

export type ContentState = 'locked' | 'unlocked' | 'visible'
export type MouseState = 'default' | 'hovered'

export async function attemptDecrypt(
  encryptedText: string,
  password: string,
): Promise<string | null> {
  try {
    return await aesGcmDecrypt(encryptedText, password)
  } catch (e) {
    return null
  }
}
