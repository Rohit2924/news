import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import fs from 'fs';
import {z } from 'zod';
import path from 'path';

export const runtime = 'nodejs';




// CV validation 
const applicationSchema = z.object({
  name: z.string().min(1,"Name is required"),
  email: z.string().email("Invalid Email"),
  phone: z.string().refine((phone) => {
    if (!phone) return false; 
    const digitsOnly = phone.replace(/^\+\d{1,3}/, '').replace(/\D/g, '');
    return digitsOnly.length >= 6 && digitsOnly.length <=15;
  }, "phone must be 6-15 digits with our country code)"),

position: z.enum([
  "Senior Journalist",
  "Content Editor",
  "Digital Marketing Specialist",
  "Social Media Manager" // ✅ Correct spelling
]),
  coverNote: z.string().min(3),
  cv: z.custom<File>()
    .refine((file) => file instanceof File || (typeof file === 'object' && 'size' in file && 'type' in file), "Invalid file")
    .refine((file) => file.size > 0, "CV is required")
    .refine((file) => file.size <= 10 * 1024 *1024, "CV must be less that 10MB")
    .refine((file) => ["application/pdf", "application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type),
    "only PDF, DOC, and DOCX files are allowed"
    )

})



export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 415 });
    }
    
    const formData = await request.formData();
    const rawData = {
      name : formData.get('name'),
      email : formData.get('email'),
      phone : formData.get('phone'),
      position : formData.get('position'),
      coverNote : formData.get('coverNote'), 
      cv : formData.get('cv') 
    };


  // Validation with zod
  const validationResult = applicationSchema.safeParse(rawData);

  if(!validationResult.success){
    const errors = validationResult.error.issues.map(issue => ({
      field: issue.path[0],
      message: issue.message
    }));

    return NextResponse.json({error: 'validation failed', details: errors
    },{status: 400})
  }

  const { name, email, phone, position, coverNote, cv} = validationResult.data; 

    // File processing 
      const uploadDir = path.join(process.cwd(), 'private_uploads', 'cvs');
        try { await fs.promises.access(uploadDir) 
        } catch { 
          await fs.promises.mkdir(uploadDir, { recursive: true }) }


    // if validation passes, we will get clean typed data 
        const arrayBuf = await cv.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const safeName = `${Date.now()}-${cv.name}`.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const destPath = path.join(uploadDir, safeName);
        const cvPath = `cvs/${safeName}`;

        try{
          await fs.promises.writeFile(destPath, buffer);
          
          const saved = await prisma.jobApplication.create({
            data: { name, email, phone, position, coverNote, cvPath},

          });
          return NextResponse.json({success: true,data: {id:saved.id}},{status:201
          });
          
        } catch (dbError){
          try{ 
            await fs.promises.unlink(destPath);
          } catch(cleanupError){
            console.error('Failed to cleanup file:', cleanupError);
          }
          throw dbError;
        } 
      } catch (error: any){
        return NextResponse.json({error: 'Failed to submit application', details: error?.message},{status: 500});
      }
}
        



