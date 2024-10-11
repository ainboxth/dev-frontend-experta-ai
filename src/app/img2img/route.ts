import { NextRequest, NextResponse } from "next/server";
import { images } from "./mockData";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const data = {
      body,
      images,
    };

    return NextResponse.json(data);
    // throw new Error("Error");
    
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}





// import { NextRequest, NextResponse } from "next/server";
// import { images } from "./mockData";

// export async function POST(request: NextRequest) {
//   const body = await request.json();

//   const data = {
//     body,
//     images,
//   };

//   return NextResponse.json(data);
// }
