import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    console.log("[Editorial Upload] Starting upload request");

    let body: HandleUploadBody;
    try {
      body = (await request.json()) as HandleUploadBody;
      console.log("[Editorial Upload] Request body parsed successfully");
    } catch (parseError) {
      console.error("[Editorial Upload] Failed to parse request JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    console.log("[Editorial Upload] Calling handleUpload");
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        console.log("[Editorial Upload] onBeforeGenerateToken called");
        try {
          const session = await auth();
          if (!session?.user?.id) {
            console.error("[Editorial Upload] Authentication failed: no session or user ID");
            throw new Error("Unauthorized");
          }
          console.log(`[Editorial Upload] Authenticated user: ${session.user.id}`);

          return {
            allowedContentTypes: ["application/pdf", "text/plain"],
            maximumSizeInBytes: 50 * 1024 * 1024,
          };
        } catch (authError) {
          console.error("[Editorial Upload] Auth error in onBeforeGenerateToken:", authError);
          throw authError;
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log(`[Editorial Upload] Upload completed - blob URL: ${blob?.url || "undefined"}`);
      },
    });

    console.log("[Editorial Upload] handleUpload returned successfully");
    console.log(`[Editorial Upload] Response: ${JSON.stringify(jsonResponse).substring(0, 200)}`);

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[Editorial Upload] Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Editorial Upload] Error details: ${errorMessage}`);

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 },
    );
  }
}
