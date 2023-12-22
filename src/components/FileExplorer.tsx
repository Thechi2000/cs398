import { useEffect, useState } from "react";
import { useEventBus } from "../main";
import { invoke } from "@tauri-apps/api/tauri";
import OpenedFolderIcon from "../assets/opened_folder.svg";
import ClosedFolderIcon from "../assets/closed_folder.svg";
import FileIcon from "../assets/file.svg";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { listen } from "@tauri-apps/api/event";
import { watchImmediate } from "tauri-plugin-fs-watch-api";
import {
  createDir,
  removeDir,
  removeFile,
  renameFile,
  writeFile,
} from "@tauri-apps/api/fs";

type Node = {
  path: string;
  name: string;
  children: Node[];
  isDir: boolean;
};

function DirectoryEntry({ node }: { node: Node }) {
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

        <ContextMenu.Item onClick={() => removeDir(node.path)}>
          Delete
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item
          onClick={() => writeFile(node.path + "/New File.v", "")}
        >
          Add file
        </ContextMenu.Item>
        <ContextMenu.Item onClick={() => createDir(node.path + "/New Dir")}>
          Add folder
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

function FileEntry({ node: initialNode }: { node: Node }) {
  const events = useEventBus();
  const [node, setNode] = useState(initialNode);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);

  return (
    <ContextMenu.Root modal={false}>
      <ContextMenu.Trigger>
        <div className="name-display">
          {" "}
          <FileIcon />
          {renaming ? (
            <input
              autoFocus
              onBlur={() => setRenaming(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  let newPath =
                    node.path.slice(0, node.path.length - node.name.length) +
                    newName;
                  renameFile(node.path, newPath);
                  setRenaming(false);
                  setNode((v) => ({ ...v, path: newPath, name: newName }));
                }
              }}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          ) : (
            <p onClick={(_) => events.emit("editor.file.open", node.path)}>
              {node.name}
            </p>
          )}
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Content>
        <ContextMenu.Item
          onClick={(_) => events.emit("editor.file.open", node.path)}
        >
          Open
        </ContextMenu.Item>
        <ContextMenu.Item
          onClick={() => {
            setRenaming(true);
          }}
        >
          Rename
        </ContextMenu.Item>
        <ContextMenu.Item onClick={() => removeFile(node.path)}>
          Delete
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

function Entry({ node }: { node: Node }) {
  if (node.isDir) {
    return <DirectoryEntry node={node} />;
  } else {
    return <FileEntry node={node} />;
  }
}

export default function FileExplorer() {
  const [data, setData] = useState({ name: "Project" } as Node);

  useEffect(() => {
    if (data.path === undefined) {
      return;
    }
    console.info("binding watcher to " + data.path);

    let u = watchImmediate(
      data.path,
      (e) => {
        if (
          (e.type as any)["create"] !== undefined ||
          (e.type as any)["remove"] !== undefined
        ) {
          loadProjectTree();
        }
      },
      { recursive: true }
    ).catch((e) => {
      console.error(e);
      return () => null;
    });

    return () => {
      u.then((u) => u());
    };
  }, [data]);

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
