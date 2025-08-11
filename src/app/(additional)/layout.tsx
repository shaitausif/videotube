// app/(main)/layout.tsx
import Navbar from "../../../components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../../../components/App-Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <header>
        <nav>
          <Navbar />
        </nav>
      </header>
      <main className="pt-20 flex w-full">
        {children}
      </main>
    </SidebarProvider>
  );
}