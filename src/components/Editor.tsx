import * as Monaco from "@monaco-editor/react";
import { useEffect, useState } from "react";

export function Editor() {
  const monaco = Monaco.useMonaco();
  const [currentFile, setCurrentFile] = useState("test1");
  const [models, setModels] = useState({} as { [path: string]: any });

  useEffect(() => {
    if (monaco) {
      console.log("here is the monaco instance:", monaco);
      setModels({
        test1: monaco.editor.createModel("test1", "verilog"),
        test2: monaco.editor.createModel("test2", "verilog"),
        test3: monaco.editor.createModel("test3", "verilog"),
      });
    }
  }, [monaco]);

  useEffect(() => {
    if (monaco) {
      monaco.editor.getEditors()[0].setModel(models[currentFile]);
    }
  }, [currentFile, models]);

  return (
    <div className="w-full h-full">
      <div className="flex">
        {Object.keys(models).map((path) => (
          <div className={`cursor-pointer px-2 ${currentFile === path ? "bg-white" : "bg-gray-200"}`} key={path} onClick={() => setCurrentFile(path)}>
            {path}
          </div>
        ))}
      </div>
      <Monaco.Editor defaultLanguage="verilog" />
    </div>
  );
}
