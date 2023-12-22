import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { writeFile } from "@tauri-apps/api/fs";

export enum FileType {
  VerilogCodeFile,
  TestBenchFile,
  None,
}

type Project = {
  name: string;
  projectDirectory: string;
  includedFiles: String[];
  excludedFiles: String[];
};

export function FileCreator({
  fileType,
  setOpen,
}: {
  fileType: FileType;
  setOpen: (open: boolean) => void;
}) {
  const [filename, setFilename] = useState(null as string | null);
  const [filePath, setFilePath] = useState(null as string | null);

  function fileTypeToDisplay(fileType: FileType) {
    switch (fileType) {
      case FileType.VerilogCodeFile:
        return "codeFile.v";
      case FileType.TestBenchFile:
        return "myTestbench_tb.v";
      default:
        return "";
    }
  }

  function getProjectPath() {
    invoke("get_project_state").then(
      (p) => {
        const project = p as Project;
        setFilePath(project.projectDirectory);
      },
      (_) => setFilePath("./")
    );
  }

  async function choosePath() {
    const selectedFileDirectory = await open({
      directory: true,
      multiple: false,
      defaultPath: filePath || undefined,
      recursive: true,
    });

    if (
      selectedFileDirectory !== null &&
      !Array.isArray(selectedFileDirectory)
    ) {
      setFilePath(selectedFileDirectory);
    }
  }

  useEffect(getProjectPath, []);

  return (
    <div id="file-creator">
      <h3>Create a new file</h3>
      <div>
        <p>File Name</p>
        <input
          type="text"
          placeholder={fileTypeToDisplay(fileType)}
          onChange={(e) => setFilename(e.target.value)}
          value={filename || ""}
        />
      </div>
      <div>
        <p>Location</p>
        <input
          type="text"
          placeholder="."
          value={filePath || ""}
          onChange={(e) => setFilePath(e.target.value)}
        />
        <button onClick={choosePath}>Select Directory Location</button>
      </div>
      <div>
        <button
          onClick={() => {
            writeFile(filePath + "/" + filename, "").catch((e) =>
              console.error(e)
            );
            setOpen(false);
          }}
          disabled={
            filePath === null ||
            filePath === "" ||
            filename === null ||
            filename === ""
          }
        >
          Create
        </button>
        <button onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}
