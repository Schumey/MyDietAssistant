import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Wo Adresse und Token liegen; in Tests durch einen Speicher im Arbeitsspeicher ersetzbar.
abstract class CredentialStore {
  Future<({String address, String token})?> load();
  Future<void> save(String address, String token);
  Future<void> clear();
}

/// Legt Adresse und Token im verschlüsselten Speicher des Geräts ab.
class SecureCredentialStore implements CredentialStore {
  SecureCredentialStore([FlutterSecureStorage? storage]) : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  static const _addressKey = 'ha_address';
  static const _tokenKey = 'ha_token';

  @override
  Future<({String address, String token})?> load() async {
    final address = await _storage.read(key: _addressKey);
    final token = await _storage.read(key: _tokenKey);
    if (address == null || token == null) return null;
    return (address: address, token: token);
  }

  @override
  Future<void> save(String address, String token) async {
    await _storage.write(key: _addressKey, value: address);
    await _storage.write(key: _tokenKey, value: token);
  }

  @override
  Future<void> clear() async {
    await _storage.delete(key: _addressKey);
    await _storage.delete(key: _tokenKey);
  }
}
