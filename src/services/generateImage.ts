import axiosInstance from "./axiosConfic";

interface ImageRequestData {
  useFor: "magic_genImage" | "magic_removeMask" | "normal_genImage";
  imageBase64: string;
  maskBase64?: string;
  prompt?: string;
  img_name?: string;
  value?: string;
  selectedColor?: string;
  color?: string;
}

const generateImageRequest = async (
  endpoint: string,
  data: ImageRequestData
): Promise<string[]> => {
  try {
    const response = await axiosInstance.post<string[]>(endpoint, data);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("Error generating output image:", error);
    throw error;
  }
};

const normalGenerateImage = async (
  imageBase64: string,
  img_name: string,
  prompt: string,
  value: number
): Promise<string[]> => {
  return generateImageRequest("api/v1/normal", {
    useFor: "normal_genImage",
    prompt,
    imageBase64,
    img_name,
    value: (value * 10).toString(),
  });
};

const magicGenerateImage = async (
  prompt: string,
  imageBase64: string,
  maskBase64: string,
  img_name: string,
  color?: string
): Promise<string[]> => {
  return generateImageRequest("api/v1/magic", {
    useFor: "magic_genImage",
    prompt,
    imageBase64,
    maskBase64,
    img_name,
    color
  });
};

const magicRemoveMask = async (
  imageBase64: string,
  maskBase64: string
): Promise<string[]> => {
  return generateImageRequest("api/v1/magic", {
    useFor: "magic_removeMask",
    imageBase64,
    maskBase64,
  });
};

const magicChangeColor = async (
  imageBase64: string,
  maskBase64: string,
  color: string
): Promise<string[]> => {
  return generateImageRequest("api/v1/magic", {
    useFor: "magic_removeMask",
    imageBase64,
    maskBase64,
    color: color,
  });
};

export { magicGenerateImage, magicRemoveMask, normalGenerateImage };
