# Zundamon Dance 🌱

A head-tracked virtual window looking into a small 3D park with a dancing VRM character.

## Quick start
1. Add your legally usable VRM to `models/Zundamon.vrm` in this repository (GitHub's web upload supports files up to 25 MiB; this model is about 18 MiB).
2. In repository **Settings → Pages**, select **Deploy from a branch**, branch **main**, folder **/(root)** and save.
3. Open https://hotate-pro.github.io/zundamondance/ (deployment may take a few minutes).
4. Click **顔追跡を開始**, grant camera permission, and look straight at the camera to calibrate. Use **視点リセット** to recalibrate. Mouse movement and wheel work without a camera.

The initial version uses procedural dance movement (not a downloaded dance motion), an entirely procedural park, Three.js, three-vrm and MediaPipe. No face images are sent to this repository. Face tracking uses an external MediaPipe model and CDN and needs a network connection. Head depth from one RGB camera is approximate. Screen width is initially assumed to be 53 cm; tune `W=.53` in `updateProjection` for your actual monitor.

## Known limitations
- VRM must be added separately: GitHub's text-only file connector cannot attach the uploaded binary model.
- Camera requires HTTPS or localhost and permission.
- Browser/CDN restrictions may prevent the optional face tracker from loading; mouse mode still works.
- This is a prototype. True physical-window alignment also requires measuring camera offset from screen center and monitor dimensions.
- Verify the original model's redistribution terms before publishing its VRM file publicly.
