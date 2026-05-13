// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://ivs-calculator.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
]);

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && allowedOrigins.has(origin)
    ? origin
    : "https://ivs-calculator.vercel.app";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

serve(async (request) => {
  const corsHeaders = getCorsHeaders(request.headers.get("Origin"));

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const csrName = String(body?.csrName || "Direct").trim() || "Direct";
    const entry = body?.entry || {};

    if (!entry || typeof entry !== "object") {
      return new Response(JSON.stringify({ error: "Missing calculator entry data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase function secrets are missing.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const row = {
      csr_name: csrName,
      parent_name: entry.parentName || null,
      f_code: entry.fCode || null,
      issued_on: entry.issuedOn || null,
      due_date: entry.dueDate || null,
      currency: entry.currency || null,
      exchange_rate: toNumber(entry.exchangeRate, 1),
      selected_months: Array.isArray(entry.selectedMonths) ? entry.selectedMonths : [],
      month_count: toNumber(entry.monthCount, 1),
      total_amount: toNumber(entry.totalAmount),
      program_discount_amount: toNumber(entry.programDiscountAmount),
      custom_discount_amount: toNumber(entry.customDiscountAmount),
      final_amount: toNumber(entry.finalAmount),
      student_count: Array.isArray(entry.students) ? entry.students.length : 0,
      students: Array.isArray(entry.students) ? entry.students : [],
      registration_entries: Array.isArray(entry.registrationEntries) ? entry.registrationEntries : [],
      source_url: body?.sourceUrl || null,
      payload: entry,
    };

    const { data, error } = await supabase
      .from("calculator_entries")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    const googleSheetWebhookUrl = Deno.env.get("GOOGLE_SHEET_WEBHOOK_URL");

    if (!googleSheetWebhookUrl) {
      throw new Error("Google Sheet webhook URL is missing.");
    }

    const googlePayload = {
      id: data.id,
      createdAt: new Date().toISOString(),
      csrName,
      sourceUrl: body?.sourceUrl || null,
      ...entry,
    };

    const webhookResponse = await fetch(googleSheetWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(googlePayload),
    });

    if (!webhookResponse.ok) {
      const webhookError = await webhookResponse.text();

      await supabase
        .from("calculator_entries")
        .update({
          google_sheet_sent: false,
          google_sheet_error: webhookError || `Webhook failed with status ${webhookResponse.status}`,
        })
        .eq("id", data.id);

      return new Response(JSON.stringify({ error: "Google Sheet webhook failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("calculator_entries")
      .update({
        google_sheet_sent: true,
        google_sheet_error: null,
      })
      .eq("id", data.id);

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});