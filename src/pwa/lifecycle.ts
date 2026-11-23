import { saves } from "../db";
import { prepareUpdate, releaseUpdate, setUpdateTarget } from "./write-barrier";
export async function activateSafely(
  worker: ServiceWorker,
  lockUI: (locked: boolean) => void,
) {
  await prepareUpdate(async () => {
    window.dispatchEvent(new Event("zaad:flush"));
    await saves.drain();
  }, lockUI);
  try {
    await new Promise<void>((resolve, reject) => {
      const channel = new MessageChannel();
      const timeout = setTimeout(() => {
        channel.port1.close();
        reject(Error("update.pending"));
      }, 8000);
      channel.port1.onmessage = (event) => {
        if (event.data?.ready) {
          clearTimeout(timeout);
          try {
            setUpdateTarget(event.data.buildId);
            channel.port1.postMessage({ type: "COMMIT" });
          } catch (error) {
            channel.port1.close();
            reject(error);
          }
          // No timeout/unfreeze after COMMIT: a delayed activation must never race new edits.
          return;
        }
        clearTimeout(timeout);
        channel.port1.close();
        event.data?.ok
          ? resolve()
          : reject(Error(event.data?.reason || "update.failed"));
      };
      worker.postMessage({ type: "ZAAD_SAFE_ACTIVATE" }, [channel.port2]);
    });
    // Remain frozen until the controller change reloads the current document.
  } catch (error) {
    releaseUpdate(lockUI);
    throw error;
  }
}
