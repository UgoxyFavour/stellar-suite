import sharp from "sharp";
import { resolve } from "path";

const iconPath = resolve("./public/icon.png");
const out192 = resolve("./public/pwa-192x192.png");
const out512 = resolve("./public/pwa-512x512.png");

async function generate() {
  await sharp(iconPath).resize(192, 192).toFile(out192);
  console.log("Generated 192x192 icon");
  await sharp(iconPath).resize(512, 512).toFile(out512);
  console.log("Generated 512x512 icon");
}

generate().catch(console.error);
