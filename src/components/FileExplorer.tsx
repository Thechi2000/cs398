import FolderTree, { testData } from "react-folder-tree";
import "react-folder-tree/dist/style.css";

export default function FileExplorer() {
  return <FolderTree data={testData} showCheckbox={false} />;
}
