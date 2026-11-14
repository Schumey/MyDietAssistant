import 'dart:convert';

import 'package:image_picker/image_picker.dart';

/// Where equipment photos come from (camera or gallery); returns a small JPEG as data URL, `null` when cancelled.
/// Photos are stored in `equipment.photo` and travel with the normal sync, so they are kept small.
abstract class PhotoSource {
  Future<String?> pick({required bool camera});
}

class ImagePickerSource implements PhotoSource {
  @override
  Future<String?> pick({required bool camera}) async {
    final file = await ImagePicker().pickImage(
      source: camera ? ImageSource.camera : ImageSource.gallery,
      maxWidth: 640,
      maxHeight: 640,
      imageQuality: 60,
    );
    if (file == null) return null;
    return dataUrl(await file.readAsBytes());
  }
}

/// JPEG bytes as data URL, the format the server accepts (see `MAX_PHOTO` in `core/sync.py`).
String dataUrl(List<int> bytes) => 'data:image/jpeg;base64,${base64Encode(bytes)}';

/// The bytes of a data URL, `null` for anything else.
List<int>? photoBytes(String? photo) {
  if (photo == null || !photo.startsWith('data:image/')) return null;
  final i = photo.indexOf('base64,');
  if (i < 0) return null;
  try {
    return base64Decode(photo.substring(i + 7));
  } on FormatException {
    return null;
  }
}
