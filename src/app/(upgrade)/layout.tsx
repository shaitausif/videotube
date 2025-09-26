// app/(main)/layout.tsx
import Navbar from "../../../components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../../../components/App-Sidebar";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider className="" defaultOpen={false}>
      <AppSidebar />
      
      <header>
        <nav>
          <Navbar />
        </nav>
      </header>
      <AuroraBackground className="overflow-hidden">
      <main className="flex pt-12 w-full">
        
        {children}
        
      </main>
      </AuroraBackground>

    </SidebarProvider>
    
    </>
  );
}