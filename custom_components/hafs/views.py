"""HTTP views: the app package for self-update. Both need a Home Assistant login (the app's long-lived token)."""

from __future__ import annotations

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import APP_SUBPATH
from .core import appfiles


class AppInfoView(HomeAssistantView):
    """GET /api/hafs/app: the newest package (`version`, `name`, `size`, `sha256`) or 404."""

    url = "/api/hafs/app"
    name = "api:hafs:app"

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def get(self, request: web.Request) -> web.Response:
        folder = self.hass.config.path(APP_SUBPATH)
        info = await self.hass.async_add_executor_job(appfiles.latest, folder)
        if info is None:
            return self.json_message("No app package available", 404)
        return self.json(info)


class AppDownloadView(HomeAssistantView):
    """GET /api/hafs/app/<name>: the package file."""

    url = "/api/hafs/app/{name}"
    name = "api:hafs:app:download"

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def get(self, request: web.Request, name: str) -> web.StreamResponse:
        path = appfiles.resolve(self.hass.config.path(APP_SUBPATH), name)
        if path is None:
            return self.json_message("Not found", 404)
        return web.FileResponse(path, headers={"Content-Type": "application/vnd.android.package-archive"})


def async_register_views(hass: HomeAssistant) -> None:
    hass.http.register_view(AppInfoView(hass))
    hass.http.register_view(AppDownloadView(hass))
