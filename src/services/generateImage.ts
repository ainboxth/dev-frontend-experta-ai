import axiosInstance from "./axiosConfic";

const generateImage = async (
  image_base64: string,
  img_name: string,
  prompt: string,
  value: number
) => {
  const body = {
    prompt: prompt,
    img_name: img_name,
    image_base64: image_base64,
    value: value.toString(),
  };

  try {
    const response = await axiosInstance.post("/img2img", body);
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default generateImage;
