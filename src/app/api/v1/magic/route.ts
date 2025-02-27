import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import sharp from "sharp";
import { ImgChangeColor } from "./function/changeColor";
import { prompt_refiner } from "./function/PromptRefiner";

const replicate = new Replicate();

async function preprocessImage(base64String: string) {
  const buffer = Buffer.from(base64String, "base64");
  const processedImage = await sharp(buffer)
    .toFormat("png")
    .removeAlpha()
    .toBuffer();
  return processedImage.toString("base64");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  let { maskBase64, imageBase64, prompt, img_name, useFor, color } = body;
  imageBase64 = await preprocessImage(imageBase64);
  maskBase64 = await preprocessImage(maskBase64);
  const image = `data:application/octet-stream;base64,${imageBase64}`;
  const mask = `data:application/octet-stream;base64,${maskBase64}`;

  const validateRequestBody = (body: {
    useFor?: string;
    imageBase64?: string;
    maskBase64?: string;
    prompt?: string;
  }) => {
    const missingFields = [];
    if (!body.useFor) missingFields.push("useFor");
    if (!body.imageBase64) missingFields.push("imageBase64");
    if (
      (body.useFor === "magic_genImage" || body.useFor === "normal_genImage") &&
      !body.prompt
    )
      missingFields.push("prompt");
    if (
      (body.useFor === "magic_genImage" ||
        body.useFor === "magic_removeMask") &&
      !body.maskBase64
    )
      missingFields.push("maskBase64");
    if (missingFields.length > 0) {
      return { error: `Missing required fields: ${missingFields.join(", ")}` };
    }
    return null;
  };

  const useModel = (model: "dev" | "pro" | "delete") => {
    let model_name:
      | "black-forest-labs/flux-fill-dev"
      | "black-forest-labs/flux-fill-pro"
      | "zylim0702/remove-object:0e3a841c913f597c1e4c321560aa69e2bc1f15c65f8c366caafc379240efd8ba" =
      "black-forest-labs/flux-fill-dev";
    if (model === "dev") {
      model_name = "black-forest-labs/flux-fill-dev";
    } else if (model === "pro") {
      model_name = "black-forest-labs/flux-fill-pro";
    } else if (model === "delete") {
      model_name =
        "zylim0702/remove-object:0e3a841c913f597c1e4c321560aa69e2bc1f15c65f8c366caafc379240efd8ba";
    }

    let model_input_nomal = {
      mask: mask,
      image: image,
      prompt: prompt_refiner(prompt) ?? prompt,
      guidance: 65,
      lora_scale: 1,
      megapixels: "1",
      num_outputs: 1,
      output_format: "png",
      output_quality: 100,
      prompt_upsampling: 80,
      num_inference_steps: 50,
    };

    let model_input_delete = {
      mask: mask,
      image: image,
    };

    const model_input =
      model === "delete" ? model_input_delete : model_input_nomal;

    return { model_name, model_input };
  };

  try {
    const validate = validateRequestBody(body);
    if (validate) {
      throw new Error(JSON.stringify(validate));
    }
    const model = useFor === "magic_removeMask" ? "delete" : "dev";
    const { model_name, model_input: input } = useModel(model);

    // Run the model with Replicate
    let imageResponse;
    if (color) {
      imageResponse = await ImgChangeColor(imageBase64, maskBase64, color);
    } else {
      const response = await replicate.run(model_name, {
        input,
      });
      imageResponse = await convertImageToBase64(response as any);
    }

    return NextResponse.json([imageResponse], {
      status: 200,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(imageResponse.data, "binary");
    return buffer.toString("base64");
  } catch (error) {
    throw new Error("Failed to convert image to base64");
  }
};
