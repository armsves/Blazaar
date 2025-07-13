import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";

export async function POST(request: NextRequest) {
  try {
    const metadata = await request.json();
    
    console.log("Metadata to upload:", metadata);

    const result = await pinata.upload.json(metadata);
    console.log("Pinata JSON upload result:", result);
    
    // Handle different possible response structures
    const cid = result.IpfsHash;
    
    if (!cid) {
      console.error("No CID found in JSON result:", result);
      return NextResponse.json({ error: "Upload succeeded but no CID returned" }, { status: 500 });
    }

    const ipfsUrl = `ipfs://${cid}`;
    
    return NextResponse.json({ ipfsUrl, hash: cid }, { status: 200 });
  } catch (e) {
    console.error("JSON upload error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}