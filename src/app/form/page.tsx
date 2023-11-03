"use client";
// "use client";

// import { useState } from "react";
import {
  MultiFileDropzone,
  type FileState,
} from "@/components/multi-file-dropzone";
import { useEdgeStore } from "@/lib/edgestore";
import { useState } from "react";

export default function Page() {
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  // const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const { edgestore } = useEdgeStore();
  const [formData, setFormData] = useState({
    teamName: "",
    password: "",
    profitLoss: "",
    description: "",
    totalMoney: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [validationErrors, setValidationErrors] = useState({
    teamName: "",
    password: "",
    profitLoss: "",
    description: "",
    totalMoney: "",
  });

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    setIsLoading(true);

    // Reset previous validation errors
    setValidationErrors({
    teamName: "",
    password: "",
    profitLoss: "",
    description: "",
    totalMoney: "",
    });

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      

      if (response.status === 201) {
        const data = await response.json();
        console.log("User registered:", data.user);
        setIsSubmitted(true);
      } else if (response.status === 400) {
        const data = await response.json();
        if (data.errors) {
          // Set validation error messages based on the server response
          setValidationErrors(data.errors);
        }
      } else {
        console.error("Registration failed:", response.statusText);
      }
      for (const url of urls) {
        await edgestore.myPublicImages.upload({
          url,
          input: {
            type: "post",  // Specify the type as "post" or "profile"
          },
        });
      }
    } catch (error) {
      console.error("Error during registration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  function updateFileProgress(key: string, progress: FileState["progress"]) {
    setFileStates((fileStates) => {
      const newFileStates = structuredClone(fileStates);
      const fileState = newFileStates.find(
        (fileState) => fileState.key === key
      );
      if (fileState) {
        fileState.progress = progress;
      }
      return newFileStates;
    });
  }

  if (isSubmitted) {
    return <div className="flex flex-col items-center m-6">COMPLETE!!!</div>;
  }
  if (isCancelled) {
    return <div className="flex flex-col items-center m-6">CANCELLED!!!</div>;
  }

  return (
    <div className="flex flex-row items-center m-6">
      <div className="flex gap-4">
        <MultiFileDropzone
          value={fileStates}
          onChange={(files) => {
            setFileStates(files);
          }}
          onFilesAdded={async (addedFiles) => {
            setFileStates([...fileStates, ...addedFiles]);
            await Promise.all(
              addedFiles.map(async (addedFileState) => {
                try {
                  const res = await edgestore.myProtectedFiles.upload({
                    file: addedFileState.file,
                    options: {
                      temporary: true,
                    },
                    onProgressChange: async (progress) => {
                      updateFileProgress(addedFileState.key, progress);
                      if (progress === 100) {
                        // wait 1 second to set it to complete
                        // so that the user can see the progress bar at 100%
                        await new Promise((resolve) =>
                          setTimeout(resolve, 1000)
                        );
                        updateFileProgress(addedFileState.key, "COMPLETE");
                      }
                    },
                  });
                  setUrls((prev) => [...prev, res.url]);
                } catch (err) {
                  updateFileProgress(addedFileState.key, "ERROR");
                }
              })
            );
          }}
        />
        {/* Just a dummy form for demo purposes */}
        <div className="flex flex-col gap-2">
          <div>
            {isSubmitted ? (
              <>
                <div>
                  success
                </div>
              </>
            ) : (
              <>
                <div className="m-[auto] max-w-xs">
                  <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                  >
                    {/* Team Name */}
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Team Name:
                        <input
                          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                            validationErrors.teamName ? "border-red-500" : ""
                          }`}
                          type="text"
                          name="teamName"
                          placeholder="Team Name"
                          value={formData.teamName}
                          onChange={handleChange}
                          required
                        />
                      </label>
                      {validationErrors.teamName && (
                        <p className="text-red-500 text-xs italic">
                          {validationErrors.teamName}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Password:
                        <input
                          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                            validationErrors.password ? "border-red-500" : ""
                          }`}
                          type="password"
                          name="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </label>
                      {validationErrors.password && (
                        <p className="text-red-500 text-xs italic">
                          {validationErrors.password}
                        </p>
                      )}
                    </div>

                    {/* Profit/Loss */}
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Profit/Loss:
                        <input
                          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                            validationErrors.profitLoss ? "border-red-500" : ""
                          }`}
                          type="text"
                          name="profitLoss"
                          placeholder="Profit/Loss"
                          value={formData.profitLoss}
                          onChange={handleChange}
                          required
                        />
                      </label>
                      {validationErrors.profitLoss && (
                        <p className="text-red-500 text-xs italic">
                          {validationErrors.profitLoss}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Description:
                        <input
                          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                            validationErrors.description ? "border-red-500" : ""
                          }`}
                          type="text"
                          name="description"
                          placeholder="Description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                        />
                      </label>
                      {validationErrors.description && (
                        <p className="text-red-500 text-xs italic">
                          {validationErrors.description}
                        </p>
                      )}
                    </div>

                    {/* Total Money */}
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Total Money:
                        <input
                          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                            validationErrors.totalMoney ? "border-red-500" : ""
                          }`}
                          type="text"
                          name="totalMoney"
                          placeholder="Total Money"
                          value={formData.totalMoney}
                          onChange={handleChange}
                          required
                        />
                      </label>
                      {validationErrors.totalMoney && (
                        <p className="text-red-500 text-xs italic">
                          {validationErrors.totalMoney}
                        </p>
                      )}
                    </div>

                    <button
                      className={`shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      type="submit"
                      disabled={isLoading}
                      onClick={handleSubmit}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin inline-block h-4 w-4 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm6 9a8 8 0 010-16V0h4a8 8 0 000 16h-4v-4zm10-3a8 8 0 00-8-8v-4a12 12 0 0112 12h-4z"
                            ></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        "Register"
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end mt-2 gap-2">
            <button
              className="bg-white text-black rounded px-3 py-1 hover:opacity-80"
              onClick={async () => {
                for (const url of urls) {
                  await edgestore.myPublicImages.upload({
                    url,
                    input: { type: "post" }
                  });
                }
                setIsSubmitted(true);
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextField(props: {
  name?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <input
      type="text"
      name={props.name}
      className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1"
      onChange={(e) => props.onChange?.(e.target.value)}
    />
  );
}
