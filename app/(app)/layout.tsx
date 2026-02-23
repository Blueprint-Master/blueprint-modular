import { ChunkErrorBoundary } from "@/components/ChunkErrorBoundary";
import { AppLayoutClient } from "@/components/AppLayoutClient";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChunkErrorBoundary>
      <AppLayoutClient>{children}</AppLayoutClient>
    </ChunkErrorBoundary>
  );
}
