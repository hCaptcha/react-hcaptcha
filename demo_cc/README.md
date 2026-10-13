# Custom challenge container demo

From the repo root:

```sh
pnpm setup
pnpm --filter @hcaptcha-react/demo-cc start
```

Open http://127.0.0.1:9001. The default sitekey is hCaptcha's public demo key. Use `?sitekey=YOUR_PUBLIC_SITEKEY` for your own key.

[`ModalCaptchaAction`](./src/ModalCaptchaAction.tsx) mounts the custom container before rendering hCaptcha and awaits `execute({ async: true })`. `dismissOnBackdrop` defaults to `false`, blocking backdrop clicks and Escape. Set it to `true` to cancel via `resetCaptcha()`. The native modal blocks background interaction in either mode.

```jsx
<ModalCaptchaAction
  sitekey={sitekey}
  dismissOnBackdrop={false}
  onVerified={async (token) => {
    const res = await fetch('/api/protected-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error('Submission failed');
  }}
/>
```

The demo only obtains a token. Your backend must verify it through [siteverify](https://docs.hcaptcha.com/#verify-the-response-token-server-side) before performing the protected action. Keep the secret key on the server.
