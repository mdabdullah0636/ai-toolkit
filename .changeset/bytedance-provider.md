---
'@ai-toolkit/bytedance': patch
---

Add the ByteDance provider (`@ai-toolkit/bytedance`) with Seedance video and Seedream image model support.

- `byteDance.video()` creates a V4 video model for Seedance (text-to-video, image-to-video, first/last frame, reference inputs, audio generation). The task-based `doStart`/`doStatus` flow passes `aspectRatio` through as `ratio`, including `'adaptive'` for input-ratio-driven image-to-video, editing, and extension.
- `byteDance.image()` creates a V4 image model for Seedream (text-to-image, image editing, multi-image blending).
- Includes provider-specific options (`ByteDanceVideoModelOptions`, `ByteDanceImageModelOptions`) via `providerOptions.bytedance`.
