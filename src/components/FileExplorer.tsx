import FolderTree, { testData } from "react-folder-tree";
import "react-folder-tree/dist/style.css";

const BasicTree = () => {
  const onTreeStateChange = (state: any, event: any) =>
    console.log(state, event);

  return (
    <FolderTree
      data={testData}
      onChange={onTreeStateChange}
      showCheckbox={false}
    />
  );
};

export default function FileExplorer() {
  return <BasicTree />;
}
