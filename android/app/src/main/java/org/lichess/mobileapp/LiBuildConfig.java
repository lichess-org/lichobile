package org.lichess.mobileapp;

import android.view.Gravity;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import org.lichess.mobileapp.BuildConfig;

@NativePlugin()
public class LiBuildConfig extends Plugin {

  @PluginMethod()
  public void get(PluginCall call) {
    JSObject ret = new JSObject();
    ret.put("NNUE", BuildConfig.NNUE);
    call.resolve(ret);
  }
}
