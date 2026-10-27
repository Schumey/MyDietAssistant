# Mahlzeiten-Vorschläge

[← Übersicht](README.md)

Der Button **Mahlzeit vorschlagen** rechnet aus, was heute noch offen ist, und schlägt passende Mahlzeiten vor.

**Voraussetzung:** Zusatzfunktion „Mahlzeiten-Vorschläge“ und mindestens eine gespeicherte Mahlzeit (oder ein paar Tage Verlauf).

## Einen Vorschlag nutzen

1. Schalte *Einstellungen → Zusatzfunktionen → Mahlzeiten-Vorschläge* ein.
2. Speichere im Tagebuch über **Speichern / Kopieren → Als Mahlzeit speichern** ein paar Mahlzeiten (siehe [Tagebuch](diary.md#mahlzeiten-speichern-und-kopieren)). Auch Kombinationen aus Deinem Verlauf kommen vor (gleiche Zutaten in einer Mahlzeit, mindestens zweimal in 180 Tagen).
3. Tippe unten im Tagebuch auf **Mahlzeit vorschlagen**.
4. Wähle oben im Dialog die **Mahlzeit**, in die eingetragen wird.
5. Wähle das Ziel: **Rest des Tages** oder **Anteil für diese Mahlzeit** (Rest geteilt durch die Zahl der noch leeren Mahlzeiten).
6. Die Karten zeigen Zutaten in Gramm, Makros und Abweichung vom Ziel. **Weitere Vorschläge** zeigt weitere Treffer.
7. Mit **Anpassen** änderst Du die Mengen von Hand (Makros und Abweichung rechnen mit), dann trägst Du ein.
8. Bei Kombinationen aus dem Verlauf kannst Du **Als Mahlzeit speichern** wählen.
9. Mit **Ausschließen** taucht die Mahlzeit nicht mehr in den Vorschlägen auf. Zurückholen kannst Du sie im Dialog **Vorschläge einstellen** in der Liste **Ausgeschlossen** mit **Zulassen**.

Das offene Tagesbudget ist das Ziel des Tages (inklusive [Aktivität](activity.md) und Wochentagsziel) minus Gegessenes. Werte ohne Ziel zählen nicht. Ist das Ziel schon erreicht, gibt es nichts aufzufüllen.

## Mengen: skalierbar oder fest

Bearbeite eine gespeicherte Mahlzeit im Reiter **Mahlzeiten** (**✎**). Bei eingeschalteter Funktion hat jede Zutat einen Modus:

1. **Skalierbar:** folgt dem Mengenfaktor der Mahlzeit. **Abweichung ±** erlaubt der Zutat, vom Verhältnis zu den anderen um so viele Prozent abzuweichen (0 = starr).
2. **Fest:** bleibt, wie gespeichert. Mit einer Packungsgröße nimmt der Vorschlag so viele **Packungen**, wie unter „Anzahl“ (von – bis, 0 bis 6) eingestellt ist: 0–1 lässt die Zutat auch weg, 1–1 erzwingt genau eine Packung, 1–3 erlaubt bis zu drei.
3. **Mengenfaktor für Vorschläge** begrenzt, wie stark die ganze Mahlzeit schrumpfen oder wachsen darf (leer = 0,6 bis 1,6).

Mengen werden auf 5 g (kleine Mengen auf 1 g) gerundet.

## Prioritäten und Beigaben

Tippe im Vorschlags-Dialog auf **⚙** („Prioritäten und Beigaben“). Der Dialog **Vorschläge einstellen** öffnet sich.

1. Wähle bei **Wichtigkeit** für **Kalorien**, **Eiweiß**, **Kohlenhydrate** und **Fette** eine Stufe: egal, normal, wichtig, sehr wichtig. Zu viel zählt stärker als zu wenig. Werte ohne Ziel bleiben außen vor.
2. Schalte bei Bedarf **Kalorienziel nie überschreiten** und **Eiweißziel möglichst erreichen** ein.
3. **Beigaben** sind Lebensmittel, die zu jeder Mahlzeit passen (z. B. Nüsse). Tippe auf **+ Beigabe**, wähle das Lebensmittel und die Höchstmenge. Danach stellst Du je Beigabe Mindestmenge, Höchstmenge und Schrittweite ein. **✕** entfernt sie.
4. Tippe auf **Speichern**.

Ein Vorschlag nimmt höchstens zwei Beigaben dazu und nur, wenn sie den Rest besser treffen.

## Trainingstag: Shake und Abendessen

Für Tage mit Training rechnet die App die Menge deines Post-Workout-Shakes aus und sucht danach Abendessen für den Rest des Tages.

**Einrichten**
1. Speichere den Shake einmal als Mahlzeit (Tagebuch → „Speichern / Kopieren“). Die Zutaten bleiben „Skalierbar“, damit die Mengen angepasst werden dürfen.
2. Öffne „Mahlzeit vorschlagen“ oder im Tagebuch „Trainingstag“ und tippe auf „Prioritäten und Beigaben“.
3. Wähle unter „Trainingstag“ den Shake und trage das Ziel ein, z. B. 40 g Eiweiß und 50 g Kohlenhydrate. Felder, die du leer lässt, zählen nicht. Optional legst du fest, in welche Mahlzeit Shake und Abendessen kommen.
4. Speichern.

**Benutzen:** Tippe im Tagebuch auf „Trainingstag“. Oben steht der Shake mit den berechneten Mengen („Eintragen“ oder „Anpassen“), darunter Abendessen, die zu dem passen, was nach dem Shake vom Tagesziel offen ist. Das Ziel des Shakes ist nie größer als der noch offene Rest des Tages. Ist der Shake für heute schon eingetragen, erscheinen nur die Abendessen.

**Wann der Knopf erscheint:** Im Tagebuch steht „Trainingstag“ erst, wenn der Shake für den Tag eingetragen ist oder ein Trigger ihn gebucht hat, also an Tagen mit Training. Solange der Trainingstag nicht eingerichtet ist, ist der Knopf immer da. Mit dem Häkchen „Knopf „Trainingstag“ an jedem Tag zeigen“ erscheint er an allen Tagen.

**Über die Aktivität erkennen:** Ist die Zusatzfunktion „Aktivität“ an, trägst Du in den Trainingstag-Einstellungen bei „Auch erkennen, wenn so viele Kalorien verbrannt wurden“ eine Schwelle ein, zum Beispiel 400. Ab dieser Zahl verbrannter Kalorien gilt der Tag als Trainingstag.

**Sensoren:** `training_day` (`yes`/`no`) und `training_shake` (die berechneten Mengen als Text) erlauben Automationen, etwa eine Benachrichtigung „Shake heute: Whey 35 g, Milch 370 g“ (siehe [Sensoren](sensors.md)).

**Eiweiß:** Mit „Abendessen sollen das Eiweißziel möglichst erreichen“ (standardmäßig an) bevorzugen die Abendessen-Vorschläge Mengen, die das Eiweißziel des Tages erreichen.

**Mit Trigger:** Trägt ein Trigger (z. B. „im Fitnessstudio“) den Shake ein, setze in den Einstellungen das Häkchen „Trigger tragen den Shake mit den berechneten Mengen ein“. Dann nutzt der Trigger heute die berechneten statt der gespeicherten Mengen. Für geplante Tage in der Zukunft bleiben die gespeicherten Mengen.

## Reihenfolge der Vorschläge

Hilfen bei der Reihenfolge sind die passende Kategorie (Name der Mahlzeit), Abwechslung gegenüber heute und gestern und die Häufigkeit.

Export, Sicherungen und Import enthalten Einstellungen, Beigaben und Zutaten-Modi. Die Einträge sind wie immer Schnappschüsse.
