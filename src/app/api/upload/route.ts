import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { requireDashboardAccess } from "@/lib/dashboard-auth";

export async function POST(req: Request) {
  const authResponse = await requireDashboardAccess(req);
  if (authResponse) {
    return authResponse;
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || !file.size) {
      return NextResponse.json({ error: "لم يتم اختيار ملف" }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الملف يتجاوز 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `product-${Date.now()}.${ext}`;
    const dir = join(process.cwd(), "public", "products");

    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, fileName), buffer);

    return NextResponse.json({ url: `/products/${fileName}` });
  } catch {
    return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
  }
}
