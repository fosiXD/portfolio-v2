import { useEffect, useRef } from "react";
import { MeshRenderer } from "../lib/MeshRenderer";
import "./MeshBackground.css";

// React solo monta y destruye: todo el WebGL vive en MeshRenderer
export function MeshBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const renderer = new MeshRenderer(canvas);
    renderer.start();
    return () => renderer.destroy();
  }, []);

  return <canvas ref={ref} className="mesh-background" aria-hidden="true" />;
}
