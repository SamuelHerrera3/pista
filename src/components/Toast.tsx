import { usePista } from "../store";

export function Toast() {
  const { toastState } = usePista();
  return (
    <div className={`toast${toastState.show ? " show" : ""}`} role="status" aria-live="polite">
      {toastState.msg}
    </div>
  );
}
