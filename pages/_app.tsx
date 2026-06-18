import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Head from "next/head";

import { TeamProvider } from "@/context/team-context";
import { UploadProgressProvider } from "@/context/upload-progress-context";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/pages";

import { EXCLUDED_PATHS } from "@/lib/constants";

import { PostHogGroupSync } from "@/components/providers/posthog-group-sync";
import { PostHogCustomProvider } from "@/components/providers/posthog-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function App({
  Component,
  pageProps: { session, ...pageProps },
  router,
}: AppProps<{ session: Session }>) {
  return (
    <>
      <Head>
        <title>DeepCity</title>
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="DeepCity"
          key="description"
        />
        <meta
          property="og:title"
          content="DeepCity"
          key="og-title"
        />
        <meta
          property="og:description"
          content="DeepCity"
          key="og-description"
        />
        <meta
          property="og:image"
          content="https://deepcity.ai/og-image.png"
          key="og-image"
        />
        <meta
          property="og:url"
          content="https://deepcity.ai"
          key="og-url"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@deepcity" />
        <meta name="twitter:creator" content="@deepcity" />
        <meta name="twitter:title" content="DeepCity" key="tw-title" />
        <meta
          name="twitter:description"
          content="DeepCity"
          key="tw-description"
        />
        <meta
          name="twitter:image"
          content="https://deepcity.ai/og-image.png"
          key="tw-image"
        />
        <link rel="icon" href="/favicon.ico" key="favicon" />
      </Head>
      <SessionProvider session={session}>
        <PostHogCustomProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <NuqsAdapter>
              <main className={inter.className}>
                <Toaster closeButton />
                <TooltipProvider delayDuration={100}>
                  {EXCLUDED_PATHS.includes(router.pathname) ? (
                    <Component {...pageProps} />
                  ) : (
                    <TeamProvider>
                      <PostHogGroupSync />
                      <UploadProgressProvider>
                        <Component {...pageProps} />
                      </UploadProgressProvider>
                    </TeamProvider>
                  )}
                </TooltipProvider>
              </main>
            </NuqsAdapter>
          </ThemeProvider>
        </PostHogCustomProvider>
      </SessionProvider>
    </>
  );
}
