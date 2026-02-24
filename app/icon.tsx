import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #E8302A, #FF6B35)', borderRadius: 7 }}>
        <span style={{ fontSize: 20, fontWeight: 900, color: 'white', fontFamily: 'sans-serif' }}>W</span>
      </div>
    ),
    { ...size }
  )
}
