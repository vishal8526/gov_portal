import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GovSchool Portal — Government School Admission & Scholarship System",
  description:
    "Apply for school admissions and scholarships at government schools. Staff can review applications, manage seats, and track approvals.",
  keywords: "government school, admission, scholarship, education, India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
