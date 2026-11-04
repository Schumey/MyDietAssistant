package io.github.schumey.mydiet

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast

/** First start (or "change server"): asks for the Home Assistant address and the add-on slug. */
class SetupActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val prefs = Prefs(this)
        val pad = (20 * resources.displayMetrics.density).toInt()

        fun label(res: Int) = TextView(this).apply { setText(res); setPadding(0, pad / 2, 0, 0) }

        val title = TextView(this).apply { setText(R.string.setup_title); textSize = 22f }
        val url = EditText(this).apply {
            setHint(R.string.setup_url_hint)
            setText(prefs.baseUrl)
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_URI
            setSingleLine()
        }
        val slug = EditText(this).apply { setText(prefs.slug); setSingleLine() }
        val connect = Button(this).apply { setText(R.string.setup_connect) }

        connect.setOnClickListener {
            val base = Prefs.normalizeUrl(url.text.toString())
            if (base == null) {
                Toast.makeText(this, R.string.setup_url_invalid, Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }
            prefs.baseUrl = base
            prefs.slug = slug.text.toString().trim().ifEmpty { Prefs.DEFAULT_SLUG }
            startActivity(Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP))
            finish()
        }

        setContentView(LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(pad, pad, pad, pad)
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
            addView(title)
            addView(label(R.string.setup_url_label))
            addView(url)
            addView(label(R.string.setup_slug_label))
            addView(slug)
            addView(connect)
        })
    }
}
