package org.lichess.mobileapp;

import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "FullScreen")
public class FullScreenPlugin extends Plugin {

    @PluginMethod()
    public void hideSystemUI(final PluginCall call) {
      getActivity().runOnUiThread(
          new Runnable() {
            @Override
            public void run() {
              try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                  WindowInsetsController controller = getActivity().getWindow().getInsetsController();
                  if (controller != null) {
                    controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                    controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                  }
                }
                else {
                  final int uiOptions =
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;

                  View decorView = getActivity().getWindow().getDecorView();
                  decorView.setSystemUiVisibility(uiOptions);
                }
                call.resolve();
              } catch (Exception ex) {
                call.reject(ex.getLocalizedMessage(), null, ex);
              }
            }
          }
      );
    }

    @PluginMethod()
    public void showSystemUI(PluginCall call) {
      getActivity().runOnUiThread(
          new Runnable() {
            @Override
            public void run() {
              try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                  WindowInsetsController controller = getActivity().getWindow().getInsetsController();
                  if (controller != null) {
                    controller.show(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                  }
                } else {
                  View decorView = getActivity().getWindow().getDecorView();
                  decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
                }
                call.resolve();
              } catch (Exception ex) {
                call.reject(ex.getLocalizedMessage(), null, ex);
              }
            }
          }
      );
    }
}
