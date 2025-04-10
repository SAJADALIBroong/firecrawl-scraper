// actions/store-pdf.ts
'use server';

import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { Document } from 'langchain/document';

// Initialize Pinecone client
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

export async function storePDF(data: {
  chunks: string[];
  title: string;
  namespace?: string;
}) {
  try {
    const { chunks, title, namespace } = data;

    if (!chunks || !chunks.length) {
      throw new Error('No chunks provided');
    }

    // Create a namespace for this PDF if not provided
    const documentNamespace = namespace || `pdf-${title}-${Date.now()}`;

    // Convert chunks to LangChain Document objects with metadata
    const documents = chunks.map((chunk: string, i: number) => {
      return new Document({
        pageContent: chunk,
        metadata: {
          source: title,
          chunk: i,
        },
      });
    });

    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Pinecone index
    const index = pinecone.Index(process.env.PINECONE_INDEX!);

    // Store documents in Pinecone
    await PineconeStore.fromDocuments(documents, embeddings, {
      pineconeIndex: index,
      namespace: documentNamespace,
    });

    return {
      success: true,
      documentCount: documents.length,
      namespace: documentNamespace,
    };
  } catch (error: unknown) {
    console.log(error,"error")
    console.error('Error storing PDF chunks:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
}