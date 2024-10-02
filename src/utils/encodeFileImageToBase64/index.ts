const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;
      if (result && typeof result === "string") {
        const base64String = result.replace(/^data:image\/[a-z]+;base64,/, "");
        resolve(base64String);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default convertToBase64;
