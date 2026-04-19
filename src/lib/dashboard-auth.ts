import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function requireDashboardAccess(request: Request) {
  const secret = process.env.DASHBOARD_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "إعداد الخادم غير مكتمل" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("dashboard_token")?.value;

  if (token === secret) {
    return null;
  }

  return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
}