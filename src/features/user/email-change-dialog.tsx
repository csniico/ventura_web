"use client";

import { useState } from "react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { emailSchema } from "@/features/auth/schemas";
import { useRequestEmailChange, useConfirmEmailChange } from "./hooks";

export function EmailChangeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const request = useRequestEmailChange();
  const confirm = useConfirmEmailChange();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [code, setCode] = useState("");

  function reset() {
    setStep("email");
    setEmail("");
    setCode("");
    setEmailError(null);
  }

  function close() {
    reset();
    onClose();
  }

  function submitEmail() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message ?? "Enter a valid email");
      return;
    }
    setEmailError(null);
    request.mutate(parsed.data, { onSuccess: () => setStep("code") });
  }

  function submitCode(value: string) {
    confirm.mutate(value, { onSuccess: close });
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Change email"
      description={
        step === "email"
          ? "We'll send a 6-digit code to the new address to confirm it's yours."
          : `Enter the code we sent to ${email}.`
      }
    >
      {step === "email" ? (
        <div className="space-y-4">
          <Field label="New email address" error={emailError ?? undefined}>
            {({ id, invalid }) => (
              <Input
                id={id}
                invalid={invalid}
                type="email"
                autoFocus
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
          </Field>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button onClick={submitEmail} loading={request.isPending}>
              Send code
            </Button>
          </DialogFooter>
        </div>
      ) : (
        <div className="space-y-4">
          <OtpInput value={code} onChange={setCode} onComplete={submitCode} invalid={confirm.isError} />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setStep("email")}>
              Back
            </Button>
            <Button onClick={() => submitCode(code)} loading={confirm.isPending} disabled={code.length < 6}>
              Confirm
            </Button>
          </DialogFooter>
        </div>
      )}
    </Dialog>
  );
}
