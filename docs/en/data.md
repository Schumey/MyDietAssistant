# Data, import and backup

[← Overview](README.md)

All functions here only affect your own user account, including export and import.

## Where is the data?

- Database: `/data/mydiet.db` in the add-on storage, part of every normal Home Assistant backup.
- Automatic JSON backups: `/backup/mydiet/` (visible in the Samba share “backup”).
- Before a migration the add-on saves a copy `mydiet.db.v<old version>.bak` next to the database.
- Progress photos are stored as files in the add-on and are not part of the JSON backup.

## Create a backup

**Manually as a file:**

1. Open *Settings → Data*.
2. Tap **Backup (JSON)**. The browser downloads the file.

**Automatically:**

1. Open the add-on configuration and turn on `auto_backup` (default). `backup_keep_days` sets how long files are kept (default 14 days).
2. The add-on writes a daily JSON backup per user to `/backup/mydiet/`.
3. Under *Settings → Automatic backup* you see the latest backups. **Back up now** creates one immediately.

The JSON backup contains entries, foods, meals, weight, triggers (actions and meal rules), settings of optional features, reminder, look, the Mealie address and more. It does not contain the trigger history, progress photos or the Mealie token.

## Restore a backup

1. Open *Settings → Automatic backup* and tap **Restore** on a backup. Or, under *Settings → Data*, tap **Restore backup** and choose a JSON file.
2. The preview **Restore backup** compares **Now** and **Backup** (entries, days, foods, meals, weight values, period).
3. Check the numbers. **Replace** replaces all current data of your account with the backup, **Cancel** changes nothing.
4. After restoring on a fresh installation you have to enter the Mealie token again.

Older backups (without triggers) can still be restored.

## Import from other apps

### MyFitnessPal

1. Export your data from MyFitnessPal as CSV.
2. Open *Settings → Data* and tap **Import MyFitnessPal CSV**.
3. Choose the file, correct the column mapping and start the import (complete, or only daily totals + weight).

### Cronometer, FDDB, Yazio, Google Fit and similar tables

1. Open *Settings → Data → More imports …*.
2. Choose **CSV from another app → Choose file** (for example `servings.csv`, `biometrics.csv`).
3. The columns are recognised by their headings. Correct them in the preview and import.

### Apple Health

1. Export in the Health app: profile → Export all health data. You get `export.zip`.
2. Open *Settings → Data → More imports …* and choose the file under **Apple Health** (`export.zip` or `export.xml`).
3. The file is read directly in the browser; only the daily values are uploaded.

### Food table

Nutrition tables such as BLS, CIQUAL or the Swiss food composition database: see [Foods](foods.md#import-a-table).

Import only affects your account. Existing data is kept unless you explicitly choose “replace”.

## Report for a dietitian or trainer

1. Open *Settings → Export for dietitian and trainer*.
2. Choose **From** and **To**.
3. Optionally tick **List individual entries in the report**.
4. **Open report (print / PDF)** opens a report. In the print dialog choose “Save as PDF”.
5. **Daily overview (CSV)** downloads a table of the daily values.

Only the chosen period is included.

## Diary as CSV

*Settings → Data → Diary as CSV* downloads all entries as a table.

## Database and updates

The database carries a version number (`PRAGMA user_version`). On start all missing migrations run in order. For large amounts of data (many years of diary, imported food tables) there are indexes; the food list loads in pages and searches on the server.

Tip: before restoring, download the current state with **Backup (JSON)** before you choose **Replace**. That way you can go back if needed.
