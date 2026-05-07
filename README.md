# Phoenix Pilot

Phoenix Pilot is a Chrome extension that adds a Phoenix-powered reply assistant to LinkedIn messaging. It is scoped to LinkedIn DMs: the old local OpenAI/Anthropic/Gemini comment and post generation paths have been removed.

Authentication is handled by the Phoenix website. The extension does not store provider API keys, Phoenix bearer tokens, or user IDs in Chrome storage. After the user logs in to Phoenix in the browser, the extension calls Phoenix with cookie-authenticated requests.

## User Flow

1. Install the extension.
2. Open the extension Settings page.
3. Click **Open Phoenix Login** and log in to Phoenix.
4. Open LinkedIn Messaging.
5. Click the Phoenix reply button in the LinkedIn message composer.
6. Select a Phoenix session in the reply panel, or choose **No session - use Phoenix defaults**.
7. Optionally describe the goal for the reply.
8. Click **Suggest Reply**.
9. Refine the suggested reply if needed, then insert or copy it.

The selected session is remembered as a convenience, but session selection lives in the LinkedIn reply panel, not in Settings.

## What The Extension Does

- Detects LinkedIn Messaging pages and injects one reply-assistant button into the message composer.
- Scrapes the active LinkedIn conversation from the page.
- Lists Phoenix sessions for the logged-in Phoenix user.
- Syncs the conversation into the selected Phoenix session via `pilot-block`.
- Runs Phoenix's `linkedin_response` task.
- Can generate without selecting a session by asking Phoenix to create a temporary session from saved user defaults.
- Refines the generated `linkedin_response` artifact with concise follow-up instructions.
- Displays the generated reply and lets the user insert it into LinkedIn.

The extension does not inject comment-generation buttons into the feed and does not inject a post-generation assistant into LinkedIn post creation.

## Runtime Architecture

The content script owns LinkedIn page integration:

- `src/content/index.tsx` injects the LinkedIn Messaging button and renders the panel.
- `src/content/utils/messaging-scraper.ts` extracts the active conversation and inserts generated text back into LinkedIn.
- `src/content/components/MessagingPanel.tsx` loads Phoenix sessions, stores the selected session, collects the user's reply goal, and sends generation requests to the background service worker.

The background service worker owns Phoenix generation:

- `src/background/index.ts` handles `GENERATE_MESSAGES`, `CHECK_CONFIG`, and `OPEN_OPTIONS`.
- `src/utils/phoenix-client.ts` performs Phoenix API calls with `credentials: 'include'`.
- `src/utils/storage.ts` stores only the Phoenix API base URL and the last selected session ID/name.

The options and popup UIs are intentionally small:

- `src/options/App.tsx` checks Phoenix login state and lets developers override the Phoenix API base URL.
- `src/popup/App.tsx` shows whether Phoenix login is available and links to LinkedIn Messaging.

## Phoenix API Flow

The extension uses two generation modes.

### Selected Session

1. `GET /auth/me`

   Checks whether the browser has a valid Phoenix auth cookie.

2. `GET /api/v1/sessions`

   Lists sessions for the authenticated user. The selected session must have honest context configured.

3. `POST /api/v1/sessions/{session_id}/pilot-block`

   Sends the LinkedIn conversation as a contact-specific communication-history block:

   ```json
   {
     "username": "Jane Doe",
     "headline": "Recruiter at Example",
     "messages_text": "[10:00] Jane Doe: Hi...\n[10:05] Me: Thanks..."
   }
   ```

4. `POST /api/v1/sessions/{session_id}/tasks`

   Runs Phoenix's LinkedIn reply task:

   ```json
   {
     "task_id": "linkedin_response",
     "user_inputs": {
       "draft_content": "Ask for a short intro call"
     }
   }
   ```

The extension displays `artifact.text_payload`, falling back to compatible text fields if needed.

### No Session

When the user chooses **No session - use Phoenix defaults**, the background service worker calls:

```http
POST /api/v1/sessions/temporary-linkedin-response
```

Payload:

```json
{
  "username": "Jane Doe",
  "headline": "Recruiter at Example",
  "messages_text": "[10:00] Jane Doe: Hi...\n[10:05] Me: Thanks...",
  "draft_content": "Ask for a short intro call"
}
```

The Phoenix backend creates a temporary Phoenix Pilot session for the authenticated user, applies saved user defaults, stores the LinkedIn conversation as `communication_history`, and runs the same `linkedin_response` task. A saved default `requirements` value is required because it maps to the `honest_context` artifact. A saved default `resume` value is applied as `base_resume` when present.

The response includes `session_id` so the extension can refine the generated artifact:

```json
{
  "session_id": "uuid",
  "artifact": {
    "artifact_type": "linkedin_response",
    "text_payload": "Thanks Jane..."
  }
}
```

### Refinement

After a reply is generated, the panel can refine the current `linkedin_response` artifact:

```http
POST /api/v1/sessions/{session_id}/artifacts/linkedin_response/refine
```

Payload:

```json
{
  "instruction": "Make this much shorter. Keep it direct, warm, and natural."
}
```

Built-in refinement buttons currently target the common LinkedIn DM fixes: shorten the response, tune tone, and point to one relevant project or concrete experience from the user context.

## Authentication Contract

Phoenix backend routes still support bearer tokens for compatibility, but this extension uses cookie auth.

Expected cookies:

- `auth_access_token`: short-lived JWT access token, `HttpOnly`
- `auth_refresh_token`: long-lived JWT refresh token, `HttpOnly`

Extension requests use:

```ts
fetch(url, {
  credentials: 'include',
});
```

Backend requirements:

- `GET /auth/me` must accept the `auth_access_token` cookie.
- Protected `/api/v1/*` session/task routes must accept the access cookie.
- OAuth callback should set both auth cookies after successful login.
- `/auth/refresh` should accept the refresh cookie and rotate/set a new access cookie.
- `/auth/logout` should clear both cookies.
- CORS must allow the extension origin and credentials.

Production cookie defaults:

- `HttpOnly`
- `Secure`
- `SameSite=None`
- `Path=/`

Local development may use non-secure `SameSite=Lax` cookies for `localhost`.

## Extension Settings

Settings contains only Phoenix connection controls:

- Phoenix API base URL, defaulting to `https://api.phoenix0.online`
- Login status check
- Button to open the Phoenix login page

There are no provider API-key settings, model selectors, Phoenix bearer-token fields, Phoenix user-ID fields, persona fields, comment settings, post settings, or global active-session selector.

For local development, set the API base URL to a local backend such as:

```text
http://localhost:8000
```

The login button maps a local API URL on port `8000` to the Phoenix webapp on port `5173`.

## Installation

Install dependencies:

```bash
npm install
```

Build the extension:

```bash
npm run build
```

Load the built extension:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select `phoenix_pilot_ready_for_chrome/`.

## Development

Useful commands:

```bash
npm run dev      # Vite dev build
npm run build    # Production extension build
npm run preview  # Preview built assets
npm run zip      # Build and package extension zip
```

The root extension package currently has no dedicated frontend test runner. Use `npm run build` as the baseline verification.

Backend syntax check used for touched Phoenix Python files:

```bash
python3 -m py_compile \
  .phoenix/phoenix-job-assistant/src/phoenix_job_assistant/interfaces/api/v1/auth.py \
  .phoenix/phoenix-job-assistant/src/phoenix_job_assistant/interfaces/api/deps.py \
  .phoenix/phoenix-job-assistant/src/phoenix_job_assistant/interfaces/api/app.py
```

## Troubleshooting

**No sessions available**

- Confirm you are logged in to Phoenix in the same browser profile.
- Open extension Settings and click **Check Login**.
- Confirm the Phoenix API base URL points to the backend that owns your login cookies.
- Confirm the backend allows credentialed requests from the Chrome extension origin.
- You can still choose **No session - use Phoenix defaults** if Phoenix login works and user defaults are saved.

**Generate fails with missing honest context**

- Open the selected Phoenix session in the Phoenix webapp.
- Add or update honest job preferences/context.
- For no-session generation, save honest job preferences as the default `requirements` value in Phoenix.
- Retry generation from LinkedIn Messaging.

**Login works on the website but not in the extension**

- Confirm cookies are set for the API domain, not only the webapp domain.
- In production, cookies used by extension requests must be `SameSite=None; Secure`.
- Confirm CORS responses include both `Access-Control-Allow-Origin: chrome-extension://...` and `Access-Control-Allow-Credentials: true`.

**Reply button does not appear**

- Confirm the current page is LinkedIn Messaging, not the feed.
- Refresh the LinkedIn tab after loading or updating the extension.
- Check that the content script is loaded for `https://www.linkedin.com/*`.

## Removed Features

The following legacy LiPilot/Phoenix Pilot surfaces have been removed from the extension:

- LinkedIn feed comment generation
- Comment refinement
- Local persona learning
- Image analysis
- LinkedIn post generation
- OpenAI, Anthropic, and Gemini direct API calls
- Provider API-key storage
- Manual Phoenix bearer-token storage

## License

MIT License. See [LICENSE](LICENSE).
