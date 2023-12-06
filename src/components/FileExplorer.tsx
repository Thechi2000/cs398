import { FileEntry } from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";
import FolderTree, { NodeData } from "react-folder-tree";
import "react-folder-tree/dist/style.css";
import { useEventBus } from "../main";
import { invoke } from "@tauri-apps/api/tauri";
import "../styles/FileExplorer.scss"

export default function FileExplorer() {
  const events = useEventBus();
  const [data, setData] = useState({ name: "Project" } as NodeData);

  useEffect(() => {
    function mapFileEntryToNodeData(entry: FileEntry): NodeData {
      return {
        absolutePath: entry.path,
        name: entry.name || "",
        children: entry.children
          ? entry.children.map(mapFileEntryToNodeData) || undefined
          : undefined,
      };
    }

    invoke("read_project_tree")
      .then((v) => {
        const entry = v as FileEntry;
        console.log(v);
        setData({
          name: entry.name || "",
          children: (entry.children || []).map(mapFileEntryToNodeData),
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  return (
    <div className="overflow select-none">
      <FolderTree
        onNameClick={(n) => {
          console.error(n.nodeData);
          events.emit("editor.file.open", n.nodeData.absolutePath);
        }}
        data={data}
        showCheckbox={false}
      />
    </div>
  );
}
