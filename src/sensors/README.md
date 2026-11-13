# Sensing hook

`useSensing({ enabled, onEvent })` subscribes to accelerometer samples while
enabled and runs the orientation and pickup detectors. It calls `onEvent` for
each `SensorEvent` emitted by either detector. Detector internals are held in
refs, so ordinary samples do not trigger renders.

The hook returns `{ orientation, pickupCount }`. Orientation starts at
`'other'`, and the pickup count starts at zero; both detector states and
returned values reset whenever sensing is enabled. While enabled, the hook
keeps the screen awake under its own tag and releases that tag when disabled
or unmounted.
