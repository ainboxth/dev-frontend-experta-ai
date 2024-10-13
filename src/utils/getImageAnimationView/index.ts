const getImageAnimation = (location: number | null, reverseAnimation: boolean = false) => {
    if (location === null) {
      return { x: 0, y: 0, opacity: 1 };
    }
  
    const commonProps = {
      opacity: 0, 
      scale: 0,   
    };
    const commonPropsReverse = {
      opacity: 1, 
      scale: 1.5,   
    };
  
    const animations: {
        normal: { [key: number]: { x: string; y: string; opacity: number; scale: number } };
        reverse: { [key: number]: { x: string; y: string; opacity: number; scale: number } };
      } = {
        normal: {
          0: { ...commonProps, x: "-100%", y: "-100%" },
          1: { ...commonProps, x: "100%", y: "-100%" },
          2: { ...commonProps, x: "-100%", y: "100%" },
          3: { ...commonProps, x: "100%", y: "100%" }
        },
        reverse: {
          0: { ...commonPropsReverse, x: "100%", y: "100%" },
          1: { ...commonPropsReverse, x: "-100%", y: "100%" },
          2: { ...commonPropsReverse, x: "100%", y: "-100%" },
          3: { ...commonPropsReverse, x: "-100%", y: "-100%" }
        }
      };
  
    return reverseAnimation ? animations.reverse[location] : animations.normal[location];
  };
  
  export default getImageAnimation;
  