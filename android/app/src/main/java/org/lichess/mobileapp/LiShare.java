package org.lichess.mobileapp;

import android.content.Intent;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class LiShare extends Plugin {

  @PluginMethod()
  public void share(PluginCall call) {
    String title = call.getString("title", "");
    String text = call.getString("text");
    String url = call.getString("url");

    if (text == null && url == null) {
      call.error("Must provide a URL or Message");
      return;
    }

    // If they supplied both fields, concat em
    if (text != null && url != null) {
      text = text + " " + url;
    } else if(url != null) {
      text = url;
    }

    Intent intent = new Intent(Intent.ACTION_SEND);
    intent.putExtra(Intent.EXTRA_TEXT, text);
    intent.setTypeAndNormalize("text/plain");

    if (title != null) {
      intent.putExtra(Intent.EXTRA_SUBJECT, title);
    }

    Intent chooser = Intent.createChooser(intent, null);
    chooser.addCategory(Intent.CATEGORY_DEFAULT);

    getActivity().startActivity(chooser);
    call.success();
  }
}
