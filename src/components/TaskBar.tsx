import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEventBus } from "../main";

export default function TaskBar() {
  const events = useEventBus();

  return (
    <div id="taskbar">
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
          <p>File</p>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="DropdownContent">
            <DropdownMenu.Item onClick={() => events.emit("dialog.project.open")}>Open/Create Project</DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => events.emit("dialog.create-file.verilog")}>New Verilog File</DropdownMenu.Item>
            <DropdownMenu.Item>New Testbench</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Open File</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Save As ...</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Close Window</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <DropdownMenu.Root modal={false}>
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

      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
          <p>Simulation</p>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="DropdownContent">
            <DropdownMenu.Item onClick={() => events.emit("project.build")}>
              Build
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => events.emit("project.run")}>
              Run
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onClick={() => {
              events.emit("project.build");
              events.emit("project.run");
            }}>
              Build and Run
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
