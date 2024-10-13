export const generateOutputImage = async (selectionPaths: Array<{ id: string; type: "freehand" | "rubber" | "rectangle" | "point2point"; points: number[][] }>, originalImage: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Set transparent background
      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      // Draw shapes
      ctx!.fillStyle = "black";
      selectionPaths.forEach((path) => {
        if (path.type !== "rubber") {
          ctx!.beginPath();
          if (path.type === "freehand" || path.type === "point2point") {
            if (path.points.length > 0) {
              ctx!.moveTo(path.points[0][0], path.points[0][1]);
              for (let i = 1; i < path.points.length; i++) {
                ctx!.lineTo(path.points[i][0], path.points[i][1]);
              }
            }
            ctx!.closePath();
          } else if (path.type === "rectangle") {
            if (path.points.length === 2) {
              const [startPoint, endPoint] = path.points;
              ctx!.rect(startPoint[0], startPoint[1], endPoint[0] - startPoint[0], endPoint[1] - startPoint[1]);
            }
          }
          ctx!.fill();
        }
      });

      // Convert to base64 and resolve
      resolve(canvas.toDataURL("image/png"));
    };

    // Set the image source to load the dimensions
    if (originalImage.startsWith("data:image/")) {
      img.src = originalImage;
    } else {
      img.src = `data:image/jpeg;base64,${originalImage}`;
    }
  });
};
