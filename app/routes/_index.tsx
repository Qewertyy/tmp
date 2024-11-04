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
import { blobUploadHandler } from "~/lib/blob.server";
import React, { useState } from "react";
import { useToast } from "~/components/hooks/useToast";

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
  if (img instanceof File && img.size <= 0) {
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
  const { toast } = useToast();
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const inputElement = document.getElementById(
        "dropzone-file"
      ) as HTMLInputElement;
      inputElement.files = dataTransfer.files;
      toast({
        description: `Selected file: ${file.name}`,
      });
    }
  };

  return (
    <>
      <div className="flex h-screen items-center justify-between flex-col gap-3 px-4">
        <div className="flex flex-col items-center gap-3 w-full justify-center h-[-webkit-fill-available]">
          <header className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white">
              <span className="text-red-600 dark:text-red-700">T</span>mp
            </h1>
            <p className="leading-6 text-gray-700 dark:text-gray-200">
              Uploads up to 100 MB are allowed
            </p>
          </header>
          <fetcher.Form
            method="post"
            encType="multipart/form-data"
            className="flex flex-col gap-2 w-full items-center"
          >
            <div
              className={`flex w-full max-w-lg items-center justify-center cursor-pointer ${
                isDragActive ? "bg-gray-200 dark:bg-gray-800" : ""
              }`}
              onDragEnter={handleDragEnter}
              onDrop={handleDrop}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
            >
              <label
                htmlFor="dropzone-file"
                className="flex h-60 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed dark:bg-black bg-white dark:border-gray-600 hover:border-gray-500 transition-colors"
                aria-label="Drop file here"
              >
                <div className="flex flex-col items-center justify-center ">
                  <svg
                    className="mb-4 h-16 w-16 text-black dark:text-gray-200"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm font-semibold dark:text-gray-200">
                    {isDragActive ? "Drop the file here" : "Upload a File"}
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  name="file"
                  type="file"
                  accept="image/*,video/*,audio/*,application/pdf"
                  className="hidden"
                />
              </label>
            </div>
            <button
              type="submit"
              className="p-2 dark:bg-white dark:text-black rounded-md w-full max-w-lg hover:translate-y-1 transition-transform duration-200 ease-in-out"
            >
              Upload
            </button>
          </fetcher.Form>
          <div className="w-fit">
            {fetcher.data ? (
              fetcher.data?.errorMsg ? (
                <h2 className="text-red-400">{fetcher.data.errorMsg}</h2>
              ) : (
                <p>
                  File has been uploaded and is available under the following
                  URL:
                  <br />
                  <a href={fetcher.data.url} className="break-all text-sm">
                    {fetcher.data.url}
                  </a>
                </p>
              )
            ) : null}
          </div>
        </div>
        <div>
          Source -&gt;{" "}
          <a className="hover:underline" href="https://github.com/qewertyy/tmp">
            Github{" "}
          </a>
        </div>
      </div>
    </>
  );
}
