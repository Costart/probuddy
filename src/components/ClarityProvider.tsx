"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export function ClarityProvider({ projectId }: { projectId: string }) {
  useEffect(() => {
    Clarity.init(projectId);
  }, [projectId]);

  return null;
}
