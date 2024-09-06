import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Auto Creatives - AI Ad Generation",
  description: "Generate stunning ad creatives in minutes using AI",
  other: {
    "google-site-verification": "myRdNSAEsyBW72c8bx3rYyQm5YH-AHXW_32Qga99CmY",
  },
};

import RootLayoutClient from './RootLayoutClient'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootLayoutClient>{children}</RootLayoutClient>
}
