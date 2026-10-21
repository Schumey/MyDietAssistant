# MyDietAssistant

Lokales MyFitnessPal-Pendant als Home-Assistant-Add-on.

Installation: HA → Einstellungen → Add-ons → Add-on-Store → ⋮ → Repositories → Repo-URL hinzufügen.

Lokal testen:

```
cd mydiet/app
pip install fastapi uvicorn httpx
MYDIET_DB=./dev.db uvicorn main:app --port 8099
```
