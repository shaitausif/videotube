// layout.tsx
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuroraBackground>{children}</AuroraBackground>
    </>
  );
}   
