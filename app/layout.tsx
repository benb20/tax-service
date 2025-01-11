import QueryClientWrapper from './providers';
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/app-sidebar/app-sidebar';
import { ThemeProvider } from "@/components/theme-provider"; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="w-full">
        <ThemeProvider attribute="class" defaultTheme="light"> 
          <QueryClientWrapper>
            <SidebarProvider>
              <AppSidebar />
              <main className="w-full"> 
                <SidebarTrigger />
                {children}
              </main>
            </SidebarProvider>
          </QueryClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
