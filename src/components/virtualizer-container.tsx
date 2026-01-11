import {
  createContext,
  type ReactNode,
  type RefObject,
  use,
  useRef,
} from "react";
import { cn } from "@/lib/utils";

type VirtualizerContextValue = {
  parentRef: RefObject<HTMLDivElement | null>;
};

const VirtualizerContext = createContext<VirtualizerContextValue | null>(null);

export const VirtualizerContainer = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const parentRef = useRef<HTMLDivElement | null>(null);

  return (
    <VirtualizerContext.Provider value={{ parentRef: parentRef }}>
      <div
        ref={parentRef}
        className={cn("h-screen w-full overflow-auto", className)}
      >
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
