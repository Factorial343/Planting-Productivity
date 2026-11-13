# Events

| Event | Producer | Consumer | When it fires |
|---|---|---|---|
| `ORIENTATION_CHANGED` | Lane A sensing | Lane A detection | Device orientation changes |
| `PICKUP_DETECTED` | Lane A sensing | Lane B session layer | A pickup is detected |
| `ENTERED_CAMPUS` | Lane B location | Lane B session layer | Location enters a campus geofence |
| `LEFT_CAMPUS` | Lane B location | Lane B session layer | Location leaves the active campus geofence |
| `START` | User interface (Lane C) | Lane B session reducer | User starts a session |
| `TICK` | Lane B timer | Lane B session reducer | Session timer advances |
| `PICKUP` | Lane B session layer | Lane B session reducer | `PICKUP_DETECTED` arrives while focusing |
| `PROMPT_ANSWERED` | User interface (Lane C) | Lane B session reducer | User answers the pickup prompt |
| `PAUSE` | User interface (Lane C) | Lane B session reducer | User manually pauses |
| `RESUME` | User interface (Lane C) | Lane B session reducer | User resumes a paused session |
| `END` | User interface or Lane B session layer | Lane B session reducer | User or system ends the session |

## Happy path

1. The user starts a session; Lane B handles `START`.
2. The timer sends `TICK` events while the session is focusing.
3. Lane A detects a pickup and emits `PICKUP_DETECTED`; Lane B sends `PICKUP`.
4. The timer pauses and the pickup prompt appears.
5. The user answers `PROMPT_ANSWERED`: `done` ends the session, or `keep_going` resumes it.
6. On session end, Lane C saves it via `SessionsRepo.insert`.
7. Home and Goals update from the saved session and goal data.

## File ownership

| Lane | Owns |
|---|---|
| A | `src/sensors/`, `src/detection/` (faceDown, pickup) |
| B | `src/session/`, `src/notifications/`, `src/detection/geofence.ts`, `src/location/` |
| C | `src/db/`, `src/avatar/`, `src/screens/`, `src/components/`, `App.tsx`, `src/mockData.ts` |

Changes to `src/types.ts` require approval from all three teammates on the pull request.
