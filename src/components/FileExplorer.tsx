import { fs } from "@tauri-apps/api";
import { BaseDirectory, FileEntry } from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";
import FolderTree, { NodeData } from "react-folder-tree";
import "react-folder-tree/dist/style.css";
import { useEventBus } from "../main";

export default function FileExplorer() {
  const events = useEventBus();
  const [data, setData] = useState({ name: "Project" } as NodeData);

  useEffect(() => {
    function mapFileEntryToNodeData(entry: FileEntry): NodeData {
      return {
        completePath: entry.path,
        name: entry.name || "",
        children: entry.children
          ? entry.children.map(mapFileEntryToNodeData) || undefined
          : undefined,
      };
    }

    fs.readDir("palusim-project", {
      dir: BaseDirectory.Home,
      recursive: true,
    })
      .then((v) => {
        console.log("hi");
        console.log(v);
        setData({ name: "Project", children: v.map(mapFileEntryToNodeData) });
      })
      .catch((e) => {
        console.error("Could not read home");
        console.error(e);
      });
  }, []);

  return (
    <div className="overflow">
      <FolderTree
        onNameClick={(n) =>
          events.emit("editor.file.open", n.nodeData.completePath)
        }
        data={data}
        showCheckbox={false}
      />
    </div>
  );
}
