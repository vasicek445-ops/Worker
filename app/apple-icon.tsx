import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #E8302A, #FF6B35)', borderRadius: 36 }}>
        <span style={{ fontSize: 100, fontWeight: 900, color: 'white', fontFamily: 'sans-serif' }}>W</span>
      </div>
    ),
    { ...size }
  )
}
