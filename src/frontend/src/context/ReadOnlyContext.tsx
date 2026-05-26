import { createContext, useContext } from "react";

const ReadOnlyContext = createContext<boolean>(false);

export function ReadOnlyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReadOnlyContext.Provider value={true}>{children}</ReadOnlyContext.Provider>
  );
}

export function useReadOnly(): boolean {
  return useContext(ReadOnlyContext);
}
