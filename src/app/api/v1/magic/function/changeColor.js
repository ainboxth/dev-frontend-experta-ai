import sharp from "sharp";
import fetch from "node-fetch";
import { fal } from "@fal-ai/client";

// Constants for magic numbers and strings - improves readability and maintainability

const OUTPUT_IMAGE_NAME = "outputjs.png";
const JPEG_FORMAT = "jpeg"; // sharp uses 'jpeg'
const DEFAULT_GAUSSIAN_BLUR_RADIUS = 1.5;
const NEAR_WHITE_THRESHOLD = 230;
const COLOR_COMPONENT_LOWER_BOUND = 50;
const COLOR_COMPONENT_UPPER_BOUND = 230;
const BLEND_MODE_MULTIPLY = "multiply";
const BLEND_MODE_BLACK_WHITE = "black_white";

class ImageBoundingBoxError extends Error {
  constructor(message) {
    super(message);
    this.name = "ImageBoundingBoxError";
  }
}

class ImageProcessingError extends Error {
  constructor(message) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

class FileUploadError extends Error {
  constructor(message) {
    super(message);
    this.name = "FileUploadError";
  }
}

class SegmentationError extends Error {
  constructor(message) {
    super(message);
    this.name = "SegmentationError";
  }
}

async function upload_image(image_base64) {
  /**
   * Uploads an image to fal_client and returns the URL.
   *
   * Args:
   *     @param image_base64 — Base64-encoded image data.
   *
   * Returns:
   *     The URL of the uploaded image.
   *
   * Raises:
   *     FileUploadError: If there is an error during file upload.
   */
   try {
   const tempFile = Buffer.from(image_base64, 'base64');
   const image_path = './temp_image.png';
   await sharp(tempFile).toFile(image_path);
   const url = await fal.storage.upload(new File([await sharp(image_path).toBuffer()], 'temp_image.png'));
    return url;
  } catch (e) {
    throw new FileUploadError(`Error uploading image: ${e}`);
  }
}

async function estimate_bounding_box(imageBuffer) {
  /**
   * Estimates the bounding box coordinates of the white space in a black and white image.
   *
   * Args:
   *     @param imageBuffer — Buffer containing image data
   *
   * Returns:
   *     A tuple [left, top, right, bottom] representing the bounding box coordinates,
   *     or null if no white space is found.
   *
   * Raises:
   *     ImageBoundingBoxError: If there is an error during bounding box estimation.
   */
  try {
    let img = sharp(imageBuffer).greyscale(); // Process image buffer and convert to grayscale
    const metadata = await img.metadata();
    const width = metadata.width;
    const height = metadata.height;

    let min_x = width;
    let min_y = height;
    let max_x = 0;
    let max_y = 0;
    let found_white_pixel = false;

    const { data, info } = await img
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel_value = data[y * width + x]; // Accessing grayscale pixel value
        if (pixel_value > 0) {
          found_white_pixel = true;
          min_x = Math.min(min_x, x);
          min_y = Math.min(min_y, y);
          max_x = Math.max(max_x, x);
          max_y = Math.max(max_y, y);
        }
      }
    }

    if (!found_white_pixel) {
      return null; // No white space found
    }

    return [min_x, min_y, max_x, max_y];
  } catch (e) {
    throw new ImageBoundingBoxError(
      `Error during bounding box estimation: ${e}`
    );
  }
}

async function get_segment(coordinate, image_base64
) {
  /**
   * Retrieves image segment using fal_client's sam2 model based on bounding box coordinates.
   *
   * Args:
   *     coordinate: A list of two lists, representing the top-left and bottom-right
   *                 coordinates of the bounding box: [[x_min, y_min], [x_max, y_max]].
   *     image_path: Path to the original image file.
   *
   * Returns:
   *     The result dictionary from fal_client.subscribe, containing segmentation information.
   *
   * Raises:
   *     SegmentationError: If there is an error during segmentation.
   *     FileUploadError: If there's an issue uploading the image.
   */

  const on_queue_update = (update) => {
    if (update.status === "IN_PROGRESS") {
      if (update.logs) {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    }
  };

  let image_url;
  try {
    image_url = await upload_image(image_base64);
  } catch (e) {
    throw new SegmentationError(
      `Error in get_segment during image upload: ${e}`
    );
  }

  const arguments_ = {
    // arguments is reserved word
    image_url: image_url,
    box_prompts: [
      {
        y_min: coordinate[0][1],
        x_max: coordinate[1][0],
        x_min: coordinate[0][0],
        y_max: coordinate[1][1],
      },
    ],
  };

  try {
    const result = await fal.subscribe("fal-ai/sam2/image", {
      input: arguments_,
      logs: true,
      onQueueUpdate: on_queue_update,
    });
    return result.data;
  } catch (e) {
    throw new SegmentationError(`Error during segmentation process: ${e}`);
  }
}

function hex_to_rgb(hex_color) {
  /**
   * Converts a hexadecimal color code to an RGB tuple.
   *
   * Args:
   *     hex_color: Hexadecimal color code (e.g., "#FF0000").
   *
   * Returns:
   *     RGB color tuple (e.g., (255, 0, 0)).
   */
  hex_color = hex_color.startsWith("#") ? hex_color.substring(1) : hex_color;
  const r = parseInt(hex_color.substring(0, 2), 16);
  const g = parseInt(hex_color.substring(2, 4), 16);
  const b = parseInt(hex_color.substring(4, 6), 16);
  return [r, g, b];
}

async function change_color_in_mask_overlay_photoshop(
   base64_image,
  mask_url,
  hex_target_color,
  output_path
) {
  /**
   * Changes the color of a masked overlay in an image, mimicking Photoshop-like blending.
   *
   * Args:
   *     image_path: Path to the original image.
   *     mask_url: URL of the mask image.
   *     hex_target_color: Hexadecimal color code for the target color.
   *     output_path: Path to save the output image.
   *
   * Raises:
   *     ImageProcessingError: For errors during image loading, mask processing, or blending.
   */

  async function _load_image_and_mask(imageBuffer, mask_url) {
    /**Loads the base image and mask, handling potential errors.*/
    try {
      const image = sharp(imageBuffer).ensureAlpha().raw(); // Ensure alpha channel and get raw pixel data
      const imageMetadata = await sharp(imageBuffer).metadata();

      const response = await fetch(mask_url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const maskBuffer = await response.arrayBuffer();
      const mask = sharp(maskBuffer)
        .greyscale()
        .blur(DEFAULT_GAUSSIAN_BLUR_RADIUS)
        .raw();
      const maskMetadata = await sharp(maskBuffer).metadata();

      if (
        imageMetadata.width !== maskMetadata.width ||
        imageMetadata.height !== maskMetadata.height
      ) {
        throw new Error("Image and mask must be the same size.");
      }

      const imageData = await image.toBuffer({ resolveWithObject: true });
      const maskData = await mask.toBuffer({ resolveWithObject: true });

      return { image: imageData, mask: maskData, metadata: imageMetadata };
    } catch (e) {
      if (
        e.constructor.name === "SharpError" &&
        e.message.includes("Input file contains unsupported image format")
      ) {
        throw new ImageProcessingError(
          `Error: Could not open or decode image or mask file. ${e}`
        );
      } else if (e.code === "ENOENT") {
        throw new ImageProcessingError(
          `Error: Image or mask file not found. ${e}`
        );
      } else if (e.message && e.message.startsWith("HTTP error!")) {
        throw new ImageProcessingError(
          `Error fetching mask from URL: ${e.message}`
        );
      } else if (e.message === "Image and mask must be the same size.") {
        throw new ImageProcessingError(`Error: ${e.message}`);
      }
      throw new ImageProcessingError(`Error loading image and mask: ${e}`);
    }
  }

  function _determine_blend_mode(target_color_rgb) {
    /**Determines the blend mode based on the target color.*/
    if (target_color_rgb.every((c) => c > NEAR_WHITE_THRESHOLD)) {
      // Near white threshold
      return BLEND_MODE_BLACK_WHITE;
    }
    return BLEND_MODE_MULTIPLY;
  }

  async function _apply_color_blending(
    imageData,
    maskData,
    metadata,
    target_color_rgb,
    blend_mode
  ) {
    /**Applies the color blending logic.*/
    const { data: imagePixels, info: imageInfo } = imageData;
    const { data: maskPixels, info: maskInfo } = maskData;
    const width = metadata.width;
    const height = metadata.height;

    const processedImagePixels = Buffer.alloc(imagePixels.length); // Create a new buffer for processed pixels

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * imageInfo.channels; // Assuming RGBA or RGB, adjust if needed
        const maskPixelIntensity = maskPixels[y * width + x]; // Grayscale mask, single channel

        if (maskPixelIntensity > 0) {
          const alpha = maskPixelIntensity / 255.0;
          const original_color = [
            imagePixels[pixelIndex],
            imagePixels[pixelIndex + 1],
            imagePixels[pixelIndex + 2],
          ]; // RGB

          // Clamp target color components
          const clamped_target_color = target_color_rgb.map((color) =>
            Math.max(
              COLOR_COMPONENT_LOWER_BOUND,
              Math.min(COLOR_COMPONENT_UPPER_BOUND, color)
            )
          );

          let new_color_r = original_color[0];
          let new_color_g = original_color[1];
          let new_color_b = original_color[2];

          if (blend_mode === BLEND_MODE_MULTIPLY) {
            new_color_r = Math.floor(
              (original_color[0] * clamped_target_color[0]) / 255
            );
            new_color_g = Math.floor(
              (original_color[1] * clamped_target_color[1]) / 255
            );
            new_color_b = Math.floor(
              (original_color[2] * clamped_target_color[2]) / 255
            );
          } else if (blend_mode === BLEND_MODE_BLACK_WHITE) {
            const avg = Math.floor(
              original_color.reduce((a, b) => a + b, 0) / 3
            );
            new_color_r = avg;
            new_color_g = avg;
            new_color_b = avg;
          }

          const final_color_r = Math.floor(
            (1 - alpha) * original_color[0] + alpha * new_color_r
          );
          const final_color_g = Math.floor(
            (1 - alpha) * original_color[1] + alpha * new_color_g
          );
          const final_color_b = Math.floor(
            (1 - alpha) * original_color[2] + alpha * new_color_b
          );

          processedImagePixels[pixelIndex] = final_color_r;
          processedImagePixels[pixelIndex + 1] = final_color_g;
          processedImagePixels[pixelIndex + 2] = final_color_b;

          if (imageInfo.channels === 4) {
            // If it's RGBA, keep alpha channel
            processedImagePixels[pixelIndex + 3] = imagePixels[pixelIndex + 3];
          }
        } else {
          // If not masked pixel, copy original pixel
          for (let i = 0; i < imageInfo.channels; i++) {
            processedImagePixels[pixelIndex + i] = imagePixels[pixelIndex + i];
          }
        }
      }
    }
    return { data: processedImagePixels, info: imageInfo };
  }

  try {
    const {
      image: imageData,
      mask: maskData,
      metadata,
    } = await _load_image_and_mask(base64_image, mask_url);
    const target_color_rgb = hex_to_rgb(hex_target_color);
    const blend_mode = _determine_blend_mode(target_color_rgb);
    const processedImageData = await _apply_color_blending(
      imageData,
      maskData,
      metadata,
      target_color_rgb,
      blend_mode
    );
    let buffer_data = await sharp(processedImageData.data, {
      raw: {
      width: metadata.width,
      height: metadata.height,
      channels: processedImageData.info.channels,
      },
    })
      .toFormat(JPEG_FORMAT)
      .toBuffer();

    await sharp(buffer_data).toFile(output_path);
    
    // If you need base64, you can convert the buffer like this:
    const base64Data = buffer_data.toString('base64');
    console.log(`Auto-selected '${blend_mode}' mode. Output: ${output_path}`);

    return base64Data;
  } catch (e) {
    console.error(`Image processing failed: ${e}`); // Or re-raise for higher level handling
  }
}
export async function ImgChangeColor(original_image_base64, masked_image_base64, target) {
  const original_image_buffer = Buffer.from(original_image_base64, "base64");
  const masked_image_buffer = Buffer.from(masked_image_base64, "base64");
  try {
    const bounding_box = await estimate_bounding_box(masked_image_buffer);
    if (bounding_box) {
      const [x_min, y_min, x_max, y_max] = bounding_box;
      const result = await get_segment(
        [
          [x_min, y_min],
          [x_max, y_max],
        ],
        original_image_base64
      );
      const masked_refined_url = result.image.url;
      
      const buffer_base64 = await change_color_in_mask_overlay_photoshop(
        original_image_buffer,
        masked_refined_url,
        target,
        OUTPUT_IMAGE_NAME
      );
      return buffer_base64;
    }
  } catch (e) {
    if (e instanceof FileUploadError) {
      console.error(`File upload error in main: ${e.message}`);
    } else if (e instanceof ImageBoundingBoxError) {
      console.error(`Bounding box error in main: ${e.message}`);
    } else if (e instanceof SegmentationError) {
      console.error(`Segmentation error in main: ${e.message}`);
    } else if (e instanceof ImageProcessingError) {
      console.error(`Image processing error in main: ${e.message}`);
    } else {
      console.error(`An unexpected error occurred in main: ${e}`);
    }
  }
}
// Example usage
// sharp("./origin.jpg").toBuffer()
//   .then(originalBuffer => {
//     return sharp("./mask.png").toBuffer()
//       .then(async maskBuffer => {
//         const result = await ImgChangeColor(originalBuffer.toString('base64'), maskBuffer.toString('base64'), "#FFFFFF");
//         console.log(result.slice(0, 50));
//         return result;
//       });
//   })
//   .catch(error => console.error('Error:', error));