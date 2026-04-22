import "./globals.css";

export const metadata = {
  title: "Modern Keeper App",
  description: "My project migration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}