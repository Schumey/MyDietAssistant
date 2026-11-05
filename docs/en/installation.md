# Installation

[← Overview](README.md)

> **Terms:** since Home Assistant 2026.2, add-ons are called **apps**. MyDietAssistant is such an app. The **Marketplace** (since 2026.11, the successor of HACS) is something else: it installs integrations, dashboard cards, themes and templates, but no apps. That is why you won't find MyDietAssistant in the Marketplace; it is in the app store.

## Requirements

- Home Assistant OS (or Supervised) with the app store. Container-only or Core installations have no apps.
- Optional: the MQTT integration (only for [MQTT discovery](sensors.md#mqtt-discovery)) and a smartphone with the Companion app or the [Android app](android.md).

## Install the app

1. The easiest way is the “add repository” button in the [README](../../README.en.md). It opens your Home Assistant instance and adds the repository.
2. By hand: in Home Assistant open **Settings → Apps → Install app**, tap **⋮ → Repositories** at the top right and add `https://github.com/Schumey/MyDietAssistant`.
3. Reload the page. **MyDietAssistant** appears at the bottom. Open it and tap **Install**.
4. When the installation has finished, tap **Start**.
5. Turn on **Show in sidebar** (and, if you like, **Start on boot** and **Watchdog**).
6. The sidebar now has an entry **MyDietAssistant**. Open it: you see today’s diary.

The first time, Home Assistant builds the image itself. This can take a few minutes.

> With a private repository, copy the `mydiet` folder into `/addons` (Samba share “addons”) instead and install the app under **Local apps**.

## App options

You find the options under **Settings → Apps → MyDietAssistant → Configuration**. The app restarts after you save.

| Option | Meaning | Default |
|---|---|---|
| `default_kcal_goal` | Calorie goal used until you set your own | 2000 |
| `publish_sensors` | Publish sensors in Home Assistant, see [Sensors](sensors.md) | on |
| `mqtt_discovery` | Create sensors via MQTT discovery (unique IDs) | off |
| `auto_backup` | Daily JSON backup per user to `/backup/mydiet/` | on |
| `backup_keep_days` | How many days backups are kept (1 to 365) | 14 |
| `api_key` | Key for the [interface](api.md); empty = interface off | empty |
| `usda_api_key` | Your own key for USDA FoodData Central (free at api.data.gov) | empty |
| `admin_users` | List of user IDs or names with access to [user administration](household.md#user-administration); empty = the first user who opened the app | empty |

The option labels are available in all languages of the interface.

## Update

1. New versions show up under **Settings → Updates**. If nothing is there yet: **Settings → Apps → Install app → ⋮ → Check for updates**.
2. Open **MyDietAssistant** and tap **Update**. With **Auto update** on the app page this happens without you.
3. The changes of each version are in the [CHANGELOG](../../mydiet/CHANGELOG.en.md). Afterwards reload the page once (in the Companion app: reopen the app) in case the browser cached an old version.

On start the app runs all missing database migrations. Before that it saves a copy `mydiet.db.v<old version>.bak` next to the database in `/data`. Changes to the options or to `config.yaml` (for example new options) only take effect after a rebuild; the update does that for you.

The [Android app](android.md) is updated separately (new APK); for changes to the interface, updating the app in Home Assistant is enough.

## Where is the data?

- Database: `/data/mydiet.db` in the app's storage. It is part of every normal Home Assistant backup.
- Automatic JSON backups: `/backup/mydiet/`, visible in the Samba share “backup”.
- Progress photos are stored as files in the app and are not part of the JSON backup.

More under [Data, import and backup](data.md).

## Prebuilt images (for developers)

By default Home Assistant builds the app itself on installation. The workflow `.github/workflows/build.yml` can instead publish prebuilt images (amd64, aarch64) to the GitHub Container Registry:

1. `mydiet/config.yaml`: raise the version and commit.
2. `git tag v<version>` and `git push --tags` (the version must match `config.yaml`). Alternatively run it by hand under GitHub → Actions → “Build images”.
3. After the run, make the packages `mydiet-amd64` and `mydiet-aarch64` **public** under GitHub → Packages.
4. Add the line `image: ghcr.io/schumey/mydiet-{arch}` to `mydiet/config.yaml`.

Only set the line once the images for that version exist, otherwise the installation fails.

Continue with [First steps](first-steps.md).
