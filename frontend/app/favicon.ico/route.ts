import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const svgPath = path.join(process.cwd(), 'app', 'icon.svg')
    const svgContent = fs.readFileSync(svgPath, 'utf-8')
    
    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    // Fallback: return a simple SVG
    const fallbackSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="16" width="24" height="32" fill="#06b6d4" rx="2"/><rect x="32" y="16" width="24" height="32" fill="#1e40af" rx="2"/></svg>'
    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    })
  }
}

