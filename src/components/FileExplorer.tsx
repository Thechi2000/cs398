import { useEffect, useState } from "react";
import { listenEvent, useEventBus } from "../main";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

import OpenedFolderIcon from "../assets/opened_folder.svg";
import ClosedFolderIcon from "../assets/closed_folder.svg";
import FileIcon from "../assets/file.svg";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { listen } from "@tauri-apps/api/event";

type Project = {
  name: string;
  project_directory : string;
  included_files : String[];
  excluded_files : String[];
}

type Node = {
  path: string;
  name: string;
  children: Node[];
  isDir: boolean;
};

type EntryProps<N> = { node: N };

export enum FileType {
  VerilogCodeFile,
  TestBenchFile,
  None,
}

type FileTypeProps<FileType> = { fileType: FileType };

function DirectoryEntry({ node }: EntryProps<Node>) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <ContextMenu.Root modal={false}>
      <div>
        <ContextMenu.Trigger>
          <div className="name-display" onClick={(_) => setIsOpen((v) => !v)}>
            {isOpen ? <OpenedFolderIcon /> : <ClosedFolderIcon />}
            <p>{node.name}</p>
          </div>
        </ContextMenu.Trigger>
        {isOpen ? (
          <div className="directory-children">
            {node.children
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <Entry node={c} key={c.path} />
              ))}
          </div>
        ) : (
          <></>
        )}
      </div>

      <ContextMenu.Content>
        <ContextMenu.Item onClick={(_) => setIsOpen((v) => !v)}>
          {isOpen ? "Close" : "Open"}
        </ContextMenu.Item>
        <ContextMenu.Item>Rename</ContextMenu.Item>
        <ContextMenu.Item>Delete</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item>Add file</ContextMenu.Item>
        <ContextMenu.Item>Add folder</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

function FileEntry({ node }: EntryProps<Node>) {
  const events = useEventBus();

  return (
    <ContextMenu.Root modal={false}>
      <ContextMenu.Trigger>
        <div className="name-display">
          {" "}
          <FileIcon />
          <p onClick={(_) => events.emit("editor.file.open", node.path)}>
            {node.name}
          </p>
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Content>
        <ContextMenu.Item
          onClick={(_) => events.emit("editor.file.open", node.path)}
        >
          Open
        </ContextMenu.Item>
        <ContextMenu.Item>Rename</ContextMenu.Item>
        <ContextMenu.Item>Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

function Entry({ node }: EntryProps<Node>) {
  if (node.isDir) {
    return <DirectoryEntry node={node} />;
  } else {
    return <FileEntry node={node} />;
  }
}

export function FileCreator({ fileType }: FileTypeProps<FileType>) {
  const [filePath, setFilePath] = useState("./");

  function fileTypeToDisplay(fileType: FileType) {
    console.log("hi");
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
        setFilePath(project.project_directory);
      },
      (_) => setFilePath("./") 
    );
  }

  async function chooseProjectPath() {
    const selectedFileDirectory = await open({
      directory: true,
      multiple: false,
      defaultPath: filePath,
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
        <input type="text" defaultValue={fileTypeToDisplay(fileType)} />
      </div>
      <div>
        <p>Location</p>
        <input type="text">{filePath}</input>
        <button onClick={chooseProjectPath}>Select Directory Location</button>
      </div>
    </div>
  );
}

export default function FileExplorer() {
  const [data, setData] = useState({ name: "Project" } as Node);

  function loadProjectTree() {
    invoke("read_project_tree")
      .then((v) => {
        const entry = v as Partial<Node>;
        setData({
          path: entry.path || "./",
          name: entry.name || "",
          children: entry.children || [],
          isDir: true,
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }

  useEffect(loadProjectTree, []);
  listen("reload", loadProjectTree);

  return (
    <div id="file-explorer">
      <Entry node={data} />
    </div>
  );
}
