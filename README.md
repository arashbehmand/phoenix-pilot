# Phoenix Pilot

Phoenix Pilot is a Chrome extension for job seekers using LinkedIn. It helps draft authentic comments, posts, and LinkedIn DMs while connecting message generation to a Phoenix Job Assistant session.

The extension keeps comment and post generation on the local bring-your-own-key LLM path. LinkedIn DM generation is routed through Phoenix so replies can use your resume, honest job preferences, and session communication history.

## What It Does

- **LinkedIn comments**: Generates scored comment options using your persona, preferred tone, language level, image analysis, and optional job-search context.
- **LinkedIn DMs**: Scrapes the active conversation, syncs it into Phoenix as a contact-specific communication-history block, then runs Phoenix's `linkedin_response` task.
- **LinkedIn posts**: Generates first-person LinkedIn posts from a topic, tone, and key points.
- **Persona learning**: Learns from edits you make to generated comments and applies those preferences later.
- **Phoenix session sync**: Preserves existing email threads, notes, and other context by replacing only the relevant LinkedIn contact block.

## Architecture

DM generation uses a two-step Phoenix flow:

1. `POST /api/v1/sessions/{session_id}/pilot-block`

   Syncs the LinkedIn conversation into the session's `communication_history` artifact:

   ```xml
   <phoenix-pilot-messages username="Jane Doe" headline="Recruiter at Google" updated="2026-05-06T10:00:00Z">
   [2026-05-06 10:00] Jane Doe: Hi, I came across your profile...
   [2026-05-06 10:05] Me: Thanks for reaching out.
   </phoenix-pilot-messages>
   ```

   If the same contact is synced again, Phoenix Pilot replaces that contact's block. Other contacts and existing email or note context are preserved.

2. `POST /api/v1/sessions/{session_id}/tasks`

   Runs:

   ```json
   {
     "task_id": "linkedin_response",
     "user_inputs": {
       "draft_content": "Ask for a short intro call"
     }
   }
   ```

   The returned `artifact.text_payload` is shown as the suggested LinkedIn reply.

## Setup

Install dependencies:

```bash
npm install
```

Build the extension:

```bash
npm run build
```

Load the generated `phoenix_pilot_ready_for_chrome/` directory as an unpacked extension in `chrome://extensions`.

## Extension Settings

Open the extension options page and configure:

- LLM provider, API key, model, persona, language level, emoji preference, and image analysis for comments and posts.
- Optional **Job Search Context** for subtle comment positioning.
- Phoenix base URL, bearer token, user ID, and active session for LinkedIn DM generation.

The selected Phoenix session must have honest context configured for `linkedin_response` to work well.

## Phoenix Backend

The backend endpoint lives in:

```text
.phoenix/phoenix-job-assistant/src/phoenix_job_assistant/interfaces/api/v1/routers.py
```

The focused backend tests live in:

```text
.phoenix/phoenix-job-assistant/tests/interfaces/api/v1/test_pilot_block.py
```

Run the targeted backend tests from `.phoenix/phoenix-job-assistant`:

```bash
uv run --with pytest --with pytest-asyncio --with aiosqlite --with aio-pika --with ../phoenix-lib pytest tests/interfaces/api/v1/test_pilot_block.py
```

## Frontend Tests

There is currently no frontend test harness for the root Chrome extension package:

- No `npm test` script.
- No Vitest, Jest, or Playwright config.
- No root extension `*.test.*` or `*.spec.*` files.

Current frontend verification is build-only:

```bash
npm run build
```

The separate Phoenix webapp under `.phoenix/phoenix-job-assistant-webapp/` does have its own Vitest and Playwright setup, but that is not the Chrome extension frontend.

## Useful Scripts

```bash
npm run dev      # Vite dev build
npm run build    # Production extension build
npm run preview  # Preview built assets
npm run zip      # Build and package extension zip
```

## Project Notes

- `src/utils/llm-client.ts` is still used for comments, posts, refinement, and persona learning.
- `src/utils/phoenix-client.ts` is used for Phoenix session listing, connection testing, communication-history sync, and DM reply generation.
- The extension build output is `phoenix_pilot_ready_for_chrome/`.

## Acknowledgement

Phoenix Pilot is built on top of LiPilot, the original open-source LinkedIn AI assistant. LiPilot provided the Chrome extension foundation, LinkedIn content-script integration, local LLM provider support, comment generation flow, messaging panel, popup, options UI, and build pipeline that Phoenix Pilot adapts for job-seeker workflows and Phoenix-powered DM generation.

## License

MIT License. See [LICENSE](LICENSE).
