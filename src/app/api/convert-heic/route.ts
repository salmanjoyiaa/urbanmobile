import { NextRequest, NextResponse } from "next/server";
import CloudConvert from "cloudconvert";

// Initialize CloudConvert with the API key
// If the key is missing, this will gracefully fail below
const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        if (!process.env.CLOUDCONVERT_API_KEY) {
            console.error("Missing CLOUDCONVERT_API_KEY environment variable");
            return NextResponse.json({ error: "Server conversion API not configured." }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get("image") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Convert File to ArrayBuffer, then to Node.js Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Determine the original filename
        const originalName = file.name || "image.heic";

        // Create a unique import task for the file
        const job = await cloudConvert.jobs.create({
            tasks: {
                "import-1": {
                    operation: "import/raw",
                    file: buffer.toString('base64'),
                    filename: originalName
                },
                "task-1": {
                    operation: "convert",
                    input: "import-1",
                    output_format: "jpg",
                    engine: "imagemagick"
                },
                "export-1": {
                    operation: "export/url",
                    input: "task-1"
                }
            }
        });

        // Wait for the job to finish
        const finishedJob = await cloudConvert.jobs.wait(job.id);

        // Find the export task to get the result URL
        const exportTask = finishedJob.tasks.find(t => t.name === "export-1");

        if (!exportTask || !exportTask.result || !exportTask.result.files || exportTask.result.files.length === 0) {
            throw new Error("CloudConvert export task failed or returned no files.");
        }

        const fileUrl = exportTask.result.files[0].url;
        if (!fileUrl) throw new Error("Missing url from CloudConvert result");

        // Fetch the converted JPEG from CloudConvert's URL
        const imageRes = await fetch(fileUrl);
        if (!imageRes.ok) throw new Error("Failed to download converted image from CloudConvert");

        const jpegBuffer = await imageRes.arrayBuffer();

        // Determine the new filename
        const newFilename = originalName.replace(/\.(heic|heif|hif)$/i, ".jpg") || "converted.jpg";

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
