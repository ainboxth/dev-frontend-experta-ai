import { NextRequest, NextResponse } from "next/server";

// Hardcoded password
const PASSWORD = "admin";

// Handler for POST request to /api/v1/login
export async function POST(request: NextRequest) {
  try {
    // รับข้อมูลจาก request body
    const { password } = await request.json();

    // ตรวจสอบรหัสผ่าน
    if (password === PASSWORD) {
      return NextResponse.json(
        { message: "Login successful" },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}
