import { NextRequest, NextResponse } from 'next/server';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
// import { storePDF } from '@/app/actions/store-pdf';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log(file,"fileee");
    
    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Import directly from the lib folder to avoid test file requirement
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    
    try {
      // Parse the PDF
      const data = await pdfParse(buffer);
      
      // Split the text into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
      });
      
      const textChunks = await textSplitter.splitText(data.text);

      // const storeinDB = await storePDF({chunks:textChunks, title:file.name})
      // console.log(storeinDB,"tet");
      
      return NextResponse.json({ 
        totalPages: data.numpages,
        chunks: textChunks,
        title: file.name,
        text: data.text.substring(0, 1000) + '...' // Preview of the text
      });
    } catch (pdfError) {
      console.log(pdfError)
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json({ 
        error: 'Error parsing PDF content. Please make sure the file is a valid PDF.'
      }, { status: 400 });
    }
    
  } catch (error: unknown) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}