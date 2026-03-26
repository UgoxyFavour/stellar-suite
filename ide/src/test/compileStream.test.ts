import { describe, expect, it } from "vitest";
import {
  createStreamProcessor,
  formatTerminalChunk,
  readCompileResponse,
} from "@/utils/compileStream";

describe("compileStream", () => {
  it("formats line endings for terminal output", () => {
    expect(formatTerminalChunk("line 1\nline 2")).toBe("line 1\r\nline 2");
    expect(formatTerminalChunk("line 1\r\nline 2")).toBe("line 1\r\nline 2");
  });

  it("keeps the raw output while writing formatted terminal chunks", () => {
    const writes: string[] = [];
    const processor = createStreamProcessor({
      onTerminalData: (chunk) => writes.push(chunk),
    });

    processor.push("stderr line\n");
    processor.push("stdout line");

    expect(processor.getOutput()).toBe("stderr line\nstdout line");
    expect(writes).toEqual(["stderr line\r\n", "stdout line"]);
  });

  it("streams response body chunks to the terminal in order", async () => {
    const writes: string[] = [];
    const processor = createStreamProcessor({
      onTerminalData: (chunk) => writes.push(chunk),
    });
    const response = new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("Compiling crate\n"));
          controller.enqueue(new TextEncoder().encode("warning: unused import\n"));
          controller.close();
        },
      }),
      {
        headers: {
          "content-type": "text/plain",
        },
      }
    );

    const output = await readCompileResponse(response, processor);

    expect(output).toBe("Compiling crate\nwarning: unused import\n");
    expect(writes).toEqual([
      "Compiling crate\r\n",
      "warning: unused import\r\n",
      "",
    ]);
  });

  it("coerces JSON compile payloads to stdout/stderr output", async () => {
    const writes: string[] = [];
    const processor = createStreamProcessor({
      onTerminalData: (chunk) => writes.push(chunk),
    });
    const response = new Response(
      JSON.stringify({
        stdout: "Compiling hello_world\n",
        stderr: "warning: be careful\n",
      }),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );

    const output = await readCompileResponse(response, processor);

    expect(output).toBe("Compiling hello_world\nwarning: be careful\n");
    expect(writes).toEqual(["Compiling hello_world\r\nwarning: be careful\r\n", ""]);
  });
});
