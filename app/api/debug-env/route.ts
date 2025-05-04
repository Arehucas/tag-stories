import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'set' : 'not set',
      PRUEBA_ENTORNO: process.env.PRUEBA_ENTORNO
    });
}