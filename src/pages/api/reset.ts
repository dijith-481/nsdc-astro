import type { APIRoute } from "astro";
import { store } from "../../lib/store";
import { dataService } from "../../lib/data-service";
import crypto from "node:crypto";

export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("x-api-key");
  const url = new URL(request.url);
  const queryKey = url.searchParams.get("key");

  const receivedKey = authHeader || queryKey || "";
  const secretKey = process.env.CACHE_RESET_KEY || "";

  const isMatch =
    receivedKey.length === secretKey.length &&
    crypto.timingSafeEqual(Buffer.from(receivedKey), Buffer.from(secretKey));

  if (!secretKey || !isMatch) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const COOLDOWN_MS = 10000;
  if (Date.now() - store.lastResetTime < COOLDOWN_MS) {
    return new Response(
      JSON.stringify({ message: "Cooldown active. Skipping reset." }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  store.reset();
  store.lastResetTime = Date.now();

  try {
    await dataService.getInitialData();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Refetch failed" }), {
      status: 500,
    });
  }

  return new Response(
    JSON.stringify({
      message: "Cache cleared and data refreshed.",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};
