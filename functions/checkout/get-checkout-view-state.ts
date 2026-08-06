import type {
  CheckoutViewState,
  CheckoutViewStateInput,
} from "@/types/checkout";

export function getCheckoutViewState({
  isFulfilled,
  sessionStatus,
}: CheckoutViewStateInput): CheckoutViewState {
  if (isFulfilled) return "ready";

  if (sessionStatus !== null && sessionStatus !== "complete") {
    return "notCompleted";
  }

  return "processing";
}
