import type {
  CheckoutViewState,
  CheckoutViewStateInput,
} from "@/types/checkout";

export function getCheckoutViewState({
  isFulfilled,
  isRefunded = false,
  sessionStatus,
}: CheckoutViewStateInput): CheckoutViewState {
  if (isRefunded) return "refunded";
  if (isFulfilled) return "ready";

  if (sessionStatus !== null && sessionStatus !== "complete") {
    return "notCompleted";
  }

  return "processing";
}
