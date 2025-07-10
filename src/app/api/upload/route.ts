import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function POST(request : NextRequest){
 try {
       const data: FormData = await request.formData()
       const file: File | null = data.get("file") as unknown as File
   
       if(!file) return NextResponse.json({success : false})
   
       // The file has an array buffer which is going to return a promise for an array buffer which takes the bytes and puts it into the file type
       const bytes = await file.arrayBuffer();
       // and then the buffer implementation can take that and turn this object into a buffer now
       const buffer = Buffer.from(bytes)
       // So as node.js knows about buffers it can handle it perfectly
   
       console.log("File found")

       // Use process.cwd() to get the absolute project root
       const path = join(process.cwd(), "public", "temp", file.name);

       
       await writeFile(path, buffer)
   
       console.log(`open ${path} to see the file`)
   
       return NextResponse.json({success: true})
 } catch (error) {
    console.log(error)
 }

}