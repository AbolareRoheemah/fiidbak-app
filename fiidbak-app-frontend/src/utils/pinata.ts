import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: "ipfs.io",
});

/**
 * Upload a single file to Pinata (IPFS).
 */
export async function uploadFileToPinata(file: File) {
  try {
    const upload = await pinata.upload.public.file(file);
    console.log("cid", upload?.cid);
    return upload?.cid || "";
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/**
 * Upload a JSON object (e.g., product metadata) to Pinata (IPFS).
 * @param data - The object to upload (will be stringified to JSON).
 * @returns The IPFS CID string.
 */
export async function uploadJsonToPinata(data: Record<string, any>) {
  try {
    // If the object contains a File (e.g., image), handle it as a multipart upload
    if (data.image && data.image instanceof File) {
      // Remove the File from the object, upload it, and replace with its gateway URL
      const imageFile = data.image;
      const imageCid = await uploadFileToPinata(imageFile);
      // Store the image as a gateway URL (https://ipfs.io/ipfs/<cid>)
      data.image = `https://ipfs.io/ipfs/${imageCid}`;
    }
    const upload = await pinata.upload.public.json(data);
    console.log("json cid", upload?.cid);
    return upload?.cid || "";
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/**
 * Get a public gateway URL for a given CID.
 */
export async function getUploadedFile(cid: string) {
  try {
    const url = await pinata.gateways.public.convert(cid);
    console.log("url", url);
    return url;
  } catch (error) {
    console.log(error);
    throw error;
  }
}