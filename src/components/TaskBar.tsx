import { useEffect, useRef, useState } from "react";

export function DropdownElement({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) {
  return <li onClick={(e) => e.stopPropagation()}>{children}</li>;
}

export function Dropdown({
  children,
  label,
}: {
  children: JSX.Element | JSX.Element[];
  label: JSX.Element | string;
}) {
  const drop = useRef(null);
  const options = useRef(null);
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);

  function updateWidth() {
    var dropSize = drop.current
      ? (drop.current as unknown as HTMLUListElement).offsetWidth
      : 0;
    var optionSize = options.current
      ? (options.current as unknown as HTMLUListElement).offsetWidth
      : 0;
    console.log(`drop: ${dropSize}, option: ${optionSize}`);
    var width = Math.max(dropSize, optionSize);

    setWidth(width);
  }

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (drop.current && !(drop.current as any).contains(event.target)) {
        setActive(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [drop]);

  useEffect(
    () => {
      if (!drop.current) {
        // we do not initialize the observer unless the ref has
        // been assigned
        return;
      }

      // we also instantiate the resizeObserver and we pass
      // the event handler to the constructor
      const resizeObserver = new ResizeObserver(() => {
        if (
          drop.current &&
          (drop.current as unknown as HTMLUListElement).offsetWidth !== width
        ) {
          console.log("update from drop");
          setWidth((drop.current as unknown as HTMLUListElement).offsetWidth);
        }
      });

      // the code in useEffect will be executed when the component
      // has mounted, so we are certain drop.current will contain
      // the div we want to observe
      resizeObserver.observe(drop.current);

      // if useEffect returns a function, it is called right before the
      // component unmounts, so it is the right place to stop observing
      // the div
      return function cleanup() {
        resizeObserver.disconnect();
      };
    },
    // only update the effect if the ref element changed
    [drop.current, width]
  );

  return (
    <>
      <div ref={drop} onClick={() => setActive(!active)}>
        {label}
        <ul ref={options} className={(active ? "visible" : "invisible") + " absolute"}>
          {children}
        </ul>
      </div>
    </>
  );
}

export default function TaskBar() {
  return (
    <Dropdown label={"lskdjf"}>
      <DropdownElement>
        <label>Hi</label>
      </DropdownElement>
    </Dropdown>
  );
}
/*
<Button> Edit </Button>
<Button> Simulation </Button>
<Button> Settings </Button>
<Button> Help </Button> 
*/
