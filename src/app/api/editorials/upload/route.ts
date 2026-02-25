import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth()
        if (!session?.user?.id) throw new Error('Unauthorized')

        return {
          allowedContentTypes: ['application/pdf', 'text/plain'],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB max allowed by Vercel free blobs normally? (Actually max 500mb depending on limits, but 50mb is safe for editais)
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Blob upload completed:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
