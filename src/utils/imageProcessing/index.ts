export const generateOutputImage = async (
  selectionPaths: Array<{
    id: string;
    type: "freehand" | "rubber" | "rectangle" | "point2point";
    points: number[][];
  }>,
  originalImage: string
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context is null");
    }

    const img = new Image();

    img.onload = () => {
      // บังคับให้เป็น RGBA (4 channels)
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw selection paths with white color (mask)
      ctx.fillStyle = "white";
      selectionPaths.forEach((path) => {
        if (path.type !== "rubber") {
          ctx.beginPath();
          if (path.type === "freehand" || path.type === "point2point") {
            if (path.points.length > 0) {
              ctx.moveTo(path.points[0][0], path.points[0][1]);
              for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i][0], path.points[i][1]);
              }
            }
            ctx.closePath();
          } else if (path.type === "rectangle") {
            if (path.points.length === 2) {
              const [startPoint, endPoint] = path.points;
              ctx.rect(
                startPoint[0],
                startPoint[1],
                endPoint[0] - startPoint[0],
                endPoint[1] - startPoint[1]
              );
            }
          }
          ctx.fill();
        }
      });

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const channels = imageData.data.length / (canvas.width * canvas.height);
      console.log("Channels:", channels); // ควรเป็น 4

      canvas.toBlob(
        (blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob!);
        },
        "image/png"
      );
    };

    // ✅ บังคับให้ originalImage เป็น RGBA (4 channels)
    if (originalImage.startsWith("data:image/")) {
      img.src = originalImage;
    } else {
      img.src = `data:image/jpeg;base64,${originalImage}`;
    }
  });
};