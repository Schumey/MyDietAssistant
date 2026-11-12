package de.schumey.hafs_live

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** Fires when the rest is over and takes the countdown out of the workout notification. */
class RestEndReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        LiveNotification.restOver(context)
    }
}
