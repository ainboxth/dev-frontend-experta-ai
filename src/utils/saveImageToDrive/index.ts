"use server";

import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { ConfigPage } from "../config";
export async function uploadImage(
  formData: FormData,
  nameFolder: string
) {
  const file = formData.get("file") as File;
  const baseDirectory = ConfigPage.URL_WORK_IMG||"";

  console.log("baseDirectory ===> ", baseDirectory);
  
  const directory = join(baseDirectory, nameFolder);
  const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = join(directory, `${nameFolder}.jpg`);

  if (!file) {
    throw new Error("No file uploaded");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (!file.type.startsWith("image/")) {
    throw new Error("File is not an image");
  }

  try {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, buffer);
    return { success: true, path: path, directory: directory };
  } catch (error) {
    console.error("Error saving file:", error);
    throw new Error("Failed to save the file");
  }
}
