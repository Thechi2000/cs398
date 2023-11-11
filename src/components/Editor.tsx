import * as Monaco from "@monaco-editor/react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { listenEvent, useEventBus } from "../main";
import { fs } from "@tauri-apps/api";

function FileTab(props: { path: string; selected: boolean }) {
  const events = useEventBus();
  const match = props.path.match(/.*\/([^/]+)$/);
  const name = match ? match[1] : "";

  return (
    <div
      className={`cursor-pointer px-2 text-lg flex items-center gap-2 ${
        props.selected ? "bg-white" : "bg-gray-200"
      }`}
      key={props.path}
      onClick={() => events.emit("editor.tab.select", props.path)}
    >
      <Cross2Icon
        className="hover:scale-125"
        onClick={(e) => {
          e.stopPropagation();
          events.emit("editor.tab.close", props.path);
        }}
      />
      <p>{name}</p>
    </div>
  );
}

export function Editor() {
  const monaco = Monaco.useMonaco();
  const [currentFile, setCurrentFile] = useState("");
  const [models, setModels] = useState({} as { [path: string]: any });

  useEffect(() => {
    if (monaco) {
        monaco.editor.getEditors()[0].setModel(models[currentFile]);
    }
  }, [currentFile, models]);

  listenEvent("editor.tab.select", setCurrentFile);
  listenEvent("editor.tab.close", closeFile, [models, currentFile]);
  listenEvent(
    "editor.file.open",
    (path) => {
      if (monaco) {
        fs.readTextFile(path).then((value) => {
          setModels((models) => ({
            ...models,
            [path]: monaco.editor.createModel(value, "verilog"),
          }));
          setCurrentFile(path);
        });
      }
    },
    [monaco]
  );

  function closeFile(name: string) {
    let newModels = { ...models };
    delete newModels[name];
    console.log("soeht");
    console.log(name + "; " + currentFile);

    // If the current file is the one to be closed, we set the previous one (if none, the next) as the current.
    if (name === currentFile) {
      let newIndex = Object.keys(models).indexOf(name) - 1;
      if (newIndex < 0) newIndex = 0;
      console.log(newIndex);
      setCurrentFile(Object.keys(newModels)[newIndex]);
    }

    setModels(newModels);
  }

  return (
    <div className="w-full h-full flex flex-col overflow-clip">
      <div className="flex select-none">
        {Object.keys(models).map((path) => (
          <FileTab key={path} path={path} selected={path === currentFile} />
        ))}
      </div>
      <Monaco.Editor className="grow" defaultLanguage="verilog" />
    </div>
  );
}
