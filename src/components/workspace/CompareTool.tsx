"use client";

import { useId, useMemo, useRef, useState, useTransition, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Columns2, Grid3x3, Layers, MapPin, Maximize2, Move, RotateCcw, RotateCw, Trash2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { saveComparisonAction } from "@/app/actions/workspace";
import { Button, Callout, cx } from "@/components/ui";
import type { SignatureObservation } from "@/lib/domain/types";
import { findWordingViolations, SIGNATURE_DISCLAIMER, SIGNATURE_INNOCENT_CAUSES } from "@/lib/domain/wording";

export interface CompareImage {
  id: string;
  title: string;
  url: string;
  sourceRef: string;
}

interface Props {
  caseId: string;
  comparisonId: string;
  questioned: CompareImage;
  known: CompareImage[];
  initialObservations: SignatureObservation[];
  initialExaminerNote: string;
  flagged: boolean;
  readOnly: boolean;
}

type Mode = "side" | "overlay";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

function newObsId() {
  return `obs_${Math.random().toString(36).slice(2, 12)}`;
}

function WordingHint({ text }: { text: string }) {
  const v = findWordingViolations(text);
  if (v.length === 0) return null;
  return (
    <p className="mt-1 text-sm font-semibold text-ochre-ink" role="status">
      Experts need neutral notes. &quot;{v[0].term}&quot; draws a conclusion; describe what looks different instead. It will be replaced when you save.
    </p>
  );
}

type NumberedObs = SignatureObservation & { n: number };

function Pins({ obs, side, zoom }: { obs: NumberedObs[]; side: "questioned" | "known"; zoom: number }) {
  return (
    <>
      {obs
        .filter((o) => o.side === side)
        .map((o) => (
          <span
            key={o.id}
            aria-hidden
            className="pointer-events-none absolute flex size-6 items-center justify-center rounded-full border-2 border-white bg-spruce text-xs font-bold text-white shadow"
            style={{ left: `${o.x * 100}%`, top: `${o.y * 100}%`, transform: `translate(-50%, -50%) scale(${1 / zoom})` }}
          >
            {o.n}
          </span>
        ))}
    </>
  );
}

interface ViewportProps {
  label: string;
  grid: boolean;
  annotate: boolean;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
  children: ReactNode;
}

function Viewport({ label, grid, annotate, onKeyDown, onPointerDown, onPointerMove, onPointerUp, children }: ViewportProps) {
  return (
    <div
      role="application"
      aria-label={`${label}. Use arrow keys to move, plus and minus to zoom, 0 to reset.`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cx(
        "relative h-[22rem] touch-none select-none overflow-hidden rounded-lg border border-line-strong bg-[#fdfcf8]",
        grid && "compare-grid",
        annotate ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing",
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function CompareTool(props: Props) {
  const { caseId, comparisonId, questioned, known, readOnly } = props;
  const [mode, setMode] = useState<Mode>("side");
  const [knownIdx, setKnownIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotQ, setRotQ] = useState(0);
  const [rotK, setRotK] = useState(0);
  const [fineK, setFineK] = useState(0);
  const [nudge, setNudge] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(50);
  const [grid, setGrid] = useState(true);
  const [annotate, setAnnotate] = useState(false);
  const [obs, setObs] = useState<SignatureObservation[]>(props.initialObservations);
  const [userNote, setUserNote] = useState("");
  const [examinerNote, setExaminerNote] = useState(props.initialExaminerNote);
  const [flagged, setFlagged] = useState(props.flagged);
  const [ack, setAck] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "danger" | "caution"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const uid = useId();
  const k = known[knownIdx] ?? known[0];

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100));

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (annotate) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    setPan({ x: d.px + (e.clientX - d.x), y: d.py + (e.clientY - d.y) });
  }
  function onPointerUp() {
    drag.current = null;
    setDragging(false);
  }
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 60 : 20;
    const map: Record<string, () => void> = {
      ArrowLeft: () => setPan((p) => ({ ...p, x: p.x + step })),
      ArrowRight: () => setPan((p) => ({ ...p, x: p.x - step })),
      ArrowUp: () => setPan((p) => ({ ...p, y: p.y + step })),
      ArrowDown: () => setPan((p) => ({ ...p, y: p.y - step })),
      "+": () => setZoom((z) => clampZoom(z + 0.25)),
      "=": () => setZoom((z) => clampZoom(z + 0.25)),
      "-": () => setZoom((z) => clampZoom(z - 0.25)),
      "0": () => reset(),
    };
    const fn = map[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  }
  function reset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function placePin(side: "questioned" | "known", e: React.MouseEvent<HTMLImageElement>) {
    if (!annotate || readOnly) return;
    const img = e.currentTarget;
    // offsetX/Y are in the image's own (untransformed) coordinates.
    const x = Math.min(1, Math.max(0, e.nativeEvent.offsetX / img.clientWidth));
    const y = Math.min(1, Math.max(0, e.nativeEvent.offsetY / img.clientHeight));
    setObs((o) => [...o, { id: newObsId(), side, x, y, note: "" }]);
  }
  function addPinAtCentre(side: "questioned" | "known") {
    setObs((o) => [...o, { id: newObsId(), side, x: 0.5, y: 0.5, note: "" }]);
  }

  const numbered = useMemo(() => obs.map((o, i) => ({ ...o, n: i + 1 })), [obs]);

  function save(flag: boolean) {
    setMessage(null);
    startTransition(async () => {
      const res = await saveComparisonAction({ caseId, comparisonId, observations: obs, userNote, flag });
      if (!res.ok) {
        setMessage({ tone: "danger", text: res.message });
        return;
      }
      if (res.examinerNote !== undefined) setExaminerNote(res.examinerNote);
      if (flag) setFlagged(true);
      setMessage({ tone: res.removedWording ? "caution" : "success", text: res.removedWording ? `${res.message} Some wording that drew a conclusion was replaced with neutral wording.` : res.message });
    });
  }

  const transform = (rot: number) => `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rot}deg)`;

  return (
    <div>
      {/* Maps dark strokes to green and keeps the paper white, so overlaid strokes stand apart. */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id="rf-known-tint" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.89 0 0 0 0.11  0 0.65 0 0 0.35  0 0 0.69 0 0.31  0 0 0 1 0" />
        </filter>
      </svg>
      <Callout tone="info" className="mb-5" title="Compare visually. No verdicts.">
        <p>{SIGNATURE_DISCLAIMER}</p>
        <p className="mt-1">{SIGNATURE_INNOCENT_CAUSES}</p>
      </Callout>

      {/* Toolbar */}
      <div role="toolbar" aria-label="Compare tools" className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface p-2">
        <div className="flex rounded-md border border-line" role="group" aria-label="View">
          <button type="button" aria-pressed={mode === "side"} onClick={() => setMode("side")} className={cx("flex min-h-9 items-center gap-1.5 rounded-l-md px-3 text-sm font-semibold", mode === "side" ? "bg-spruce text-white" : "text-ink-2 hover:bg-sunken")}>
            <Columns2 aria-hidden className="size-4" /> Side by side
          </button>
          <button type="button" aria-pressed={mode === "overlay"} onClick={() => setMode("overlay")} className={cx("flex min-h-9 items-center gap-1.5 rounded-r-md px-3 text-sm font-semibold", mode === "overlay" ? "bg-spruce text-white" : "text-ink-2 hover:bg-sunken")}>
            <Layers aria-hidden className="size-4" /> Overlay
          </button>
        </div>
        <span className="mx-1 h-6 w-px bg-line" aria-hidden />
        <Button type="button" variant="secondary" size="sm" onClick={() => setZoom((z) => clampZoom(z - 0.25))} aria-label="Zoom out">
          <ZoomOut aria-hidden className="size-4" />
        </Button>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Zoom</span>
          <input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step={0.05} value={zoom} onChange={(e) => setZoom(clampZoom(Number(e.target.value)))} className="w-28 accent-spruce" aria-valuetext={`${Math.round(zoom * 100)} percent`} />
          <span className="tabular w-12 text-ink-2">{Math.round(zoom * 100)}%</span>
        </label>
        <Button type="button" variant="secondary" size="sm" onClick={() => setZoom((z) => clampZoom(z + 0.25))} aria-label="Zoom in">
          <ZoomIn aria-hidden className="size-4" />
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={reset} aria-label="Reset zoom and position">
          <Maximize2 aria-hidden className="size-4" />
        </Button>
        <span className="mx-1 h-6 w-px bg-line" aria-hidden />
        <Button type="button" variant={grid ? "primary" : "secondary"} size="sm" aria-pressed={grid} onClick={() => setGrid((g) => !g)}>
          <Grid3x3 aria-hidden className="size-4" /> Grid
        </Button>
        {!readOnly && (
          <Button type="button" variant={annotate ? "primary" : "secondary"} size="sm" aria-pressed={annotate} onClick={() => setAnnotate((a) => !a)}>
            {annotate ? <MapPin aria-hidden className="size-4" /> : <Move aria-hidden className="size-4" />}
            {annotate ? "Placing notes: click the image" : "Add notes"}
          </Button>
        )}
        {known.length > 1 && (
          <label className="ml-auto flex items-center gap-2 text-sm">
            Known sample
            <select value={knownIdx} onChange={(e) => setKnownIdx(Number(e.target.value))} className="rounded-md border border-line-strong bg-surface px-2 py-1.5">
              {known.map((kk, i) => (
                <option key={kk.id} value={i}>
                  {kk.sourceRef}: {kk.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {mode === "side" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { side: "questioned" as const, img: questioned, rot: rotQ, setRot: setRotQ, label: "Questioned sample" },
            { side: "known" as const, img: k, rot: rotK + fineK, setRot: setRotK, label: "Known sample" },
          ].map(({ side, img, rot, setRot, label }) => (
            <figure key={side}>
              <figcaption className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  <span className="font-bold">{label}</span> <span className="font-mono text-ink-3">{img.sourceRef}</span>
                  <span className="block text-ink-3">{img.title}</span>
                </span>
                <span className="flex gap-1">
                  <Button type="button" variant="quiet" size="sm" onClick={() => setRot((r) => r - 90)} aria-label={`Rotate ${label} left`}>
                    <RotateCcw aria-hidden className="size-4" />
                  </Button>
                  <Button type="button" variant="quiet" size="sm" onClick={() => setRot((r) => r + 90)} aria-label={`Rotate ${label} right`}>
                    <RotateCw aria-hidden className="size-4" />
                  </Button>
                  {!readOnly && (
                    <Button type="button" variant="quiet" size="sm" onClick={() => addPinAtCentre(side)}>
                      Note at centre
                    </Button>
                  )}
                </span>
              </figcaption>
              <Viewport label={`${label}: ${img.title}`} grid={grid} annotate={annotate} onKeyDown={onKey} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
                <div className="relative w-[88%]" style={{ transform: transform(rot), transformOrigin: "center", transition: dragging ? "none" : "transform 120ms ease-out" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={`${label}: ${img.title}`} draggable={false} onClick={(e) => placePin(side, e)} className="block w-full" />
                  <Pins obs={numbered} side={side} zoom={zoom} />
                </div>
              </Viewport>
            </figure>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
          <figure>
            <figcaption className="mb-1.5 text-sm">
              <span className="font-bold">Overlay:</span> questioned <span className="font-mono text-ink-3">{questioned.sourceRef}</span> with known{" "}
              <span className="font-mono text-ink-3">{k.sourceRef}</span> on top
            </figcaption>
            <Viewport label="Overlay of questioned and known samples" grid={grid} annotate={annotate} onKeyDown={onKey} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
              <div className="relative w-[88%]" style={{ transform: transform(rotQ), transformOrigin: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={questioned.url} alt={`Questioned sample: ${questioned.title}`} draggable={false} onClick={(e) => placePin("questioned", e)} className="block w-full" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={k.url}
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="pointer-events-none absolute inset-0 block w-full mix-blend-multiply"
                  style={{ opacity: opacity / 100, transform: `translate(${nudge.x}px, ${nudge.y}px) rotate(${rotK - rotQ + fineK}deg)`, filter: "url(#rf-known-tint)" }}
                />
                <Pins obs={numbered} side="questioned" zoom={zoom} />
              </div>
            </Viewport>
          </figure>
          <div className="space-y-4 rounded-lg border border-line bg-surface p-4 text-sm">
            <label className="block">
              <span className="font-semibold">Known sample opacity: {opacity}%</span>
              <input type="range" min={0} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="mt-1 w-full accent-spruce" />
            </label>
            <label className="block">
              <span className="font-semibold">Fine rotate known: {fineK}°</span>
              <input type="range" min={-20} max={20} step={0.5} value={fineK} onChange={(e) => setFineK(Number(e.target.value))} className="mt-1 w-full accent-spruce" />
            </label>
            <div>
              <p className="font-semibold">Nudge known sample</p>
              <div className="mt-1 grid w-36 grid-cols-3 gap-1">
                <span />
                <Button type="button" variant="secondary" size="sm" onClick={() => setNudge((n) => ({ ...n, y: n.y - 2 }))} aria-label="Nudge up">
                  <ArrowUp aria-hidden className="size-4" />
                </Button>
                <span />
                <Button type="button" variant="secondary" size="sm" onClick={() => setNudge((n) => ({ ...n, x: n.x - 2 }))} aria-label="Nudge left">
                  <ArrowLeft aria-hidden className="size-4" />
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setNudge({ x: 0, y: 0 })} aria-label="Reset nudge">
                  <Undo2 aria-hidden className="size-4" />
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setNudge((n) => ({ ...n, x: n.x + 2 }))} aria-label="Nudge right">
                  <ArrowRight aria-hidden className="size-4" />
                </Button>
                <span />
                <Button type="button" variant="secondary" size="sm" onClick={() => setNudge((n) => ({ ...n, y: n.y + 2 }))} aria-label="Nudge down">
                  <ArrowDown aria-hidden className="size-4" />
                </Button>
              </div>
            </div>
            <p className="text-ink-3">The known sample is tinted green so you can see where strokes line up and where they differ.</p>
          </div>
        </div>
      )}

      {/* Notes */}
      <section aria-labelledby={`${uid}-notes`} className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 id={`${uid}-notes`} className="text-lg font-bold">
            What looks different ({obs.length})
          </h2>
          <p className="mt-1 text-sm text-ink-2">Describe size, slant, spacing, pressure or letter shapes. Write what you see, not what you think it means.</p>
          {obs.length === 0 ? (
            <p className="mt-3 text-sm text-ink-3">No notes yet. Choose &quot;Add notes&quot; and click a spot on either image, or use &quot;Note at centre&quot;.</p>
          ) : (
            <ol className="mt-3 space-y-3">
              {numbered.map((o) => (
                <li key={o.id} className="rounded-md border border-line bg-surface p-3">
                  <div className="mb-1.5 flex items-center gap-2 text-sm">
                    <span className="flex size-6 items-center justify-center rounded-full bg-spruce text-xs font-bold text-white">{o.n}</span>
                    <span className="font-semibold">{o.side === "questioned" ? "Questioned sample" : "Known sample"}</span>
                    {!readOnly && (
                      <Button type="button" variant="quiet" size="sm" className="ml-auto" onClick={() => setObs((list) => list.filter((x) => x.id !== o.id))} aria-label={`Remove note ${o.n}`}>
                        <Trash2 aria-hidden className="size-4" />
                      </Button>
                    )}
                  </div>
                  <label htmlFor={`${uid}-${o.id}`} className="sr-only">
                    Note {o.n}
                  </label>
                  <textarea
                    id={`${uid}-${o.id}`}
                    value={o.note}
                    readOnly={readOnly}
                    maxLength={500}
                    rows={2}
                    onChange={(e) => setObs((list) => list.map((x) => (x.id === o.id ? { ...x, note: e.target.value } : x)))}
                    className="block w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-[0.95rem]"
                  />
                  <WordingHint text={o.note} />
                </li>
              ))}
            </ol>
          )}
          {!readOnly && (
            <Button type="button" variant="secondary" className="mt-4" onClick={() => save(false)} disabled={pending}>
              {pending ? "Saving..." : "Save notes"}
            </Button>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold">Flag for a document examiner</h2>
          <p className="mt-1 text-sm text-ink-2">This saves a note you can include in an expert prep package. The required wording below is always added.</p>
          {flagged && examinerNote && (
            <div className="mt-3 whitespace-pre-wrap rounded-md border border-[#c9d4e6] bg-slate-tint p-4 text-[0.95rem] text-slate-ink" aria-label="Saved examiner note">
              {examinerNote}
            </div>
          )}
          {!readOnly && (
            <div className="mt-3">
              <label htmlFor={`${uid}-flagnote`} className="mb-1 block font-semibold">
                What you noticed, in your own words
              </label>
              <textarea
                id={`${uid}-flagnote`}
                value={userNote}
                maxLength={2000}
                rows={4}
                onChange={(e) => setUserNote(e.target.value)}
                className="block w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-[0.95rem]"
              />
              <WordingHint text={userNote} />
              <label className="mt-3 flex gap-2 text-sm">
                <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-spruce" />
                <span>I understand this tool cannot tell whether a signature is genuine, and that differences can have innocent causes.</span>
              </label>
              <Button type="button" className="mt-3" disabled={!ack || pending} onClick={() => save(true)}>
                {flagged ? "Update examiner note" : "Save and flag for an examiner"}
              </Button>
            </div>
          )}
          {message && (
            <Callout tone={message.tone} role="status" className="mt-4">
              {message.text}
            </Callout>
          )}
        </div>
      </section>
    </div>
  );
}
