package io.github.schumey.mydiet

import android.content.Context
import java.net.URI

/** Server address and add-on slug, kept in plain SharedPreferences (no secrets: login stays inside the WebView). */
class Prefs(context: Context) {
    private val sp = context.getSharedPreferences("mda", Context.MODE_PRIVATE)

    var baseUrl: String
        get() = sp.getString("url", "") ?: ""
        set(v) = sp.edit().putString("url", v).apply()

    var slug: String
        get() = sp.getString("slug", DEFAULT_SLUG) ?: DEFAULT_SLUG
        set(v) = sp.edit().putString("slug", v).apply()

    val configured: Boolean get() = baseUrl.isNotEmpty()

    companion object {
        /** Slug of the add-on when installed from the MyDietAssistant repository. */
        const val DEFAULT_SLUG = "eeb2daa3_mydiet"

        /** "homeassistant.local:8123" -> "http://homeassistant.local:8123"; null when it is no usable address. */
        fun normalizeUrl(input: String): String? {
            var s = input.trim().trimEnd('/')
            if (s.isEmpty()) return null
            if (!s.startsWith("http://") && !s.startsWith("https://")) s = "http://$s"
            return try {
                val u = URI(s)
                if (u.host.isNullOrEmpty()) null else s
            } catch (e: Exception) {
                null
            }
        }
    }
}
