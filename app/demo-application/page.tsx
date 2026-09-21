"use client";

import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, LockKeyhole, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

export default function DemoApplication() {
  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink">
          <ArrowLeft className="size-4" /> Back to decision trace
        </Link>
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-panel shadow-[0_18px_60px_rgba(25,24,21,0.08)]">
          <header className="flex flex-col justify-between gap-4 border-b border-ink/10 bg-ink p-6 text-paper sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-signal">
                <BriefcaseBusiness className="size-3.5" /> Northstar Systems
              </div>
              <h1 className="text-2xl font-bold tracking-[-0.035em]">Senior Delivery Manager</h1>
              <p className="mt-1 text-sm text-paper/55">Fictional application · ApplyGuard demonstration</p>
            </div>
            <span className="flex w-fit items-center gap-2 rounded-full border border-paper/15 px-3 py-1.5 text-xs text-paper/70">
              <ShieldCheck className="size-3.5 text-mint" /> No submission enabled
            </span>
          </header>

          <form className="p-6 sm:p-8" onSubmit={(event) => event.preventDefault()}>
            <section>
              <h2 className="text-base font-bold">Contact details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field id="full-name" label="Full name"><Input id="full-name" name="full_name" autoComplete="name" /></Field>
                <Field id="email" label="Email"><Input id="email" name="email" type="email" autoComplete="email" /></Field>
                <Field id="phone" label="Phone"><Input id="phone" name="phone" type="tel" autoComplete="tel" /></Field>
                <Field id="location" label="Location"><Input id="location" name="location" /></Field>
              </div>
            </section>

            <section className="mt-8 border-t border-ink/10 pt-7">
              <h2 className="text-base font-bold">Eligibility</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field id="experience" label="Years of experience">
                  <Input id="experience" name="experience" placeholder="For example, 9+ years" />
                </Field>
                <Field id="employers" label="Employers in the last 10 years"><Input id="employers" name="employers" inputMode="numeric" /></Field>
                <Field id="gender" label="Gender (optional)">
                  <NativeSelect id="gender" name="gender" defaultValue="">
                    <NativeSelectOption value="">Prefer not to answer</NativeSelectOption>
                    <NativeSelectOption value="female">Female</NativeSelectOption>
                    <NativeSelectOption value="male">Male</NativeSelectOption>
                    <NativeSelectOption value="nonbinary">Non-binary</NativeSelectOption>
                  </NativeSelect>
                </Field>
                <Field id="notice" label="Notice period"><Input id="notice" name="notice" /></Field>
              </div>
            </section>

            <section className="mt-8 border-t border-ink/10 pt-7">
              <h2 className="text-base font-bold">Candidate statement</h2>
              <p className="mt-1 text-sm text-muted-foreground">This answer must be written by the candidate.</p>
              <div className="mt-4"><Label htmlFor="statement" className="mb-2">Why are you interested in this role?</Label><Textarea id="statement" name="statement" rows={4} /></div>
            </section>

            <section className="mt-8 border-t border-ink/10 pt-7">
              <div className="flex items-start gap-3 rounded-xl border border-signal/50 bg-signal/10 p-4">
                <Checkbox id="privacy-consent" name="privacy_consent" />
                <div>
                  <Label htmlFor="privacy-consent" className="font-semibold">I acknowledge the privacy policy</Label>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">A human must review and accept this statement. ApplyGuard never checks it automatically.</p>
                </div>
              </div>
            </section>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" /> Demo forms cannot be submitted.</p>
              <Button type="submit" disabled className="h-11 bg-ink px-6 text-paper">Submit application</Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div><Label htmlFor={id} className="mb-2">{label}</Label>{children}</div>;
}
