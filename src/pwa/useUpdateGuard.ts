import { useEffect, useId } from "react";
import { registerUpdateGuard } from "./write-barrier";
export function useUpdateGuard(blocked: boolean, message = "update.failed") {
  const id = useId();
  useEffect(
    () =>
      registerUpdateGuard(id, () => {
        if (blocked) throw Error(message);
      }),
    [id, blocked, message],
  );
}
