import JSZip from "jszip";

const base64ToBlob = (base64: string, mimeType: string) => {
  const base64Pattern = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+)?;base64,/;
  if (!base64Pattern.test(base64)) {
    console.warn(
      "Base64 string is missing data URL prefix. Adding default prefix."
    );
    base64 = `data:${mimeType};base64,${base64}`;
  }
  const base64Data = base64.replace(base64Pattern, "");
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch (error) {
    console.error("Failed to decode base64 string. Error:", error);
    throw new Error("Invalid base64 string: Could not decode.");
  }
};

export const downloadImages = async (images: string[]) => {
  const addBase64Header = (base64: string, mimeType: string = "image/jpeg") => {
    const base64Pattern = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+)?;base64,/;
    if (!base64Pattern.test(base64)) {
      return `data:${mimeType};base64,${base64}`;
    }
    return base64;
  };
  if (images.length === 1) {
    const previewImage = images[0];
    if (previewImage && previewImage !== "") {
      const correctedImage = addBase64Header(previewImage, "image/jpeg");
      const link = document.createElement("a");
      const base64Pattern = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+)?;base64,/;
      if (base64Pattern.test(correctedImage)) {
        link.href = correctedImage;
        link.download = "downloaded_image.jpg";
      } else {
        alert("รูปภาพไม่ใช่ base64 string ที่ถูกต้อง");
        return;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("ไม่มีรูปภาพให้ดาวน์โหลด");
    }
  } else if (images.length > 1) {
    const zip = new JSZip();
    const imageFolder = zip.folder("images");

    const imagePromises = images.map((imageUrl, index) => {
      const mimeType = "image/jpeg";
      const base64Data = imageUrl;
      const blob = base64ToBlob(base64Data, mimeType);
      const fileName = `image_${index + 1}.jpg`;
      imageFolder?.file(fileName, blob);
    });

    await Promise.all(imagePromises);

    zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "images.zip";
      link.click();
    });
  } else {
    alert("No images available for download");
  }
};
