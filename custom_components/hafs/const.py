"""Constants for HAFS."""

DOMAIN = "hafs"

# Bumped when the WebSocket API changes incompatibly, so apps can tell the user to update.
API_VERSION = 1

DB_SUBPATH = "hafs/hafs.db"

# Web panel in the sidebar: static files under /hafs_static, page under /hafs.
PANEL_URL_PATH = "hafs"
PANEL_STATIC_URL = "/hafs_static"

# Folder with the app packages (hafs-<version>.apk) that the app can download to update itself.
APP_SUBPATH = "hafs/app"
