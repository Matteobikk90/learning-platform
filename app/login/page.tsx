"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    await signIn("email", {
      email,
      callbackUrl: "/profile",
    });
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <span className="label-upper text-center">Accesso</span>

      <h1 className="page-title leading-[1.15] mb-3 text-center">Bentornato</h1>

      <p className="text-sm text-muted text-center mb-10 leading-relaxed">
        Inserisci la tua email per ricevere il link di accesso.
      </p>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@esempio.com"
              className="form-input"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Invia link magico
          </button>
        </form>
      </div>
    </main>
  );
}
