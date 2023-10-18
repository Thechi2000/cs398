import { Dropdown } from "./Dropdown";

export function MenuElement({
  children,
}: {
  children: string | JSX.Element | JSX.Element[];
}) {
  return <div className="bg-white px-3">{children}</div>;
}

export default function TaskBar({
  setCentralComponent,
}: {
  setCentralComponent: React.Dispatch<React.SetStateAction<JSX.Element>>;
}) {
  return (
    <div className="flex p-2 gap-4 bg-slate-400 select-none h-[4%] items-center">
      <Dropdown label={"File"}>
        <MenuElement>New Project</MenuElement>
        <MenuElement>New Verilog File</MenuElement>
        <MenuElement>New Testbench</MenuElement>
        <hr className="bg-gray-100 h-2" />
        <MenuElement>Open Project</MenuElement>
        <MenuElement>Open File</MenuElement>
        <hr className="bg-gray-100 h-2" />
        <MenuElement>Save</MenuElement>
        <MenuElement>Save As ...</MenuElement>
        <hr className="bg-gray-100 h-2" />
        <MenuElement>Close Window</MenuElement>
      </Dropdown>

      <Dropdown label={"Edit"}>
        <MenuElement>Test</MenuElement>
        <MenuElement>Test</MenuElement>
        <MenuElement>Test</MenuElement>
        <hr className="bg-gray-100 h-2" />
        <MenuElement>Test</MenuElement>
      </Dropdown>

      <Dropdown label={"Simulation"}>
        <MenuElement>Test</MenuElement>
        <MenuElement>Test</MenuElement>
        <MenuElement>Test</MenuElement>
        <hr className="bg-gray-100 h-2" />
        <MenuElement>Test</MenuElement>
      </Dropdown>

      <Dropdown label={"Settings"}>
        <MenuElement>Test</MenuElement>
        <MenuElement>Test</MenuElement>
        <MenuElement>Test</MenuElement>
        <hr className="bg-gray-100 h-2" />
        <MenuElement>Test</MenuElement>
      </Dropdown>

      <Dropdown label={"Help"}>
        <MenuElement>Test</MenuElement>
        <MenuElement>Test</MenuElement>
        <MenuElement>Test</MenuElement>
        <hr className="bg-gray-100 h-2" />
        <MenuElement>Test</MenuElement>
      </Dropdown>
    </div>
  );
}
