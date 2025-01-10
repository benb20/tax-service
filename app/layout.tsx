import QueryClientWrapper from './providers';
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/app-sidebar/app-sidebar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="w-full">
        {/* Wrapping with both QueryClientWrapper and SidebarProvider */}
        <QueryClientWrapper>
          <SidebarProvider>
            <AppSidebar />
            <main className="w-full"> {/* Ensure main content is full width */}
              <SidebarTrigger />
              {children}
            </main>
          </SidebarProvider>
        </QueryClientWrapper>
      </body>
    </html>
  );
}
