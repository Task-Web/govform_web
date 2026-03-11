import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Government Personal Information Form",
  description: "Official government form portal for personal information submission",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="gov-header">
          <h1>Department of Citizen Services</h1>
          <p>Personal Information Registration Portal &mdash; Form DCS-2024-PI</p>
        </div>
        {children}
        <div className="gov-footer">
          Department of Citizen Services &copy; 2024. All Rights Reserved.<br />
          This is an official government website. Unauthorized access is prohibited.<br />
          For technical support contact: support@govform.example.gov
        </div>
      </body>
    </html>
  );
}
