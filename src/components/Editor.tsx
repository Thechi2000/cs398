import * as Monaco from "@monaco-editor/react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { listenEvent, useEventBus } from "../main";
import { fs } from "@tauri-apps/api";
import { watchImmediate } from "tauri-plugin-fs-watch-api";
import { readTextFile } from "@tauri-apps/api/fs";

function FileTab(props: { path: string; selected: boolean }) {
  const events = useEventBus();
  const match = props.path.match(/.*\/([^/]+)$/);
  const name = match ? match[1] : "";

  return (
    <div
      className={`tab ${props.selected ? "selected" : ""}`}
      key={props.path}
      onClick={() => events.emit("editor.tab.select", props.path)}
    >
      <Cross2Icon
        className="scalable-icon"
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
      monaco.editor
        .getEditors()[0]
        .setModel(currentFile in models ? models[currentFile] : null);
    }
  }, [currentFile, models, monaco]);

  useEffect(() => {
    let u = watchImmediate(
      Object.keys(models),
      (e) => {
        if (
          (e.type as any)["modify"] !== undefined &&
          (e.type as any)["modify"]["kind"] === "data"
        ) {
          e.paths.forEach((path) => {
            if (path in models) {
              readTextFile(path).then((v) => {
                if (models[path].getValue() != v) models[path].setValue(v);
              });
            }
          });
        }
      },
      { recursive: true }
    );

    return () => {
      u.then((u) => u());
    };
  }, [models]);

  listenEvent("editor.tab.select", setCurrentFile);
  listenEvent("editor.tab.close", closeFile, [models, currentFile]);
  listenEvent(
    "editor.file.open",
    (path) => {
      if (monaco) {
        if (!(path in models)) {
          fs.readTextFile(path).then((value) => {
            setModels((models) => ({
              ...models,
              [path]: monaco.editor.createModel(value, "verilog"),
            }));
            setCurrentFile(path);
          });
        } else {
          setCurrentFile(path);
        }
      }
    },
    [monaco]
  );

  function closeFile(name: string) {
    let newModels = { ...models };
    delete newModels[name];

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
    <div id="editor">
      <div>
        {Object.keys(models).map((path) => (
          <FileTab key={path} path={path} selected={path === currentFile} />
        ))}
      </div>
      <div>
        <Monaco.Editor
          onChange={(v) => fs.writeTextFile(currentFile, v || "")}
          defaultLanguage="verilog"
        />
      </div>
    </div>
  );
}
