import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";

// Base URL for links without a custom domain (served at /view/{linkId}).
const BASE_URL =
  process.env.NEXTAUTH_URL ?? "https://papermark-deepcity.vercel.app";

// GET /api/keep-warm/links?secret=...
// Returns the public URLs of all active (non-archived, non-expired) links so a
// scheduled job (e.g. a Cloudflare Worker) can keep their ISR pages warm.
// Protected by a shared secret so link URLs are never exposed publicly.
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const secret = req.query.secret as string | undefined;
  if (!process.env.KEEPWARM_TOKEN || secret !== process.env.KEEPWARM_TOKEN) {
    return res.status(401).end("Unauthorized");
  }

  try {
    const now = new Date();
    const links = await prisma.link.findMany({
      where: {
        isArchived: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { id: true, slug: true, domainSlug: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    });

    const urls = links.map((link) =>
      link.domainSlug && link.slug
        ? `https://${link.domainSlug}/${link.slug}`
        : `${BASE_URL}/view/${link.id}`,
    );

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ count: urls.length, urls });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}
