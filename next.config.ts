import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

let dynamicOrigins: string[] = [];
try {
  const logPath = path.resolve(process.cwd(), "cloudflare.log");
  if (fs.existsSync(logPath)) {
    const logContent = fs.readFileSync(logPath, "utf-8");
    const matches = logContent.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/g);
    if (matches) {
      // Remove 'https://' to get just the hostnames
      dynamicOrigins = [...new Set(matches.map(url => url.replace("https://", "")))];
    }
  }
} catch (error) {
  console.error("Error reading cloudflare.log:", error);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "petite-actors-sin.loca.lt",
    "rotten-tires-laugh.loca.lt",
    "bitter-actors-begin.loca.lt",
    "pleasant-maintained-circuit-johnny.trycloudflare.com",
    "icy-otters-kneel.loca.lt",
    "rather-dennis-amount-recommended.trycloudflare.com",
    "legislation-formed-thickness-lbs.trycloudflare.com",
    ...dynamicOrigins,
  ],
  /* config options here */
};

export default nextConfig;
