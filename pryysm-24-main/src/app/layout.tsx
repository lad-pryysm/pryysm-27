
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { WorkspaceProvider } from '@/hooks/use-workspace';

export const metadata: Metadata = {
  title: 'Pryysm by 3D Prodigy',
  description: '3D Printing Farm Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
          <AuthProvider>
            <WorkspaceProvider>
              {children}
              <Toaster />
            </WorkspaceProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
