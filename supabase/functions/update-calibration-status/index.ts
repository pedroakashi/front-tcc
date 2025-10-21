import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface UpdateStatusRequest {
  sessionId: string;
  status: string;
  calibrationData?: any;
  errorMessage?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { sessionId, status, calibrationData, errorMessage }: UpdateStatusRequest = await req.json();

    if (!sessionId || !status) {
      return new Response(
        JSON.stringify({ error: "sessionId and status are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const updateData: any = {
      status,
    };

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
      if (calibrationData) {
        updateData.calibration_data = calibrationData;
      }
    }

    if (status === "failed" && errorMessage) {
      updateData.error_message = errorMessage;
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("calibration_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: data,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in update-calibration-status:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});