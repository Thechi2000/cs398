import { Dropdown } from "./Dropdown";

export function MenuElement({children}: {children: string | JSX.Element | JSX.Element[]}) {
  return <div className="bg-amber-200 border pl-4 pr-2">{children}</div>
}

export default function TaskBar() {
  return (
      <Dropdown label={"File"}>
        <MenuElement>New Project</MenuElement>
        <MenuElement>New Verilog File</MenuElement>
        <MenuElement>New Testbench</MenuElement>
        <hr className="bg-red-500 h-1 mb-1" />
        <MenuElement>Open Project</MenuElement>
        <MenuElement>Open File</MenuElement>
        <hr className="bg-red-500 h-1 mb-1" />
        <MenuElement>Save</MenuElement>
        <MenuElement>Save As ...</MenuElement>
        <hr className="bg-red-500 h-1 mb-1" />
        <MenuElement>Close Window</MenuElement>
      </Dropdown>
  );
}
/*
<Button> Edit </Button>
<Button> Simulation </Button>
<Button> Settings </Button>
<Button> Help </Button> 
*/
