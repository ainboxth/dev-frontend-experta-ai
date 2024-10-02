const SrcImgForRender = (imageSrc: string | Blob) => {
  if (imageSrc instanceof Blob) {
    return URL.createObjectURL(imageSrc);
  } else if (
    typeof imageSrc === "string" &&
    (imageSrc.startsWith("http") || imageSrc.startsWith("blob:"))
  ) {
    return imageSrc;
  } else {
    return `data:image/jpeg;base64,${imageSrc}`;
  }
};
export default SrcImgForRender;
