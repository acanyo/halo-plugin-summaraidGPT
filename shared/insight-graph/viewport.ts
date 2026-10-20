export function clampGraphZoom(value: number): number {
  return Math.max(0.35, Math.min(1.6, Math.round(value * 100) / 100));
}

export function fitGraphZoom(viewport: HTMLElement, width: number, height: number): number {
  return clampGraphZoom(
    Math.min((viewport.clientWidth - 40) / width, (viewport.clientHeight - 40) / height, 1),
  );
}

export function preserveGraphCenter(viewport: HTMLElement, before: number, after: number): void {
  const ratio = after / before;
  viewport.scrollLeft =
    (viewport.scrollLeft + viewport.clientWidth / 2) * ratio - viewport.clientWidth / 2;
  viewport.scrollTop =
    (viewport.scrollTop + viewport.clientHeight / 2) * ratio - viewport.clientHeight / 2;
}

export function revealGraphNode(viewport: HTMLElement, id: string): void {
  const node = viewport.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(id)}"]`);
  if (!node) return;
  const bounds = node.getBoundingClientRect();
  const frame = viewport.getBoundingClientRect();
  viewport.scrollTo({
    left:
      viewport.scrollLeft + bounds.left - frame.left - (viewport.clientWidth - bounds.width) / 2,
    top: viewport.scrollTop + bounds.top - frame.top - (viewport.clientHeight - bounds.height) / 2,
  });
}

export function bindGraphPan(viewport: HTMLElement): () => void {
  let drag: { id: number; x: number; y: number; left: number; top: number } | undefined;
  const down = (event: PointerEvent) => {
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      (event.target as Element).closest("button, a, input, textarea")
    )
      return;
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
    };
    viewport.setPointerCapture(event.pointerId);
    viewport.dataset.panning = "true";
  };
  const move = (event: PointerEvent) => {
    if (!drag || drag.id !== event.pointerId) return;
    viewport.scrollLeft = drag.left - (event.clientX - drag.x);
    viewport.scrollTop = drag.top - (event.clientY - drag.y);
  };
  const up = () => {
    drag = undefined;
    delete viewport.dataset.panning;
  };
  viewport.addEventListener("pointerdown", down);
  viewport.addEventListener("pointermove", move);
  viewport.addEventListener("pointerup", up);
  viewport.addEventListener("lostpointercapture", up);
  return () => {
    viewport.removeEventListener("pointerdown", down);
    viewport.removeEventListener("pointermove", move);
    viewport.removeEventListener("pointerup", up);
    viewport.removeEventListener("lostpointercapture", up);
  };
}
