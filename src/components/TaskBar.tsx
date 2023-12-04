import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { invoke } from "@tauri-apps/api/tauri";
import { useEventBus } from "../main";

export default function TaskBar() {
  const events = useEventBus();

  return (
    <div id="taskbar">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <p>File</p>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="DropdownContent">
            <DropdownMenu.Item>New Project</DropdownMenu.Item>
            <DropdownMenu.Item>New Verilog File</DropdownMenu.Item>
            <DropdownMenu.Item>New Testbench</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Open Project</DropdownMenu.Item>
            <DropdownMenu.Item>Open File</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Save As ...</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Close Window</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <p>Edit</p>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="DropdownContent">
            <DropdownMenu.Item>Undo</DropdownMenu.Item>
            <DropdownMenu.Item>Redo</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Cut</DropdownMenu.Item>
            <DropdownMenu.Item>Copy</DropdownMenu.Item>
            <DropdownMenu.Item>Paste</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Find</DropdownMenu.Item>
            <DropdownMenu.Item>Replace</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <p>Simulation</p>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="DropdownContent">
            <DropdownMenu.Item
              onClick={() => {
                invoke("compile")
                  .then((v) => events.emit("output.compilation", v))
                  .catch((e) => console.error(e));
              }}
            >
              Build
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => {
                invoke("simulate")
                  .then((v) => events.emit("output.simulation", v))
                  .catch((e) => console.error(e));
              }}
            >
              Run
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => {
                invoke("compile")
                  .then((v: any) => {
                    if (v.status === "success") {
                      invoke("simulate").then((v) =>
                        events.emit("output.simulation", v)
                      );
                    } else {
                      events.emit("output.compilation", v);
                    }
                  })
                  .catch((e) => console.error(e));
              }}
            >
              Build & Run
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
