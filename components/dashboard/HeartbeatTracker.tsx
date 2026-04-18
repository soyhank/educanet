"use client";

import { useEffect } from "react";
import { heartbeatDiario } from "@/lib/gamificacion/heartbeat-action";

export function HeartbeatTracker() {
  useEffect(() => {
    const key = `heartbeat_${new Date().toISOString().slice(0, 10)}`;
    if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      heartbeatDiario().catch(() => {});
    }
  }, []);

  return null;
}
