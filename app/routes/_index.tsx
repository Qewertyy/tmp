import type {
  MetaFunction,
  ActionFunctionArgs,
  UploadHandler,
} from "@remix-run/node";
import {
  json,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { blobUploadHandler } from "~/utils/blob.server";

export const meta: MetaFunction = () => {
  return [
    { title: "tmp" },
    { name: "description", content: "store your files" },
  ];
};

type data = {
  errorMsg?: string;
  url?: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const uploadHandler: UploadHandler = composeUploadHandlers(
    blobUploadHandler,
    createMemoryUploadHandler()
  );
  const formData = await parseMultipartFormData(request, uploadHandler);
  const img = formData.get("file");
  if (img instanceof File && img.size >= 0) {
    return json({
      errorMsg: "No file was provided",
    });
  }
  if (!img) {
    return json({
      errorMsg: "Something went wrong while uploading",
    });
  }
  return json({
    url: img,
  });
};

export default function Index() {
  const fetcher = useFetcher<data>();
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-3">
      <div className="flex flex-col items-center gap-3">
        <header className="flex flex-col items-center gap-4">
          <div>
            <h1 className="text-6xl font-bold text-center text-black dark:text-white">
              <span className="text-6xl font-bold text-center text-red-600 dark:text-red-700">
                T
              </span>
              mp
            </h1>
          </div>
          <p className="leading-6 text-gray-700 dark:text-gray-200">
            Uploads up to 100 MB are allowed
          </p>
        </header>
        <nav className="flex w-full flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <fetcher.Form
            method="post"
            encType="multipart/form-data"
            className="flex flex-col gap-2 w-full items-center"
          >
            <label htmlFor="img-field">Image to upload</label>
            <input id="img-field" type="file" name="file" accept="image/*" />
            <button type="submit">Upload</button>
          </fetcher.Form>
          {fetcher.data ? (
            fetcher.data?.errorMsg ? (
              <h2>{fetcher.data.errorMsg}</h2>
            ) : (
              <>
                <div>
                  File has been uploaded and is available under the following
                  URL:
                </div>
                <div>
                  <a href={fetcher.data.url}>{fetcher.data.url}</a>
                </div>
              </>
            )
          ) : null}
        </nav>
      </div>
      <div>
        Source -&gt; <a href="https://github.com/qewertyy/tmp">Github </a>
      </div>
    </div>
  );
}
