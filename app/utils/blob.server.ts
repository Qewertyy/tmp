import type { UploadHandler } from "@remix-run/node";

async function blobUpload(
  data: AsyncIterable<Uint8Array>,
  filename: string | undefined
): Promise<any> {
  const formData = new FormData();
  const chunks: Uint8Array[] = [];
  for await (const chunk of data) {
    chunks.push(chunk);
  }
  formData.append("file", new Blob(chunks), filename);
  const response = await fetch("https://blob.qewertyy.dev/upload", {
    method: "POST",
    body: formData,
  });
  return await response.json();
}

export const blobUploadHandler: UploadHandler = async ({
  name,
  filename,
  data,
}) => {
  if (name !== "file" || !filename) {
    return undefined;
  }
  const res = await blobUpload(data, filename);
  if (res?.code && res.code === 2) {
    return res.url;
  }
  return undefined;
};
