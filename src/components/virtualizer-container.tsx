import {
  createContext,
  type ReactNode,
  type RefObject,
  use,
  useRef,
} from "react";

type VirtualizerContextValue = {
  parentRef: RefObject<HTMLDivElement | null>;
};

const VirtualizerContext = createContext<VirtualizerContextValue | null>(null);

export const VirtualizerContainer = ({ children }: { children: ReactNode }) => {
  const parentRef = useRef<HTMLDivElement | null>(null);

  return (
    <VirtualizerContext.Provider value={{ parentRef: parentRef }}>
      <div ref={parentRef} className="h-screen w-full overflow-auto">
        {children}
      </div>
    </VirtualizerContext.Provider>
  );
};

export const useVirtualizerContext = () => {
  const ctx = use(VirtualizerContext);
  if (!ctx) {
    throw new Error(
      "useVirtualizerContext must be used within a VirtualizerContainer",
    );
  }
  return ctx;
};
