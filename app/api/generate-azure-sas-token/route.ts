import { NextResponse } from 'next/server';
import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';

export async function GET() {
  try {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
    const containerName = 'images';

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
    const blobClient = containerClient.getBlobClient(blobName);

    const sasToken = generateBlobSASQueryParameters({
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("cw"),
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour from now
    }, sharedKeyCredential).toString();

    return NextResponse.json({
      sasToken,
      blobName,
      containerName,
      accountName
    });
  } catch (error) {
    console.error('Error generating SAS token:', error);
    return NextResponse.json({ error: 'Failed to generate SAS token' }, { status: 500 });
  }
}