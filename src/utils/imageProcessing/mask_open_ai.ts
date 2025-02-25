export const generateOutputImage_OpenAI = async (selectionPaths: Array<{ id: string; type: "freehand" | "rubber" | "rectangle" | "point2point"; points: number[][] }>, originalImage: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image first
      ctx!.drawImage(img, 0, 0);

      // Set transparent background for the marked areas
      ctx!.save(); // Save the current drawing state
      ctx!.globalCompositeOperation = "source-in"; // Set composition mode to cut out the marked areas

      // Draw shapes (marked areas) on the canvas in a way that only the area inside the shapes will be transparent
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

      // Now, set the composite operation to fill the rest of the canvas (outside of the marked areas) with blue color
      ctx!.restore(); // Restore previous state to stop making the marked areas transparent

      ctx!.globalCompositeOperation = "source-over"; // Reset to default composite operation
      ctx!.fillStyle = "blue"; // Set the fill color to blue
      ctx!.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with blue

      // Make sure the marked areas remain transparent
      ctx!.globalCompositeOperation = "destination-out"; // Use destination-out to erase the marked areas
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