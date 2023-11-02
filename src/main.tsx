import React, { useContext, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { EventEmitter } from "@tauri-apps/api/shell";

const EventBusContext = React.createContext(new EventEmitter());
export const useEventBus = () => useContext(EventBusContext);
export const listenEvent = (
  name: string,
  handler: (...args: any[]) => void,
  dependencies?: any[]
) => {
  const events = useEventBus();
  useEffect(() => {
    events.on(name, handler);
    return () => {
      events.off(name, handler);
    };
  }, dependencies || []);
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <EventBusContext.Provider value={new EventEmitter()}>
      <App />
    </EventBusContext.Provider>
  </React.StrictMode>
);
