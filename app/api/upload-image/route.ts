import { NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';
import { createClient } from '@supabase/supabase-js';



export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;

    // Upload to Azure Blob Storage
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    const containerName = 'images';

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    await blockBlobClient.upload(buffer, buffer.length);

    const imageUrl = blockBlobClient.url;

    // Save image URL to Supabase
    const { data, error } = await supabase
      .from('images')
      .insert({ url: imageUrl, user_id: userId })
      .select();

    if (error) {
      console.error('Error saving image to Supabase:', error);
      return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl, id: data[0].id });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}