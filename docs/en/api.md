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

### Enter food by sentence (voice assistant)

`/api/ext/say` takes a whole sentence instead of an exact food name. With Home Assistant Assist or an automation you can say what you ate.

**Examples for `text`:** “two apples and 200 g skyr”, “half a banana”, “3 slices of bread, a glass of milk”, “Post-workout shake”.

- Quantities as numbers or words (a, one, two, … twelve, half), units `g`, `kg`, `ml`, `l`, `EL` (tablespoon), `TL` (teaspoon).
- Without a weight, one portion counts: for “3 slices of bread” the food’s portion named like “slice” (add it in the food under “Portions”), otherwise the food’s serving size, otherwise 100 g.
- Foods and saved meals are found. Plural, umlauts and capitalisation do not matter. Names are matched as you saved them.
- What is not found is listed in `unmatched`; the rest is entered anyway.
- The parser understands German best; a few English words (and, one, two, half, grams, …) work as well.

| Field | Meaning |
|---|---|
| `user` | user id |
| `text` | the sentence |
| `meal` | optional, name of the meal (otherwise the one due according to the schedule, otherwise the first) |
| `day`, `time` | optional, as for `/api/ext/entry` |
| `lang` | optional, `de` (default) or `en` for the answer sentence |
| `dry_run` | optional, `true` only shows what would be entered |

The answer contains `ok`, `added`, `unmatched` and `message`, a short sentence to read out.

**With Assist (“I ate two apples”)**

1. Add the command to `configuration.yaml` (replace the key):

```yaml
rest_command:
  mydiet_say:
    url: "http://local-mydiet:8099/api/ext/say"
    method: POST
    headers:
      X-MDA-Key: "YOUR_KEY"
      Content-Type: application/json
    payload: '{"user": "{{ user }}", "text": {{ text | tojson }}, "lang": "en"}'

intent_script:
  MydietLog:
    action:
      - action: rest_command.mydiet_say
        data:
          user: "default"
          text: "{{ food_text }}"
        response_variable: mda
      - stop: ""
        response_variable: mda
    speech:
      text: "{{ action_response.content.message }}"
```

2. Create the file `config/custom_sentences/en/mydiet.yaml`:

```yaml
language: "en"
intents:
  MydietLog:
    data:
      - sentences:
          - "log {food_text}"
          - "I (ate|had|drank) {food_text}"
          - "add {food_text} to my food diary"
lists:
  food_text:
    wildcard: true
```

3. Reload the configuration, put your user id in `user` and tell Assist: “I ate two apples and 200 grams of skyr”.

To test: **Developer tools → Actions**, `rest_command.mydiet_say` with `user` and `text`. For a dry run call the endpoint directly with `"dry_run": true`. The Assist sentences and how the answer is passed on depend on your Home Assistant version (`wildcard` placeholders need a recent one).

## Reminder

The add-on sends a message once a day if nothing has been logged by a given time.

1. Open *Settings → Reminder*.
2. Turn on **Reminder active**.
3. Choose the **Time**.
4. Enter the **Notification service**, for example `notify.mobile_app_phone`. You find the name under *Developer tools → Actions* when you search for `notify.`.
5. Tap **Save** (“Saved ✓”).

The [meal schedule](schedule.md) uses the same notification service. The reminder only runs in the Home Assistant add-on.

If nothing arrives, continue with [Troubleshooting](troubleshooting.md).
