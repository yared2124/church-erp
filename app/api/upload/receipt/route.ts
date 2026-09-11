import { NextResponse } from "next/server";
import { requireRole, withErrorHandling, ApiError } from "@/lib/api-helpers";
import path from "path";
import fs from "fs";

export const POST = withErrorHandling(async (req) => {
  await requireRole("Super Admin", "Sebeka Gubae", "Cashier");

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    throw new ApiError(400, "No valid file uploaded.");
  }

  const blob = file as Blob;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
  if (!allowedTypes.includes(blob.type)) {
    throw new ApiError(400, "Unsupported file format. Please upload JPG, PNG, WEBP, or PDF.");
  }

  // Max 8MB
  if (blob.size > 8 * 1024 * 1024) {
    throw new ApiError(400, "File exceeds maximum 8MB size limit.");
  }

  const bytes = await blob.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = blob.type === "application/pdf" ? "pdf" : (blob.type.split("/")[1] || "jpg");
  const fileName = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, buffer);

  const publicUrl = `/uploads/receipts/${fileName}`;
  return NextResponse.json({ url: publicUrl }, { status: 201 });
});
