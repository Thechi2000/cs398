import { Editor } from "./Editor";
import FileExplorer from "./FileExplorer";
import Output from "./Output";

export default function MenuScreen() {
  return (
    <div id="app">
      <div className="flex h-2/3">
        <div className="bg-amber-200 w-[20%] h-full overflow-scroll overflow-y-hidden">
          <FileExplorer />
        </div>
        <div className="bg-amber-400 w-[80%] h-full">
          <Editor />
        </div>
      </div>
      <div className="bg-amber-600 h-1/3">
        <Output />
      </div>
    </div>
  );
}
