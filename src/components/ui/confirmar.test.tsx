import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { confirmar, ConfirmarHost } from "./confirmar";

describe("confirmar (reemplazo no bloqueante de window.confirm)", () => {
  it("sin el host montado cae al confirm del navegador", async () => {
    const original = (globalThis as any).window;
    (globalThis as any).window = { confirm: vi.fn(() => true) };
    expect(await confirmar("¿Seguro?")).toBe(true);
    expect((globalThis as any).window.confirm).toHaveBeenCalledWith("¿Seguro?");
    (globalThis as any).window = original;
  });

  it("el host no dibuja nada mientras no haya un pedido", () => {
    expect(renderToStaticMarkup(<ConfirmarHost />)).toBe("");
  });
});
