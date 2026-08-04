import { MAGIC_LINK_MAX_AGE_MINUTES } from "@/constants/auth";

export default function VerifyRequestPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-ocean/10 flex items-center justify-center mx-auto mb-6">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2.5 5.5L10 11L17.5 5.5M3 15h14a1 1 0 001-1V6a1 1 0 00-1-1H3a1 1 0 00-1 1v8a1 1 0 001 1z"
            stroke="currentColor"
            className="text-ocean"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="page-title text-[2.5rem] mb-3">Controlla la tua email</h1>

      <p className="text-muted leading-relaxed">
        Ti abbiamo inviato un link sicuro per accedere.
        <br />
        Controlla la tua casella di posta: il link è valido per{" "}
        {MAGIC_LINK_MAX_AGE_MINUTES} minuti.
      </p>
    </main>
  );
}
