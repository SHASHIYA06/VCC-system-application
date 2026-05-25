import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: pathSegments } = await params;
  const filePath = pathSegments.map(decodeURIComponent).join('/');
  const fullPath = join(process.cwd(), 'public', 'DOCUMENTS', filePath);

  try {
    const fileBuffer = await readFile(fullPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${pathSegments[pathSegments.length - 1]}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('PDF serve error:', error);
    return NextResponse.json(
      { error: 'PDF not found' },
      { status: 404 }
    );
  }
}
