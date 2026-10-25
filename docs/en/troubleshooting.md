# Troubleshooting

[← Overview](README.md)

First: open the add-on **Log** (*Settings → Add-ons → MyDietAssistant → Log*). Most errors show up there.

## The add-on does not start or shows a blank page

1. Reload the page (after an update the browser may have cached old files).
2. Check the log for errors.
3. Check that **Show in sidebar** is on.
4. Is a migration mentioned in the log? The copy `mydiet.db.v<version>.bak` is next to the database in `/data`.

## The sensors are missing

1. Is `publish_sensors` on in the add-on configuration?
2. Have you logged something today? Without MQTT discovery the sensors are missing after an HA restart until the next entry.
3. Search for `mydiet` in **Developer tools → States**. The name depends on your user name.
4. For permanent sensors turn on [MQTT discovery](sensors.md#mqtt-discovery).

## A trigger does not log

1. In *Settings → Triggers* tap **Check now**. The message shows what was checked. “No Home Assistant access (SUPERVISOR_TOKEN missing)” means the add-on is not running inside Home Assistant.
2. Check entity and state in **Developer tools → States** (upper/lower case, zone name instead of `home`).
3. A trigger logs only **once per day**. The trigger history shows whether it already ran; **Undo** does not reset the day.
4. Check hold time and time window. The window 22:00 to 06:00 spans midnight.
5. For calendars: the title must **contain** the text, and the calendar needs events for that day (with “days ahead” also for the coming days).
6. Is the trigger paused (⏸, “paused until …”)?
7. Testing with **▶** logs immediately without checking the condition.

The add-on reads the time zone from Home Assistant at start. If you changed it, restart the add-on.

## The camera does not start

1. The camera needs HTTPS (Nabu Casa or your own certificate). Over `http://` in the home network only **Photo of barcode** works.
2. Grant the Companion app or the browser the camera permission.
3. On iPhone, Firefox and Safari the scanner downloads the ZXing library the first time. If that fails, type the number.

## The scale does not take over values

1. Check the message after **Save and read now** (*Settings → Scale*):
   - “Choose a sensor first”: no sensor entered.
   - “The sensor currently has no numeric value”: state `unavailable`/`unknown`.
   - “The value is outside 20 to 500 kg (check the unit)”: set the unit correctly.
   - “The value in the sensor is older than 30 days”.
   - “New value seen, will be taken over once stable”: wait a minute.
2. The sensor must renew its timestamp (`last_updated`) with every measurement.

## Activity stays at 0

1. Are the sensors daily counters that reset to 0 at midnight?
2. In the diary tap **Read from Home Assistant** (today only) or **Load history**.
3. For the history the recorder must record the sensors.

## The reminder does not arrive

1. Is **Reminder active** on and is the service spelled correctly (for example `notify.mobile_app_phone`)?
2. Test the service in **Developer tools → Actions**.
3. The reminder only arrives if nothing has been logged by the set time, and only once a day.

## The interface returns an error

1. Is `api_key` set and does it match the header `X-MDA-Key`?
2. Is the host name right? On the add-on page it is shown under **Hostname**.
3. Does `user` match your user ID from *Settings → Interface for automations*?
4. `kg` must be between 20 and 500.

## The online search returns nothing

1. Is the optional feature “More data sources” on and does the add-on have internet?
2. Without your own `usda_api_key` the demo key’s limit is reached quickly.
3. Clear the cache (*Settings → Cache of the online search*) if old answers get in the way.

## The recipe import finds nothing

1. The page needs embedded recipe data (schema.org). Pages without it or behind a login cannot be read.
2. Addresses in the local network are blocked, at most 3 MB.
3. Mealie: check address and token. `localhost` and link-local addresses are not allowed.

## The interface has the wrong language or look

*Settings → Language and units* and *Appearance → Look* respectively.

## Further help

Open an issue on [GitHub](https://github.com/Schumey/MyDietAssistant/issues) and attach the add-on log (without private data).
