export const generateOutputImage = async (selectionPaths: Array<{ type: "freehand" | "rectangle"; points: number[][] }>, originalImage: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Set white background
      ctx!.fillStyle = "white";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      // Draw red shapes
      ctx!.fillStyle = "red";
      selectionPaths.forEach((path) => {
        ctx!.beginPath();
        if (path.type === "freehand") {
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
      });

      resolve(canvas.toDataURL("image/png"));
    };
    img.src = originalImage;
  });
};
