const resizeImage = (file: File, maxWidth: number, maxHeight: number) => {
  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // คำนวณอัตราส่วน
        const aspectRatio = width / height;
        if (width > 1024 || height > 1024) {
          if (aspectRatio > 1) {
            // รูปภาพแนวนอน
            width = 1024;
            height = Math.round(1024 / aspectRatio);
          } else {
            // รูปภาพแนวตั้งหรือสี่เหลี่ยม
            height = 1024;
            width = Math.round(1024 * aspectRatio);
          }
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return reject(new Error("Canvas context not available"));

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error("Failed to resize image"));
          }
        }, file.type);
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

export default resizeImage;
