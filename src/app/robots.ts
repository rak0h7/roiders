import type { MetadataRoute } from "next";
import { buildRobotsMetadata } from "@/lib/robots";

export default function robots(): MetadataRoute.Robots {
  return buildRobotsMetadata();
}