import { createContext } from "vm";

type Status = "info";
type ContextType = {
  notify: (message: string, status: Status) => void;
};

export const NotificationContext = createContext({} as ContextType);

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  function notify(message: string, status: Status) {
    console.log(message);
  }

  return (
    <NotificationContext.Provider
      value={{
        notify,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
