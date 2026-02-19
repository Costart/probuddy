"use client";

import { useEffect } from "react";
import { clarityIdentify, clarityTag } from "@/lib/clarity";

interface ClarityIdentifyProps {
  userId: string;
  friendlyName?: string;
}

/** Identifies the current user in Clarity session recordings. */
export function ClarityIdentify({ userId, friendlyName }: ClarityIdentifyProps) {
  useEffect(() => {
    clarityIdentify(userId, friendlyName);
    clarityTag("pageType", "dashboard");
  }, [userId, friendlyName]);

  return null;
}
