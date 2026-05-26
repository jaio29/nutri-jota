import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const googleApiKey = Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("GEMINI_API_KEY");
    if (!googleApiKey) {
      return new Response(
        JSON.stringify({ error: "A chave de API (GOOGLE_API_KEY ou GEMINI_API_KEY) não está configurada no backend do Supabase." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    const { dados_do_paciente } = await req.json();
    if (!dados_do_paciente) {
      return new Response(
        JSON.stringify({ error: "Os dados do paciente não foram fornecidos." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    console.log("Iniciando geração com Gemini...");
    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            plano_semanal: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  dia: { type: "string" },
                  refeicoes: {
                    type: "object",
                    properties: {
                      cafe_da_manha: { type: "array", items: { type: "string" } },
                      lanche_manha: { type: "array", items: { type: "string" } },
                      almoco: { type: "array", items: { type: "string" } },
                      lanche_tarde: { type: "array", items: { type: "string" } },
                      jantar: { type: "array", items: { type: "string" } }
                    },
                    required: ["cafe_da_manha", "lanche_manha", "almoco", "lanche_tarde", "jantar"]
                  }
                },
                required: ["dia", "refeicoes"]
              }
            }
          },
          required: ["plano_semanal"]
        }
      }
    });

    const prompt = `Você é um nutricionista clínico profissional especialista na culinária e rotina brasileira.
Gere um plano alimentar semanal completo, saudável e diversificado com base nos dados do paciente fornecidos abaixo.

Dados do Paciente (Metas, Alergias, Restrições e Histórico):
${dados_do_paciente}

⚠️ Regras Críticas de Execução:
- Você deve responder APENAS e estritamente o objeto JSON solicitado.
- Não inclua blocos de código markdown (como \`\`\`json ... \`\`\`), explicações, introduções ou textos complementares.
- Adapte o cardápio rigorosamente a quaisquer alergias ou restrições descritas nos dados.
- Utilize alimentos comuns, acessíveis e culturalmente aceitos no Brasil.
- Evite repetições monótonas de alimentos nos dias seguidos.

O formato do JSON retornado deve seguir exatamente esta estrutura:
{
  "plano_semanal": [
    {
      "dia": "Segunda-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    console.log("Plano alimentar gerado com sucesso pelo Gemini.");

    return new Response(textResponse, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });

  } catch (error: any) {
    console.error("Erro na Edge Function gerar-plano:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno ao gerar o plano com IA." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
});
