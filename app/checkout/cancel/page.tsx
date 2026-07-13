import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="card w-full px-10 py-14">
        <p className="label-upper">Pagamento annullato</p>

        <h1 className="font-display mt-4 text-5xl text-white">
          Nessun addebito effettuato
        </h1>

        <p className="mt-6 text-muted">
          Puoi tornare al catalogo corsi in qualsiasi momento.
        </p>

        <div className="mt-10 flex justify-center">
          <Link href="/" className="btn-primary">
            Torna ai corsi
          </Link>
        </div>
      </div>
    </main>
  );
}
