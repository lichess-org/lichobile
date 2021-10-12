package org.lichess.mobileapp;

import android.content.Intent;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;

@NativePlugin()
public class LiIntent extends Plugin {
    @Override
    protected void handleOnNewIntent(Intent intent) {
        String action = intent.getAction();
        String text = intent.getStringExtra(Intent.EXTRA_TEXT);

        if (Intent.ACTION_SEND.equals(action) && text != null) {
            JSObject obj = new JSObject();
            obj.put("pgn", text);
            notifyListeners("importPGN", obj, true);
        }
    }
}
