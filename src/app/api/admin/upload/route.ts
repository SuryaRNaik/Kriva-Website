import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    // 1. Validate File Size (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "File exceeds 5MB limit" }, { status: 400 });
    }

    // 2. Validate MIME type
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Invalid file type. Only JPG, PNG, and WebP are allowed." }, { status: 400 });
    }

    // 3. Validate Extension
    const originalExt = path.extname(file.name).toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    if (!allowedExtensions.includes(originalExt)) {
      return NextResponse.json({ success: false, error: "Invalid file extension." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. File Signature Validation (Magic Numbers check for basic image headers)
    const hex = buffer.toString('hex', 0, 4);
    const magicNumbers = [
      "ffd8ffe0", "ffd8ffe1", "ffd8ffe2", "ffd8ffe3", "ffd8ffe8", // JPEG/JPG
      "89504e47", // PNG
      "52494646", // WEBP (RIFF header, actual WEBP check needs more bytes but this is a good start)
    ];
    
    let isHeaderValid = magicNumbers.some(magic => hex.startsWith(magic));
    // WebP specific check (bytes 8-11 should be 'WEBP')
    if (hex === "52494646") {
      const webpSignature = buffer.toString('ascii', 8, 12);
      if (webpSignature !== "WEBP") isHeaderValid = false;
    }

    if (!isHeaderValid) {
       return NextResponse.json({ success: false, error: "File content does not match image format." }, { status: 400 });
    }

    // 5. Sanitize Filename (strip paths, double dots, unsafe chars)
    const safeBaseName = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9-]/g, "_");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${safeBaseName}${originalExt}`;
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads/products");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/products/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
