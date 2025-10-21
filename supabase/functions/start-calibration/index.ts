import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StartCalibrationRequest {
  modelId: string;
  jupyterNotebookUrl: string;
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

    const { modelId, jupyterNotebookUrl }: StartCalibrationRequest = await req.json();

    if (!modelId || !jupyterNotebookUrl) {
      return new Response(
        JSON.stringify({ error: "modelId and jupyterNotebookUrl are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: session, error: insertError } = await supabase
      .from("calibration_sessions")
      .insert({
        model_id: modelId,
        status: "pending",
        jupyter_notebook_url: jupyterNotebookUrl,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    try {
      const { error: updateError } = await supabase
        .from("calibration_sessions")
        .update({
          status: "running",
          started_at: new Date().toISOString(),
        })
        .eq("id", session.id);

      if (updateError) throw updateError;

      const notebookResponse = await fetch(jupyterNotebookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start_calibration",
          session_id: session.id,
          model_id: modelId,
        }),
      });

      if (!notebookResponse.ok) {
        throw new Error(`Jupyter notebook responded with status: ${notebookResponse.status}`);
      }

      const notebookData = await notebookResponse.json();

      const { error: completeError } = await supabase
        .from("calibration_sessions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          calibration_data: notebookData,
        })
        .eq("id", session.id);

      if (completeError) throw completeError;

      return new Response(
        JSON.stringify({
          success: true,
          sessionId: session.id,
          data: notebookData,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (notebookError) {
      await supabase
        .from("calibration_sessions")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: notebookError.message,
        })
        .eq("id", session.id);

      throw notebookError;
    }
  } catch (error) {
    console.error("Error in start-calibration:", error);
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