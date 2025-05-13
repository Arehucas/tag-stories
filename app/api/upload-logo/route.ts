import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from 'next-auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest): Promise<Response> {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const data = await req.formData();
  const file = data.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return await new Promise<Response>((resolve) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder: "provider_logos", resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          resolve(NextResponse.json({ error: "Upload failed" }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ url: result.secure_url }));
        }
      }
    );
    upload.end(buffer);
  });
} 