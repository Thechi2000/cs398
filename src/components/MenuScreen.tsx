import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Editor } from "./Editor";
import FileExplorer from "./FileExplorer";
import Output from "./Output";

export default function MenuScreen() {
  return (
    <div id="app">
      <PanelGroup direction="vertical">
        <Panel>
          <PanelGroup direction="horizontal">
            <Panel defaultSizePercentage={25}>
              <FileExplorer />
            </Panel>
            <PanelResizeHandle />
            <Panel>
              <Editor />
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSizePercentage={30}>
          <Output />
        </Panel>
      </PanelGroup>
    </div>
  );
}
