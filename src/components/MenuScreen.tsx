import FileExplorer from "./FileExplorer";

export default function MenuScreen() {
  return (
    <div className="flex flex-col bg-blue-100 w-full h-[96%]">
      <div className="flex h-2/3">
        <div className="bg-amber-200 w-[20%] h-full pl-2 overflow-x-scroll overflow-y-hidden">
          <FileExplorer />
        </div>
        <div className="bg-amber-400 w-[80%] h-full"></div>
      </div>
      <div className="bg-amber-600 h-1/3"></div>
    </div>
  );
}
