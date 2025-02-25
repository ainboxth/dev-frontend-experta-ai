import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import Replicate from "replicate";
const replicate = new Replicate();

export async function POST(req: NextRequest) {
  const body = await req.json();
  let { imageBase64, prompt, value } = body;
  const control_image = `data:application/octet-stream;base64,${imageBase64}`;
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
  const useModel = (model: "flux" | "flux-depth") => {
    let model_name:
      | "black-forest-labs/flux-dev"
      | "black-forest-labs/flux-depth-dev" =
      model === "flux"
        ? "black-forest-labs/flux-dev"
        : "black-forest-labs/flux-depth-dev";
    let model_input = {};
    const input = {
      image: control_image,
      prompt: prompt,
      go_fast: true,
      guidance: 6,
      megapixels: "1",
      num_outputs: 4,
      aspect_ratio: "4:3",
      output_format: "png",
      output_quality: 80,
      prompt_strength: Number(value) / 100,
      num_inference_steps: 28,
    };
    const input_deep = {
      prompt: prompt,
      guidance: Number(value),
      megapixels: "1",
      num_outputs: 4,
      control_image: control_image,
      output_format: "png",
      output_quality: 80,
      num_inference_steps: 28,
    };

    if (model === "flux") {
      model_input = input;
    } else if (model === "flux-depth") {
      model_input = input_deep;
    }

    return { model_name, model_input };
  };

  try {
    const validate = validateRequestBody(body);
    if (validate) {
      throw new Error(JSON.stringify(validate));
    }

    const { model_name, model_input: input } = useModel("flux");
    // ใช้ Replicate API
    const response = await replicate.run(model_name, {
      input,
    });

    if (!response || !Array.isArray(response) || response.length < 4) {
      return NextResponse.json(
        { error: "Failed to generate 4 images" },
        { status: 500 }
      );
    }

    const listImageResponse = await Promise.all(
      response.slice(0, 4).map(async (imageUrl) => {
        const imageResponse = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });
        const buffer = Buffer.from(imageResponse.data, "binary");
        return buffer.toString("base64");
      })
    );

    // ส่งข้อมูลกลับเป็น image/webp
    return NextResponse.json(listImageResponse, {
      status: 200,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    if (error instanceof Error) {
      console.log("====> error", error.message);
    } else {
      console.log("====> error", error);
      ``;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
