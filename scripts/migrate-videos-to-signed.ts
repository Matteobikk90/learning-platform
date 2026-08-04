import "dotenv/config";

import { isMuxNotFoundError } from "@/functions/mux/is-mux-not-found-error";
import { createScriptClients } from "@/functions/scripts/create-script-clients";
import { getScriptDryRun } from "@/functions/scripts/get-script-dry-run";

const dryRun = getScriptDryRun(process.argv);
const { mux, pool, prisma } = createScriptClients({
  requireMuxSigning: true,
});

async function migratePublicModules() {
  const modules = await prisma.module.findMany({
    where: {
      videoPlaybackPolicy: "PUBLIC",
      videoPlaybackId: { not: null },
      muxAssetId: { not: null },
    },
    select: { id: true, title: true, videoPlaybackId: true, muxAssetId: true },
  });

  console.log(`Moduli con playback pubblico da migrare: ${modules.length}`);

  let migrated = 0;

  for (const courseModule of modules) {
    const assetId = courseModule.muxAssetId!;
    const publicPlaybackId = courseModule.videoPlaybackId!;
    const label = `"${courseModule.title}" (${courseModule.id})`;

    if (dryRun) {
      console.log(`[dry-run] ${label}: firmerei l'asset ${assetId}`);
      continue;
    }

    let signed;

    try {
      signed = await mux.video.assets.createPlaybackId(assetId, {
        policy: "signed",
      });
    } catch (error) {
      if (isMuxNotFoundError(error)) {
        console.warn(
          `${label}: l'asset ${assetId} non esiste più su Mux, salto (usa "pnpm videos:reset" per ripulire il modulo)`
        );
        continue;
      }
      throw error;
    }

    if (!signed.id) {
      console.error(`${label}: Mux non ha restituito il playback ID firmato`);
      continue;
    }

    const updated = await prisma.module.updateMany({
      where: { id: courseModule.id, videoPlaybackId: publicPlaybackId },
      data: { videoPlaybackId: signed.id, videoPlaybackPolicy: "SIGNED" },
    });

    if (updated.count === 0) {
      console.warn(`${label}: modulo cambiato nel frattempo, annullo`);
      await mux.video.assets.deletePlaybackId(assetId, signed.id);
      continue;
    }

    await mux.video.assets.deletePlaybackId(assetId, publicPlaybackId);
    migrated += 1;
    console.log(`${label}: migrato (${publicPlaybackId} → ${signed.id})`);
  }

  return migrated;
}

async function removeLeftoverPublicIds() {
  const signedModules = await prisma.module.findMany({
    where: { videoPlaybackPolicy: "SIGNED", muxAssetId: { not: null } },
    select: { id: true, title: true, videoPlaybackId: true, muxAssetId: true },
  });

  let removed = 0;

  for (const courseModule of signedModules) {
    let asset;

    try {
      asset = await mux.video.assets.retrieve(courseModule.muxAssetId!);
    } catch (error) {
      if (isMuxNotFoundError(error)) {
        console.warn(
          `"${courseModule.title}": l'asset ${courseModule.muxAssetId} non esiste più su Mux, salto (usa "pnpm videos:reset" per ripulire il modulo)`
        );
        continue;
      }
      throw error;
    }

    const leftovers = (asset.playback_ids ?? []).filter(
      ({ id, policy }) => policy === "public" && id !== courseModule.videoPlaybackId
    );

    for (const leftover of leftovers) {
      if (dryRun) {
        console.log(
          `[dry-run] "${courseModule.title}": rimuoverei il playback pubblico residuo ${leftover.id}`
        );
        continue;
      }

      await mux.video.assets.deletePlaybackId(asset.id, leftover.id!);
      removed += 1;
      console.log(
        `"${courseModule.title}": rimosso playback pubblico residuo ${leftover.id}`
      );
    }
  }

  return removed;
}

async function main() {
  if (dryRun) console.log("Modalità dry-run: nessuna modifica verrà applicata.\n");

  const migrated = await migratePublicModules();
  const removed = await removeLeftoverPublicIds();

  console.log(
    `\nCompletato: ${migrated} moduli migrati, ${removed} playback pubblici residui rimossi.`
  );
}

main()
  .catch((error) => {
    console.error("Migrazione interrotta:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
