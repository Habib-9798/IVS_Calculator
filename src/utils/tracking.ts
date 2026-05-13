type SaveCalculatorEntryPayload = {
  csrName: string;
  entry: Record<string, unknown>;
};

export async function saveCalculatorEntry(payload: SaveCalculatorEntryPayload) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  const functionUrl = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/save-calculator-entry`;

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      ...payload,
      sourceUrl: window.location.href,
      submittedAt: new Date().toISOString(),
    }),
  });

  const responseText = await response.text();
  let responseBody: any = null;

  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseBody = { error: responseText };
  }

  if (!response.ok) {
    throw new Error(responseBody?.error || "Failed to save calculator entry.");
  }

  return responseBody;
}