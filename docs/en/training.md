# Training

[← Overview](README.md)

HAFS has two areas: **Nutrition** (the diary as you know it) and **Training** (strength training: plans, exercises, history and weight suggestions). Both run in the same app in Home Assistant and share users, language and look. You record workouts with the [HAFS app](android.md) on your phone; the web interface shows them, and here you keep plans, gyms and equipment.

**Requirement:** *Settings → Areas* is set to **Nutrition and training** or **Training only**.

## Switch training on

1. Open HAFS in Home Assistant and go to *Settings*. The first card is **Areas**.
2. Choose **Nutrition and training**. If you only want to train, choose **Training only**; the nutrition tabs are then gone.
3. With both areas the switch **Nutrition | Training** appears in the tab bar, left of **Settings**.

The same choice is under *Training → Settings → Areas*. With **Nutrition only** HAFS looks as before, and the HAFS app gets no training data for you.

## Change between nutrition and training

- Tap **Training** (dumbbell) or **Nutrition** (apple) at the top. The page does not reload.
- Each area has its own tabs. Training: **Today**, **Training**, **Exercises**, **Plans**, **Settings**.
- HAFS remembers the area and tab you used last on this device.
- While a workout is running, training opens at start.

## The tabs

| Tab | Content |
|---|---|
| **Today** | Next training day with the suggested weights, figures of the week, sets per muscle group, review, recent workouts |
| **Training** | All workouts by month with sets and weights; next to it sets per muscle group over several weeks |
| **Exercises** | All exercises with search and filters; per exercise its history (estimated 1RM, weight, volume), records, suggestion, equipment |
| **Plans** | Create and edit training plans and training days, gyms with their equipment and weight steps |
| **Settings** | What **Today** shows, rest between sets, nutrition phase, rules for progression, import, export, take over |

## Nutrition phase

The suggested weights depend on whether you are losing, maintaining or gaining. *Training → Settings → Nutrition phase* is **Automatic** by default: your goal from *Nutrition → Settings* applies (lose = cut, maintain, gain = bulk). Choose a phase by hand when it should differ.

## Import workouts from other apps

1. Export your workouts as CSV from GymRun, Strong or Hevy.
2. Open *Training → Settings → Import* and choose the file.
3. Tap **Dry run**. HAFS shows how many workouts, sets and exercises it found.
4. If everything looks right, tap **Import**. Existing data is skipped.

## Moving over from the HAFS integration

If you used HAFS as an integration (`custom_components/hafs`) so far, take your data over like this:

1. Update HAFS in Home Assistant to version 2.0 and let it rebuild, so the app may read the configuration folder.
2. Switch training on (see above).
3. *Training → Settings → Take over → **Take over from the HAFS integration***. HAFS shows per user what comes along (workouts, sets, period) and what is in HAFS already and will be replaced.
4. Tap **Take over now** and confirm. As an administrator you take over all users, otherwise only yourself. Users taken over get training switched on.
5. Update the [HAFS app](android.md) on your phone and sync once.
6. Remove the integration in Home Assistant afterwards (*Settings → Devices & services → HAFS → Delete*). Only then HAFS creates the entities; otherwise they would get the suffix `_2`.

The integration's database is only read. Alternatively upload an export file under **Load a HAFS export (JSON)** (from the integration's export or from **Download everything as JSON**). That replaces only your own training data.

## Backup and export

- **Download everything as JSON** (*Training → Settings → Export*) downloads your training data.
- The backup of HAFS (*Nutrition → Settings*, and the automatic one under `/backup/mydiet/`) includes training as soon as it is switched on. When restoring, the preview shows the number of **Workouts**; a backup without training (from version 1.x) leaves your training data as it is.

## Home Assistant

Entities, events, Assist and automations are described under [Training in Home Assistant](training-ha.md).
