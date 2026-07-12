# Avatar Asset Intake

Place the supplied control-center avatar at:

```text
public/avatar/control-center-avatar.png
```

Expected asset:
- Transparent PNG preferred.
- Portrait/cutout composition, centered, facing forward or three-quarter.
- Keep the filename stable so the dashboard can load it at `/avatar/control-center-avatar.png`.

Fallback behavior:
- If the file is missing or unsupported, the home stage keeps rendering the existing lightweight runtime scene.
- The real asset overlays that scene when available, preserving the current dark-tech stage composition.
