---
name: video-motion-prompt-cn
description: Analyze a reference video frame by frame and generate one production-ready Chinese video-generation prompt that transfers its acting, expressions, choreography, blocking, and camera behavior to supplied character and background references. Use when users provide a source video plus character/background images and ask for a Chinese prompt, motion transfer, dance recreation, or diagnosis/improvement of a generated result.
---

# 中文视频动作提示词

Use this workflow for every request. Output one Chinese prompt only unless the user asks for analysis or revision notes.

## 1. Inspect the source video

- Run `scripts/extract_video_frames.py` with 12 evenly spaced frames for an overview.
- For any fast acting, facial reaction, prop mime, or transition, rerun with 24–36 samples. Do not describe the action from a filename or a few broad frames.
- Identify: subject count; each subject's left/right position; entrances/exits; exact action sequence; facial reactions; interaction; stance/contact; camera moves; and cuts.
- Compare the number of source subjects and supplied character references. Ask the user how to map a missing or extra subject before drafting.
- Build an evidence-based beat sheet before drafting: tie every meaningful change in pose, paw path, interaction, blocking, camera framing, camera motion, shake, zoom, pan, tilt, and cut to an approximate time range. Sample densely enough to resolve quick beats.
- The transfer prompt must literally reproduce that beat sheet in order. Never replace observed choreography or camera behavior with generic wording such as `同款跳舞`、`复刻原视频动作`、`随节奏摆动` or `保持原运镜`.

## 2. Map references and eliminate conflicts

- State which image is the only background reference and which image defines each target character.
- Assign every source subject to exactly one target character and preserve its side of frame unless the source changes it.
- Treat a supplied character pose as an appearance reference, not as the desired locomotion.
- If the source action is bipedal or human-like, state explicitly: both hind paws bear weight; front paws are hands only; front paws never touch the ground; no four-legged walk, crawl, or cat gait. If four-legged motion is desired, state that instead.

## 3. Write the prompt by stages

Use sequential phrases such as `开场`, `随后`, `中段`, `后段`, and `结尾`. For each stage, specify:

- each character's action separately;
- body orientation, paw/arm path, position, and whether it is stationary or moving;
- facial expression and reaction to the other character;
- allowed contact and pose constraints.

Describe important mime actions literally (for example, `假装握住不可见喷雾瓶并连续按压喷头`), not with vague labels such as `做表演`.

### Source-fidelity requirement

- Include all material source beats in chronological order before adding any user-requested extension. For each beat, name the active character, starting and ending paw positions, paw path, torso/head direction, foot support, screen position, expression/reaction, and whether feet move.
- Describe camera behavior as its own explicit sequence: starting framing and angle, whether it is locked-off or moving, every observed push-in/pull-back/pan/tilt/tracking/shake/cut, its timing, and what remains centered. If the source camera is fixed, say `全程固定……机位` explicitly; do not invent motion.
- An added ending or story beat must occur only after the source choreography is complete. State the transition, preserve identities and staging until the transition, then specify how the added event changes pose/camera. It must not replace, abbreviate, or silently alter any source beat.
- If the target background creates a perspective conflict (for example, a source is front-facing and the target is a moving car hood), retain the source's explicit framing rhythm where possible and spell out the necessary compatible camera constraint instead of omitting camera instructions.

## 4. Add environment, camera, and negative constraints

- Preserve required physical contact, shadows, reflections, occlusion, and the background's motion reference frame.
- Preserve the source camera behavior only where compatible with the target scene. If the source subject leans toward the camera, say `上身前探` rather than allowing uncontrolled camera zoom.
- End with concise, specific prohibitions addressing the likely failure modes: missing story beat, missing reaction, four-legged movement, front-paw support, unwanted walking, identity mixing, extra limbs, static/deformed background, text, logo, watermark, cuts, or unwanted camera motion.

### Vehicle-motion priority

When the user requires a moving vehicle, overtaking, or another background event, make it a first-priority sentence before the character choreography. Do not bury it at the end of the prompt.

- State the persistent visible evidence of motion: the vehicle is continuously travelling; near lane markings, guardrails, lights, traffic, and scenery move with correct depth and direction; vehicle foreground has appropriate vibration; the background must not freeze.
- For each overtaking event, attach it to a unique source-action beat and specify a relative time or story stage. Describe the full continuous chain: approach the named vehicle, change lane or accelerate, travel alongside, pass it, then leave it visibly behind. Require the sequence to last long enough to be seen; prohibit jump cuts, teleporting, or speed-blur as a substitute.
- If the targets dance or stand on the vehicle, lock their paws, shadows, reflections, and occlusion to the vehicle's motion reference frame throughout acceleration and overtaking. They must not drift, slide, float, or change pose merely because the vehicle moves.
- Resolve camera conflicts explicitly: preserve only the compatible source camera qualities (for example, mild shake and framing rhythm), while keeping the target vehicle's first-person travelling perspective. Do not require a static source camera when the target scene must visibly travel.

## Revision workflow

When the user provides a generated video and says it is inaccurate, extract frames from both the source and generated videos. Identify the missed beats and write a replacement prompt that makes those beats explicit; do not merely intensify generic phrases such as `完整复刻动作`.

## Frame extraction

Run the bundled script with the workspace Python runtime. It requires `imageio-ffmpeg`; if missing, install it only after user approval.

```powershell
python scripts/extract_video_frames.py "C:\path\source.mp4" --output "C:\path\frames" --samples 24
```
