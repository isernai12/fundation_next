import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "foundation-erp";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const backendUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.FASTAPI_INTERNAL_URL ||
      "http://127.0.0.1:8000";

    const backendFormData = new FormData();
    backendFormData.append("file", file, file.name || "upload");
    backendFormData.append("folder", folder);
    backendFormData.append("resource_type", "auto");

    const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/v1/upload`, {
      method: "POST",
      body: backendFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.detail || "Failed to upload file";
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload" }, { status: 500 });
  }
}
