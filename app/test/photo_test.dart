import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/gyms_screen.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/photo.dart';
import 'package:hafs/repo_gym.dart';

import 'support.dart';

class _Creds implements CredentialStore {
  @override
  Future<({String address, String token})?> load() async => null;

  @override
  Future<void> save(String address, String token) async {}

  @override
  Future<void> clear() async {}
}

class _Source implements PhotoSource {
  _Source(this.result);
  String? result;
  bool? lastCamera;

  @override
  Future<String?> pick({required bool camera}) async {
    lastCamera = camera;
    if (result == 'error') throw Exception('no camera');
    return result;
  }
}

// a 1x1 image (the decoder sniffs the content, the prefix only has to look like the server's format)
const _jpeg = [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120, 218, 99, 252, 207, 192, 80, 15, 0, 4, 133, 1, 128, 132, 169, 140, 33, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130];

void main() {
  test('data URL round trip', () {
    expect(photoBytes(dataUrl(_jpeg)), _jpeg);
    expect(photoBytes(''), isNull);
    expect(photoBytes('https://x/y.jpg'), isNull);
    expect(photoBytes('data:image/jpeg;base64,***'), isNull);
  });

  late AppState app;
  late _Source source;

  setUp(() async {
    L10n.lang = 'de';
    source = _Source(dataUrl(_jpeg));
    app = AppState(_Creds(), openDb: () async => openMemory(), photoSource: source);
    await app.start();
  });

  Future<void> open(WidgetTester tester, String gym, {String? equipmentId}) async {
    final nav = GlobalKey<NavigatorState>();
    await tester.pumpWidget(MaterialApp(navigatorKey: nav, home: const Scaffold()));
    nav.currentState!.push(MaterialPageRoute<void>(builder: (_) => EquipmentScreen(app: app, gymId: gym, equipmentId: equipmentId)));
    await tester.pumpAndSettle();
  }

  testWidgets('a photo is stored with the equipment, kept on later edits and removable', (tester) async {
    final repo = app.repo!;
    final gym = repo.addGym('Studio');
    await open(tester, gym);
    await tester.enterText(find.byType(TextField).first, 'Latzug');
    await tester.scrollUntilVisible(find.byKey(const Key('photo-camera')), 200, scrollable: find.byType(Scrollable).first);
    await tester.tap(find.byKey(const Key('photo-camera')));
    await tester.pumpAndSettle();
    expect(source.lastCamera, isTrue);
    expect(find.byKey(const Key('equipment-photo')), findsOneWidget);
    await tester.tap(find.text('Speichern'));
    await tester.pumpAndSettle();
    final eq = repo.local.row("SELECT * FROM equipment WHERE name = 'Latzug'")!;
    expect(eq['photo'], dataUrl(_jpeg));
    expect(eq['dirty'], 1);

    // editing something else keeps the photo
    repo.saveEquipment(id: eq['id'] as String, gymId: gym, name: 'Latzug neu');
    expect(repo.equipmentPhoto(eq['id'] as String), dataUrl(_jpeg));

    // remove it in the form
    await open(tester, gym, equipmentId: eq['id'] as String);
    await tester.scrollUntilVisible(find.byKey(const Key('photo-remove')), 200, scrollable: find.byType(Scrollable).first);
    await tester.tap(find.byKey(const Key('photo-remove')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Speichern'));
    await tester.pumpAndSettle();
    expect(repo.equipmentPhoto(eq['id'] as String), '');
  });

  testWidgets('a failing camera shows a message and changes nothing', (tester) async {
    final gym = app.repo!.addGym('Studio');
    source.result = 'error';
    await open(tester, gym);
    await tester.scrollUntilVisible(find.byKey(const Key('photo-gallery')), 200, scrollable: find.byType(Scrollable).first);
    await tester.tap(find.byKey(const Key('photo-gallery')));
    await tester.pumpAndSettle();
    expect(find.text('Das Foto konnte nicht geholt werden.'), findsOneWidget);
    expect(find.byKey(const Key('equipment-photo')), findsNothing);
  });
}
