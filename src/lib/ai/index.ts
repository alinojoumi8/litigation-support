import "server-only";
import { getConfig } from "../config";
import { MockAIProvider } from "./mock";
import type { AIProvider } from "./provider";

/** AI_PROVIDER=anthropic and ANTHROPIC_API_KEY opt in to Claude. Otherwise the local demo extractor runs. */
export async function getAI(): Promise<AIProvider> {
  const c = getConfig();
  if (c.AI_PROVIDER === "anthropic" && c.ANTHROPIC_API_KEY) {
    const { AnthropicProvider } = await import("./anthropic");
    return new AnthropicProvider(c.ANTHROPIC_API_KEY, c.ANTHROPIC_MODEL);
  }
  return new MockAIProvider();
}
