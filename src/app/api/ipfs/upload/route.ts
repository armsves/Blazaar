import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const result = await pinata.upload.file(file);
    console.log("Pinata upload result:", result);
    
    // Handle different possible response structures
    const cid = result.IpfsHash;
    
    if (!cid) {
      console.error("No CID found in result:", result);
      return NextResponse.json({ error: "Upload succeeded but no CID returned" }, { status: 500 });
    }

    const ipfsUrl = `ipfs://${cid}`;
    
    return NextResponse.json({ ipfsUrl, hash: cid }, { status: 200 });
  } catch (e) {
    console.error("Upload error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}