"use client";

import { useEffect, useState } from "react";

interface Contact {
  id: string;
  firstName: string;
  email: string;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/contacts");
    const data = await response.json();
    if (response.ok) setContacts(data.contacts);
  }

  useEffect(() => {
    // Loads contact rows once when the admin opens this client screen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  async function addContact() {
    setError("");
    const response = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, email }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not add contact");
      return;
    }
    setContacts((current) => [...current.filter((contact) => contact.id !== data.contact.id), data.contact]);
    setFirstName("");
    setEmail("");
  }

  async function remove(id: string) {
    await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
    setContacts((current) => current.filter((contact) => contact.id !== id));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Contacts</h1>
        <p className="mt-2 text-slate-600">Store parent first name and email only.</p>
        <div className="mt-6 space-y-3">
          <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="min-h-11 w-full rounded-md border border-slate-300 px-3" placeholder="Parent first name" />
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-11 w-full rounded-md border border-slate-300 px-3" placeholder="Parent email" />
          {error && <div className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
          <button onClick={addContact} className="min-h-11 rounded-md bg-teal-700 px-4 py-3 font-semibold text-white">
            + Add contact
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4 font-semibold">Parent contacts</div>
        <div className="divide-y divide-slate-100">
          {contacts.length === 0 ? (
            <div className="px-5 py-10 text-slate-600">No contacts yet.</div>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-slate-950">{contact.firstName}</div>
                  <div className="text-sm text-slate-500">{contact.email}</div>
                </div>
                <button onClick={() => remove(contact.id)} className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
                  Delete contact
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
