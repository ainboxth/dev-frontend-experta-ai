import axiosInstance from "./axiosConfic";

const generateImage = async (
  image_base64: string,
  img_name: string,
  prompt: string
) => {
  const body = {
    prompt: prompt,
    img_name: img_name,
    image_base64: image_base64,
  };

  try {
    const response = await axiosInstance.post("/generate-prompt", body);
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default generateImage;
