import { defineMiddleware } from "astro:middleware";
import { store } from "./lib/store";

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url } = context;
  const pathname = url.pathname;

  if (
    pathname.includes(".") ||
    pathname.startsWith("/_astro") ||
    pathname.startsWith("/api")
  ) {
    return next();
  }

  const cacheKey = pathname;
  const eTag = `"${cacheKey}-${store.lastFetched}"`;

  if (request.headers.get("if-none-match") === eTag) {
    console.log("etag");
    return new Response(null, {
      status: 304,
      headers: {
        ETag: eTag,
        "Cache-Control": "public, max-age=120, stale-while-revalidate=3600",
      },
    });
  }

  const cachedContent = store.getCachedHtml(cacheKey);

  if (cachedContent) {
    if (cachedContent.startsWith("__REDIRECT__")) {
      console.log("redirect");
      const [, status, location] = cachedContent.split("|");
      return new Response(null, {
        status: parseInt(status),
        headers: {
          Location: location,
          "Cache-Control": "public, max-age=3600",
          ETag: eTag,
          "X-Cache": "HIT-REDIRECT",
        },
      });
    }
    console.log("cache hit");

    return new Response(cachedContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=120, stale-while-revalidate=3600",
        ETag: eTag,
        "X-Cache": "HIT",
      },
    });
  }

  const response = await next();
  console.log("miss");

  if (
    response.status === 200 &&
    response.headers.get("content-type")?.includes("text/html")
  ) {
    const html = await response.clone().text();
    store.setCachedHtml(cacheKey, html);

    response.headers.set(
      "Cache-Control",
      "public, max-age=120, stale-while-revalidate=3600",
    );
    response.headers.set("ETag", eTag);
    response.headers.set("X-Cache", "MISS");
  } else if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("Location");
    if (location) {
      store.setCachedHtml(
        cacheKey,
        `__REDIRECT__|${response.status}|${location}`,
      );

      response.headers.set("Cache-Control", "public, max-age=3600");
      response.headers.set("ETag", eTag);
      response.headers.set("X-Cache", "MISS-REDIRECT");
    }
  }

  return response;
});
