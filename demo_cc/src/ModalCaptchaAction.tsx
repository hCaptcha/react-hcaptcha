import { useId, useRef, useState } from 'react';
import HCaptcha from '@hcaptcha-react/lib';

interface Props {
  sitekey: string;
  dismissOnBackdrop?: boolean;
  onVerified?: (token: string) => Promise<void>;
}

export default function ModalCaptchaAction({
  sitekey,
  dismissOnBackdrop = false,
  onVerified,
}: Props) {
  const captchaRef = useRef<HCaptcha>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const challengeId = useId();
  const titleId = `${challengeId}-title`;
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit() {
    const captcha = captchaRef.current;
    const dialog = dialogRef.current;
    if (!captcha || !dialog || busy) return;

    setBusy(true);
    setMessage('');

    try {
      captcha.resetCaptcha();
      dialog.showModal();
      const { response: token } = await captcha.execute({ async: true });
      dialog.close();
      await onVerified?.(token);
      setMessage('Verification completed.');
    } catch {
      setMessage('Verification cancelled or failed. Please retry.');
    } finally {
      dialog.close();
      setBusy(false);
    }
  }

  return (
    <>
      <button disabled={!ready || busy} onClick={handleSubmit}>
        {busy ? 'Working…' : 'Verify'}
      </button>

      <dialog
        ref={dialogRef}
        className="captcha-dialog"
        aria-labelledby={titleId}
        onClick={(event) => {
          if (dismissOnBackdrop && event.target === event.currentTarget) {
            captchaRef.current?.resetCaptcha();
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          if (dismissOnBackdrop) captchaRef.current?.resetCaptcha();
        }}
      >
        <div className="captcha-dialog-content">
          <h2 id={titleId}>Complete verification</h2>
          <div id={challengeId} />
        </div>
      </dialog>

      <HCaptcha
        ref={captchaRef}
        sitekey={sitekey}
        size="invisible"
        challenge-container={challengeId}
        onReady={() => setReady(true)}
      />

      <p role="status">{message}</p>
    </>
  );
}
