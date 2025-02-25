// app/api/v1/setting/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// ฟังก์ชันสำหรับอ่านไฟล์ .env
const readEnvFile = (): Record<string, string> => {
  try {
    // กำหนดตำแหน่งไฟล์ .env
    const envPath = path.resolve(process.cwd(), '.env');
    
    // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
    if (!fs.existsSync(envPath)) {
      return {};
    }
    
    // อ่านไฟล์และแปลงเป็นข้อความ
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // แปลงข้อมูลจากไฟล์ .env เป็นออบเจ็กต์
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      // ข้ามบรรทัดว่างหรือบรรทัดที่เป็นคอมเมนต์
      if (!line || line.startsWith('#')) {
        return;
      }
      
      // แยกส่วน key และ value
      const equalSignIndex = line.indexOf('=');
      if (equalSignIndex !== -1) {
        const key = line.substring(0, equalSignIndex).trim();
        const value = line.substring(equalSignIndex + 1).trim();
        
        // เก็บค่าใน object
        if (key) {
          envVars[key] = value;
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error reading .env file:', error);
    return {};
  }
};

// ฟังก์ชันสำหรับเขียนไฟล์ .env
const writeEnvFile = (envVars: Record<string, string>): boolean => {
  try {
    // แปลงออบเจ็กต์เป็นข้อความในรูปแบบของไฟล์ .env
    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // กำหนดตำแหน่งไฟล์ .env
    const envPath = path.resolve(process.cwd(), '.env');
    
    // เขียนไฟล์
    fs.writeFileSync(envPath, envContent, 'utf8');
    
    return true;
  } catch (error) {
    console.error('Error writing .env file:', error);
    return false;
  }
};

// Handler สำหรับ GET request
export async function GET() {
  // อ่านไฟล์ .env
  const envVars = readEnvFile();
  
  // ส่งข้อมูลกลับในรูปแบบ JSON
  return NextResponse.json(envVars);
}

// Handler สำหรับ POST request
export async function POST(request: NextRequest) {
  try {
    // รับข้อมูลจาก request body
    const envVars = await request.json() as Record<string, string>;
    
    // บันทึกลงไฟล์ .env
    const success = writeEnvFile(envVars);
    
    if (success) {
      return NextResponse.json({ message: 'Environment variables saved successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Failed to save environment variables' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }
}