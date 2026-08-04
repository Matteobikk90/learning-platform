import "dotenv/config";

import { isMuxNotFoundError } from "@/functions/mux/is-mux-not-found-error";
import { createScriptClients } from "@/functions/scripts/create-script-clients";
import { getScriptDryRun } from "@/functions/scripts/get-script-dry-run";

const dryRun = getScriptDryRun(process.argv);
const { mux, pool, prisma } = createScriptClients();

async function main() {
  if (dryRun) console.log("Modalità dry-run: nessuna modifica verrà applicata.\n");

  const modules = await prisma.module.findMany({
    where: { videoPlaybackId: { not: null } },
    select: { id: true, title: true, videoPlaybackId: true, muxAssetId: true },
  });

  console.log(`Moduli con un video collegato: ${modules.length}`);

  let cleared = 0;
  const unverifiable: string[] = [];

  for (const courseModule of modules) {
    const label = `"${courseModule.title}" (${courseModule.id})`;

    if (!courseModule.muxAssetId) {
      unverifiable.push(label);
      continue;
    }

    try {
      await mux.video.assets.retrieve(courseModule.muxAssetId);
      continue;
    } catch (error) {
      if (!isMuxNotFoundError(error)) throw error;
    }

    if (dryRun) {
      console.log(
        `[dry-run] ${label}: asset ${courseModule.muxAssetId} assente su Mux, azzererei il video`
      );
      continue;
    }

    const updated = await prisma.module.updateMany({
      where: { id: courseModule.id, videoPlaybackId: courseModule.videoPlaybackId },
      data: {
        videoPlaybackId: null,
        videoPlaybackPolicy: "PUBLIC",
        muxAssetId: null,
        muxUploadId: null,
        videoError: null,
        durationSeconds: 0,
      },
    });

    if (updated.count > 0) {
      cleared += 1;
      console.log(`${label}: video azzerato, pronto per un nuovo caricamento`);
    }
  }

  if (unverifiable.length > 0) {
    console.log(
      `\nNon verificabili (nessun asset ID salvato, lasciati intatti):\n  ${unverifiable.join("\n  ")}`
    );
  }

  console.log(`\nCompletato: ${cleared} moduli ripuliti.`);
}

main()
  .catch((error) => {
    console.error("Pulizia interrotta:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
