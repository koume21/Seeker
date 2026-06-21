import { NextResponse } from 'next/server'
import { codeToHtml } from 'shiki'

export async function POST(request: Request) {
  const { code, language } = await request.json()
  
  const html = await codeToHtml(code, {
    lang: language,
    theme: 'github-dark'
  })
  
  return NextResponse.json({ html })
}