import { useEffect, useRef } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { ChevronDown, ChevronUp, Terminal as TermIcon, Trash2 } from "lucide-react";

interface TerminalProps {
  output: string;
  isExpanded: boolean;
  onToggle: () => void;
  onClear?: () => void;
}

export function Terminal({ output, isExpanded, onToggle, onClear }: TerminalProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const previousOutputRef = useRef("");

  useEffect(() => {
    if (!isExpanded || !viewportRef.current) {
      return;
    }

    const computedStyle = getComputedStyle(document.documentElement);
    const terminal = new XTerm({
      convertEol: false,
      cursorBlink: false,
      disableStdin: true,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: window.innerWidth < 768 ? 10 : 12,
      lineHeight: 1.5,
      scrollback: 5000,
      theme: {
        background: `hsl(${computedStyle.getPropertyValue("--terminal-bg").trim()})`,
        foreground: `hsl(${computedStyle.getPropertyValue("--foreground").trim()})`,
        brightBlack: `hsl(${computedStyle.getPropertyValue("--muted-foreground").trim()})`,
        cyan: `hsl(${computedStyle.getPropertyValue("--terminal-cyan").trim()})`,
      },
    });
    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);
    terminal.open(viewportRef.current);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      terminal.scrollToBottom();
    });

    resizeObserver.observe(viewportRef.current);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const terminal = terminalRef.current;
    if (!terminal) {
      return;
    }

    if (output.length === 0) {
      terminal.clear();
      terminal.reset();
      previousOutputRef.current = "";
      return;
    }

    const previousOutput = previousOutputRef.current;
    const nextChunk = output.startsWith(previousOutput)
      ? output.slice(previousOutput.length)
      : output;

    if (!output.startsWith(previousOutput)) {
      terminal.clear();
      terminal.reset();
    }

    if (nextChunk.length > 0) {
      terminal.write(nextChunk);
      terminal.scrollToBottom();
    }

    previousOutputRef.current = output;
  }, [output, isExpanded]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    fitAddonRef.current?.fit();
    terminalRef.current?.scrollToBottom();
  }, [isExpanded]);

  return (
    <div className="flex h-full flex-col border-t border-border bg-terminal-bg">
      <button
        onClick={onToggle}
        className="flex items-center justify-between border-b border-border px-2 py-1.5 text-xs font-mono text-muted-foreground transition-colors hover:text-foreground md:px-3"
      >
        <div className="flex items-center gap-2">
          <TermIcon className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-wider md:text-xs">
            Console
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isExpanded && onClear && output.length > 0 && (
            <span
              role="button"
              title="Clear console"
              className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="relative flex-1 overflow-hidden p-2">
          <div ref={viewportRef} className="h-full w-full" />
          {output.length === 0 && (
            <div className="pointer-events-none absolute inset-0 p-4 font-mono text-[10px] text-muted-foreground/50 md:text-xs">
              <span className="text-terminal-cyan">$</span> Ready. Build a contract to see output...
              <span className="ml-0.5 inline-block h-3.5 w-2 animate-blink bg-foreground/70" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
