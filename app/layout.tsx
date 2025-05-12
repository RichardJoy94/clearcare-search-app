import './globals.css';

export const metadata = {
  title: "ClearCareHQ - Transparent Healthcare Pricing",
  description: "Search and compare transparent healthcare costs across providers. Empower your healthcare decisions with ClearCareHQ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>ClearCareHQ - Transparent Healthcare Pricing</title>
        <meta name="description" content="Search and compare transparent healthcare costs across providers. Empower your healthcare decisions with ClearCareHQ." />
        <meta property="og:title" content="ClearCareHQ - Transparent Healthcare Pricing" />
        <meta property="og:description" content="Search and compare transparent healthcare costs across providers. Empower your healthcare decisions with ClearCareHQ." />
        <meta property="og:image" content="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
