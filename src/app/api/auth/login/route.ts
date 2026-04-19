import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const correctPassword = process.env.DASHBOARD_PASSWORD;
    const secret = process.env.DASHBOARD_SECRET;

    if (!correctPassword || !secret) {
      return NextResponse.json({ error: "إعداد الخادم غير مكتمل" }, { status: 500 });
    }

    if (password !== correctPassword) {
      return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set("dashboard_token", secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
