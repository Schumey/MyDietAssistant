# Interface and reminder

[← Overview](README.md)

## Interface for automations

With `api_key` set, Home Assistant automations (scale, voice assistant, messages) can send entries and weight. Internally the add-on is reachable at `http://local-mydiet:8099`.

### Set up

1. Open *Settings → Add-ons → MyDietAssistant → Configuration*.
2. Enter a long random key for `api_key` and save. The add-on restarts. If the field stays empty, the interface is off.
3. Check the host name on the add-on page under **Hostname** (usually `local-mydiet`; for repository add-ons it can be `<prefix>-mydiet`).
4. Read your user ID under *Settings → Interface for automations* (field `user`). Without it the local user `default` applies.
5. Create the `rest_command` entries in `configuration.yaml`:

```yaml
rest_command:
  mydiet_weight:
    url: "http://local-mydiet:8099/api/ext/weight"
    method: POST
    headers:
      X-MDA-Key: "YOUR_KEY"
      Content-Type: application/json
    payload: '{"user": "{{ user }}", "kg": {{ kg }}}'
  mydiet_entry:
    url: "http://local-mydiet:8099/api/ext/entry"
    method: POST
    headers:
      X-MDA-Key: "YOUR_KEY"
      Content-Type: application/json
    payload: '{"user": "{{ user }}", "food": "{{ food }}", "grams": {{ grams }}, "meal": "{{ meal }}"}'
```

6. Reload the configuration (**Developer tools → YAML → Reload all YAML configuration**) or restart HA.
7. Test in **Developer tools → Actions** with `rest_command.mydiet_weight` and the values `user` and `kg`.

### Fields

`/api/ext/weight`

| Field | Meaning |
|---|---|
| `user` | user ID |
| `kg` | weight in kg (20 to 500) |
| `day` | optional, date `YYYY-MM-DD` (otherwise today) |

`/api/ext/entry` accepts either `food` or `name` with values:

| Field | Meaning |
|---|---|
| `user` | user ID |
| `food` | name of an existing food, optionally with `grams` |
| `name` + `kcal`, `protein`, `carbs`, `fat` | quick entry without a food |
| `day` | optional, date `YYYY-MM-DD` |
| `time` | optional, `HH:MM` |
| `meal` | optional, name of the meal |

The key must be in the header `X-MDA-Key`. Without a valid key the add-on answers with an error.

To take over the weight of a smart scale, the [scale as a sensor](weight.md#scale-as-a-sensor) is easier than an automation.

## Reminder

The add-on sends a message once a day if nothing has been logged by a given time.

1. Open *Settings → Reminder*.
2. Turn on **Reminder active**.
3. Choose the **Time**.
4. Enter the **Notification service**, for example `notify.mobile_app_phone`. You find the name under *Developer tools → Actions* when you search for `notify.`.
5. Tap **Save** (“Saved ✓”).

The [meal schedule](schedule.md) uses the same notification service. The reminder only runs in the Home Assistant add-on.

If nothing arrives, continue with [Troubleshooting](troubleshooting.md).
