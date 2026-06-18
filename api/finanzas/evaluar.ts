import { evaluarProyectoFinancieroDesdeJson } from "../../src/lib/finanzas/api-contract";

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): void;
  end(): void;
};

function parseBody(body: unknown): unknown {
  if (typeof body === "string") {
    return body.trim() ? JSON.parse(body) : {};
  }
  if (Buffer.isBuffer(body)) {
    const text = body.toString("utf8");
    return text.trim() ? JSON.parse(text) : {};
  }
  return body;
}

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({
      error: "Metodo no permitido. Usa POST /api/finanzas/evaluar.",
    });
    return;
  }

  try {
    const response = evaluarProyectoFinancieroDesdeJson(parseBody(req.body));
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Payload invalido.",
    });
  }
}
