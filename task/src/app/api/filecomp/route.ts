// export async function GET(request: Request) {
//   return NextResponse.json({
//     totalVisitors: 2,
//     days: 7,
//   });
// }

// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import archiver from "archiver";
import { createReadStream, createWriteStream } from "fs";

export const POST = async (req:NextRequest, res:NextResponse) => {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.replaceAll(" ", "_");

  try {
    // Write the original file
    await writeFile(
      path.join(process.cwd(), "public/uploads/" + filename),
      buffer
    );

    // Create a zip file
    const zipFilename = filename.replace(/\.[^/.]+$/, "") + ".zip"; // Change file extension to .zip
    const zipPath = path.join(process.cwd(), "public/zips/" + zipFilename);
    const outputZip = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Pipe the output of the archive to the zip file
    archive.pipe(outputZip);

    // Add the original file to the zip archive
    archive.append(createReadStream(path.join(process.cwd(), "public/uploads/" + filename)), { name: filename });

    // Finalize the archive (close the write stream)
    await archive.finalize();

    // Return success response with zip filename and path
    return NextResponse.json({ Message: "Success", zipFilename, zipPath, status: 201 });
  } catch (error) {
    console.log("Error occurred ", error);
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
};
