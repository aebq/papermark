import { NextRequest, userAgent } from "next/server";

import { geolocation, ipAddress, waitUntil } from "@vercel/functions";

import { recordLinkViewTB } from "@/lib/tinybird";
import { isBot } from "@/lib/utils/user-agent";

import sendNotification from "../api/notification-helper";
import { sendLinkViewWebhook } from "../api/views/send-webhook-event";
import { EU_COUNTRY_CODES } from "../constants";
import { capitalize, getDomainWithoutWWW } from "../utils";
import { LOCALHOST_GEO_DATA, LOCALHOST_IP } from "../utils/geo";

export async function recordLinkView({
  req,
  clickId,
  viewId,
  linkId,
  teamId,
  documentId,
  dataroomId,
  enableNotification,
  isPaused,
}: {
  req: NextRequest;
  clickId: string;
  viewId: string;
  linkId: string;
  teamId: string;
  documentId?: string;
  dataroomId?: string;
  enableNotification: boolean | null;
  isPaused: boolean;
}) {
  const ua = userAgent(req);
  const bot = isBot(ua.ua);

  // don't track clicks from bots
  if (bot) {
    return null;
  }

  const ip = process.env.VERCEL === "1" ? ipAddress(req) : LOCALHOST_IP;

  // get continent, region & geolocation data
  // interesting, geolocation().region is Vercel's edge region – NOT the actual region
  // so we use the x-vercel-ip-country-region or geolocation().countryRegion to get the actual region
  const { continent, region } =
    process.env.VERCEL === "1"
      ? {
          continent: req.headers.get("x-vercel-ip-continent"),
          region: geolocation(req).countryRegion,
        }
      : LOCALHOST_GEO_DATA;

  const geo =
    process.env.VERCEL === "1" ? geolocation(req) : LOCALHOST_GEO_DATA;

  const isEuCountry = geo.country && EU_COUNTRY_CODES.includes(geo.country);

  const referer = req.headers.get("referer");
  const refererDomain = referer ? getDomainWithoutWWW(referer) : "(direct)";

  const clickData = {
    timestamp: new Date(Date.now()).toISOString(),
    click_id: clickId,
    view_id: viewId,
    link_id: linkId,
    document_id: documentId || null,
    dataroom_id: dataroomId || null,
    continent: continent || "",
    country: geo.country || "Unknown",
    region: region || "Unknown",
    city: geo.city || "Unknown",
    latitude: geo.latitude || "Unknown",
    longitude: geo.longitude || "Unknown",
    device: ua.device.type ? capitalize(ua.device.type) : "Desktop",
    device_vendor: ua.device.vendor || "Unknown",
    device_model: ua.device.model || "Unknown",
    browser: ua.browser.name || "Unknown",
    browser_version: ua.browser.version || "Unknown",
    engine: ua.engine.name || "Unknown",
    engine_version: ua.engine.version || "Unknown",
    os: ua.os.name || "Unknown",
    os_version: ua.os.version || "Unknown",
    cpu_architecture: ua.cpu?.architecture || "Unknown",
    ua: ua.ua || "Unknown",
    bot: ua.isBot,
    referer: refererDomain,
    referer_url: referer || "(direct)",
    ip_address:
      // only record IP if it's a valid IP and not from a EU country
      typeof ip === "string" && ip.trim().length > 0 && !isEuCountry
        ? ip
        : null,
  };

  const locationData = {
    continent,
    country: geo.country || "Unknown",
    region: region || "Unknown",
    city: geo.city || "Unknown",
  };

  // Rich, ready-to-display details for the owner notification email.
  const countryName = (() => {
    try {
      return geo.country
        ? (new Intl.DisplayNames(["en"], { type: "region" }).of(geo.country) ??
            geo.country)
        : null;
    } catch {
      return geo.country || null;
    }
  })();
  const notificationDetails = {
    location:
      [
        geo.city && geo.city !== "Unknown" ? geo.city : null,
        region && region !== "Unknown" ? region : null,
        countryName,
      ]
        .filter(Boolean)
        .join(", ") || null,
    time:
      new Date()
        .toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC",
        })
        .replace(/,([^,]*)$/, " at$1") + " UTC",
    browser:
      (
        [
          clickData.browser !== "Unknown" ? clickData.browser : null,
          clickData.browser_version !== "Unknown"
            ? clickData.browser_version
            : null,
        ]
          .filter(Boolean)
          .join(" ") +
        (clickData.os !== "Unknown"
          ? ` on ${clickData.os}${
              clickData.os_version !== "Unknown"
                ? " " + clickData.os_version
                : ""
            }`
          : "")
      ).trim() || null,
    device:
      [
        clickData.device_vendor !== "Unknown" ? clickData.device_vendor : null,
        clickData.device_model !== "Unknown"
          ? clickData.device_model
          : clickData.device,
      ]
        .filter(Boolean)
        .join(" ") || clickData.device,
    // Raw IP, included per explicit request. NOTE: the analytics pipeline
    // intentionally omits EU IPs for GDPR; this includes it in the private
    // owner notification only.
    ip: typeof ip === "string" && ip.trim().length > 0 ? ip : null,
  };

  // Fire-and-forget: run analytics, notifications and webhooks in the
  // background so the view response returns immediately. The viewId is already
  // created above, so nothing the caller needs depends on these completing.
  waitUntil(
    Promise.all([
      // record link view in Tinybird
      recordLinkViewTB(clickData),

      // send email notification
      enableNotification
        ? sendNotification({ viewId, locationData, notificationDetails })
        : null,

      // send webhook event
      !isPaused
        ? sendLinkViewWebhook({
            teamId,
            clickData,
          })
        : null,
    ]).catch(() => {}),
  );

  return clickData;
}
