import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
    const session = await getServerSession();
    // BYPASS SOLO EN DESARROLLO PARA DEMO
    if (
      process.env.NODE_ENV === "development" &&
      (!session || !session.user?.email)
    ) {
      return NextResponse.json({
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'set' : 'not set',
        PRUEBA_ENTORNO: process.env.PRUEBA_ENTORNO
      });
    }
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    return NextResponse.json({
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'set' : 'not set',
      PRUEBA_ENTORNO: process.env.PRUEBA_ENTORNO
    });
}