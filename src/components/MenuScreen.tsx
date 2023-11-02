import { Editor } from "./Editor";
import FileExplorer from "./FileExplorer";
import Waves from "./Waves";

export default function MenuScreen() {
  return (
    <div className="flex flex-col bg-blue-100 w-full h-[96%]">
      <div className="flex h-2/3">
        <div className="bg-amber-200 w-[20%] h-full pl-2 overflow-scroll overflow-y-hidden">
          <FileExplorer />
        </div>
        <div className="bg-amber-400 w-[80%] h-full">
          <Editor />
        </div>
      </div>
      <div className="bg-amber-600 h-1/3">
        <Waves
          vcd={{
            variables: {
              name: null,
              ty: null,
              variables: [],
              scopes: [
                {
                  name: "top",
                  ty: "module",
                  variables: [
                    {
                      ty: "wire",
                      size: 32,
                      identifier: "!",
                      reference: "data",
                    },
                    { ty: "wire", size: 1, identifier: "@", reference: "en" },
                    { ty: "wire", size: 1, identifier: "#", reference: "rx" },
                    { ty: "wire", size: 1, identifier: "$", reference: "tx" },
                    { ty: "wire", size: 1, identifier: "%", reference: "err" },
                    {
                      ty: "wire",
                      size: 1,
                      identifier: "^",
                      reference: "ready",
                    },
                  ],
                  scopes: [],
                },
              ],
            },
            timescale: [1, "ns"],
            version: "Example Simulator V0.1",
            date: "Sept 10 2008 12:00:05",
            timeline: {
              "#": { "16": "r1", "0": "r11.12", "11": "r17.10" },
              "!": {
                "0": "b101010101010110101010101010101101010101010110101010101010101",
                "11": "b011101100010",
                "16": "b101010101010110101010101010101",
              },
              "@": {
                "5": "1",
                "1": "1",
                "3": "1",
                "2": "0",
                "0": "x",
                "4": "z",
              },
              $: { "0": "0" },
              "%": { "0": "1", "20": "0" },
              "^": { "0": "0" },
            },
          }}
        />
      </div>
    </div>
  );
}
