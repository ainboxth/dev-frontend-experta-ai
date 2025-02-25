// import sharp from "sharp";

// export const processImageBase64 = async (imgBase64: string): Promise<string> => {
//   try {
//     // Convert base64 string to a Buffer
//     const imgBuffer = Buffer.from(imgBase64, "base64");

//     // Convert to PNG and check size
//     let processedBuffer = await sharp(imgBuffer)
//       .png() // Convert to PNG
//       .toBuffer();

//     // If the image size is greater than 4MB, resize it
//     const maxSize = 4 * 1024 * 1024; // 4MB
//     if (processedBuffer.length > maxSize) {
//       processedBuffer = await sharp(processedBuffer)
//         .resize({ width: 1024 }) // Resize with max width, maintaining aspect ratio
//         .png()
//         .toBuffer();
//     }

//     // Return the image as a base64 string (without header)
//     return processedBuffer.toString("base64");
//   } catch (error) {
//     console.error("Error processing image:", error);
//     throw new Error("Failed to process image.");
//   }
// };
