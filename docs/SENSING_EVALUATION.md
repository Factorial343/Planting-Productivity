# Sensing Evaluation

## Status

This document records physical-phone sensing evaluation results. Unit tests and detector implementation are complete, but real-device false-positive/false-negative rates must be filled only from labeled recording data.

## Scenarios

Collect at least 20 labeled trials per scenario, with an independent ground-truth mark:

| Scenario | Expected result | Trials | False positives | False negatives | Notes |
|---|---|---:|---:|---:|---|
| Desk bump | No pickup | TBD | TBD | TBD | Short impact/desk vibration |
| Pocket | No pickup, except actual pickup motion | TBD | TBD | TBD | Walking and reaching |
| Walking | No pickup | TBD | TBD | TBD | Normal pocket and handheld walking |
| Intentional pickup | Pickup detected | TBD | N/A | TBD | Lift from a resting surface |
| Flat face-up | Continue timer | TBD | TBD | TBD | 10-second timer test |
| Flat face-down | No pickup prompt | TBD | TBD | TBD | 10-second orientation confirmation |

## Metrics

Record these values in the presentation:

- False-positive rate = false pickups / non-pickup trials
- False-negative rate = missed pickups / actual-pickup trials
- Pickup detection latency = detector timestamp - ground-truth pickup mark
- Face-down prompt count = face-down placements that incorrectly opened the prompt
- Desk-bump rejection count = desk bumps that did not open the prompt

## Collection Procedure

1. Open Goals -> Demo Tools -> Debug Screens -> Sensor Debug.
2. Select the scenario.
3. Select the ground truth: actual pickup or no pickup.
4. Press Start Trial. This creates a unique trial ID and resets the pickup and orientation detectors.
5. Reproduce the scenario.
6. Press Mark event at the known action boundary.
7. Stop recording.
8. Share CSV and retain the original file for the presentation.

The one-trial CSV contains `SENSOR`, `MARK`, `EVENT`, and `RESULT` rows. Sensor rows include the trial ID, scenario, ground truth, relative millisecond timestamp, x/y/z acceleration, magnitude, and detected/not-detected status.

## Threshold Evidence

The current pickup thresholds are implementation values and must remain provisional until real recordings support a change:

| Setting | Current value |
|---|---:|
| Resting threshold | 0.4 m/s² |
| Resting duration | 1500 ms |
| Pickup threshold | 1.5 m/s² |
| Pickup duration | 400 ms |
| Pickup cooldown | 5000 ms |
| Face-down confirmation | 10000 ms |

No tuning conclusion should be based on simulator data alone.
