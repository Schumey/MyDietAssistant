# Barcode-Scanner

[← Übersicht](README.md)

Nur die Online-Suche (Open Food Facts, optional USDA) braucht Internet. Den Barcode kannst Du eintippen, mit der Kamera scannen oder aus einem Foto lesen lassen.

## Einen Barcode scannen

1. Öffne das **Tagebuch** und tippe bei einer Mahlzeit auf **+ Nahrungsmittel hinzufügen**.
2. Wähle eine der Möglichkeiten:
   - **Barcode scannen** startet die Kamera. Halte den Barcode ins Bild.
   - **Foto vom Barcode** liest den Code aus einem Foto (geht auch ohne HTTPS).
   - Zum Eintippen der Nummer legst Du ein **+ Neues Lebensmittel** an und trägst sie im Feld für den Barcode ein.
3. Warte, bis der Code erkannt ist.
4. Kennst Du das Lebensmittel schon, wird es direkt gewählt. Sonst schlägt das Add-on den Code bei Open Food Facts nach und bereitet ein neues Lebensmittel vor. Prüfe die Werte, speichere und gib die Menge an.

Der Barcode wird am Lebensmittel gespeichert, beim nächsten Mal findet ihn „Barcode scannen“ direkt.

## Wie der Scanner liest

Der Browser-eigene Leser (Chrome/Android) wird genutzt, wo es ihn gibt. Sonst springt die mitgelieferte ZXing-Bibliothek ein (iPhone, Firefox, Safari). Unterstützt sind EAN-13, EAN-8, UPC-A und UPC-E.

**Die Kamera braucht eine HTTPS-Verbindung** (Nabu Casa oder eigenes Zertifikat). Ein Foto geht immer.

## Scanner per Homescreen-Verknüpfung (Companion-App)

Ein echtes Widget mit Kamera gibt es in der Companion-App nicht. Mit einer Verknüpfung auf das Panel öffnet sich der Scanner trotzdem mit einem Tipp.

1. Installiere v1.6.0 oder neuer (siehe [Installation](installation.md#aktualisieren)).
2. Öffne auf dem Handy die Companion-App, wähle in der Seitenleiste **MyDietAssistant** und dann *Einstellungen → Darstellung*.
3. Schalte **Auf diesem Gerät beim Öffnen direkt den Barcode-Scanner starten** ein. Die Option gilt nur für dieses Gerät.
4. **Android:** Öffne in der Companion-App *Einstellungen → Companion-App → Verknüpfungen* (nicht unter „Widgets“; dort gibt es nur Aktionsknopf, Bild, Entität, Mediaplayer, Template und To-do) und lege eine Verknüpfung an. Als Ziel trägst Du den Pfad des Panels ein: `/hassio/ingress/<Add-on-Kennung>`.
   - Die Kennung ist bei Add-ons aus einem Repository meist `<Kürzel>_mydiet` (z. B. `a0d7b954_mydiet`).
   - Den genauen Pfad zeigt die Adresszeile des Browsers, wenn Du das Panel **Ernährung** öffnest.
   - Drücke danach lange auf das Home-Assistant-Symbol und ziehe die Verknüpfung auf den Homescreen.
5. **iPhone** (ungeprüft): Lege in der Kurzbefehle-App die Aktion „URL öffnen“ mit `homeassistant://navigate/hassio/ingress/<Add-on-Kennung>` an und füge den Kurzbefehl zum Home-Bildschirm hinzu.
6. Tippe die Verknüpfung an. Die App öffnet das Tagebuch, der Hinzufügen-Dialog erscheint mit laufender Kamera. Erteile beim ersten Mal die Kameraerlaubnis.
7. Halte den Barcode ins Bild.

> Solange die Option an ist, startet der Scanner bei jedem Öffnen des Panels auf diesem Gerät. **Schließen** schließt nur den Dialog. Zum Abschalten die Option wieder ausschalten.

Probleme? Siehe [Fehlersuche](troubleshooting.md#die-kamera-startet-nicht).
