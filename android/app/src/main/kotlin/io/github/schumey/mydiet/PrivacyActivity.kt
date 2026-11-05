package io.github.schumey.mydiet

import android.app.Activity
import android.os.Bundle
import android.widget.ScrollView
import android.widget.TextView

/** Shown by Health Connect from the permission screen ("why does this app need access?"). Required for the permission request. */
class PrivacyActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val pad = (24 * resources.displayMetrics.density).toInt()
        setContentView(ScrollView(this).apply {
            addView(TextView(context).apply {
                setPadding(pad, pad, pad, pad)
                textSize = 16f
                setText(R.string.privacy_text)
            })
        })
        setTitle(R.string.privacy_title)
    }
}
