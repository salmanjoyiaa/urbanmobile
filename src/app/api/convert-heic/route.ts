import { NextRequest, NextResponse } from "next/server";
// @ts-ignore - heic-convert lacks typescript definitions
import heicConvert from "heic-convert";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("image") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Convert File to ArrayBuffer, then to Node.js Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Process using heic-convert to generate a high-quality JPEG
        const jpegBuffer = await heicConvert({
            buffer: buffer, // the HEIC file buffer
            format: 'JPEG',      // output format
            quality: 0.85         // the jpeg quality (0 to 1)
        });

        // Determine the new filename
        const newFilename = file.name.replace(/\.(heic|heif|hif)$/i, ".jpg") || "converted.jpg";

        return new NextResponse(jpegBuffer as unknown as BodyInit, {
            headers: {
                "Content-Type": "image/jpeg",
                "Content-Disposition": `attachment; filename="${newFilename}"`,
                // Avoid caching dynamically converted images
                "Cache-Control": "no-store, max-age=0",
            },
        });
    } catch (error) {
        console.error("HEIC conversion failed:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to convert image" },
            { status: 500 }
        );
    }
}
