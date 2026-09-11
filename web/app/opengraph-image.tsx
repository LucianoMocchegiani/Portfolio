import { ImageResponse } from 'next/og';

export const alt = 'Luciano Mocchegiani — Software Engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#ffffff',
          color: '#111111',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            letterSpacing: 14,
            color: '#6b6b6b',
            marginBottom: 28,
          }}
        >
          LM
        </div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 500 }}>
          Luciano Mocchegiani
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: '#6b6b6b',
            marginTop: 16,
          }}
        >
          Software Engineer
        </div>
      </div>
    ),
    { ...size },
  );
}
