import { useState } from "react";
import FolderTree, { testData } from "react-folder-tree";
import "react-folder-tree/dist/style.css";

const BasicTree = () => {
  const [treeState, setTreeState] = useState(testData);
  const onTreeStateChange = (state: any, event: any) => {
    if (event.type !== "initialization") {
      console.log(state);
    }
  };

  const onDownload = () => console.log(treeState);

  return (
    <FolderTree
      data={treeState}
      onChange={onTreeStateChange}
      showCheckbox={false}
    />
  );
};

function readWorkingFileTree(projectLocation : string) {
    function readDirectory(directoryLocation : string) {

    }
    
    var currentPath = projectLocation;
    var workingTree = {};

    // regarder index.d.ts, genre le type de testData

}

export default function FileExplorer() {
  return <BasicTree />;
}
