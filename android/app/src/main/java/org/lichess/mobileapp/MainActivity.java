package org.lichess.mobileapp;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PatternMatcher;
import android.util.Log;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Dialogs;
import com.getcapacitor.Plugin;
import com.getcapacitor.community.keepawake.KeepAwake;
import com.getcapacitor.plugin.Storage;

import org.lichess.plugin.SoundEffect;
import org.lichess.mobileapp.stockfish.Stockfish;
import org.lichess.mobileapp.BuildConfig;

import java.io.File;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.regex.Pattern;

public class MainActivity extends BridgeActivity {

  private static String LOGTAG = "LichessActivity";
  private static Integer MIN_VERSION = 69;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      add(LiToast.class);
      add(LiShare.class);
      add(SoundEffect.class);
      add(KeepAwake.class);
      add(Stockfish.class);
    }});

    this.versionUpdateActions();

    PackageInfo pInfo = getCurrentWebViewPackageInfo();
    if (pInfo != null) {
      try {
        Integer majorVersion = Integer.parseInt(pInfo.versionName.split(Pattern.quote("."))[0]);
        if (majorVersion < MIN_VERSION) {
          String title = "Update required!";
          String appName;
          try {
            PackageManager pm = this.getPackageManager();
            ApplicationInfo ai = pm.getApplicationInfo(pInfo.packageName, 0);
            appName = (String) pm.getApplicationLabel(ai);
          } catch (final PackageManager.NameNotFoundException e) {
            appName = "WebView";
          }
          String message = "lichess needs a recent version of the rendering engine which is provided by" +
                  " the '" + appName   + "' application. The version you're using is too old ("
                  + pInfo.versionName + "). Please update it or lichess will not work.";
          Dialogs.confirm(this, message, title, "OK", "Cancel", new Dialogs.OnResultListener() {
            @Override
            public void onResult(boolean value, boolean didCancel, String inputValue) {
              if (!didCancel) {
                openGooglePlayPage(pInfo.packageName);
              }
            }
          });

        }
      } catch (NumberFormatException e) {
        Log.e(LOGTAG, "Cannot parse packageinfo version");
      }
    }
  }

  private PackageInfo getCurrentWebViewPackageInfo() {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        /* Starting with Android O (API 26) they added a new method specific for this */
        return WebView.getCurrentWebViewPackage();
      } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        /*
         * With Android Lollipop (API 21) they started to update the WebView
         * as a separate APK with the PlayStore and they added the
         * getLoadedPackageInfo() method to the WebViewFactory class and this
         * should handle the Android 7.0 behaviour changes too.
         */
        Class webViewFactory = Class.forName("android.webkit.WebViewFactory");
        Method method = webViewFactory.getMethod("getLoadedPackageInfo");
        return (PackageInfo) method.invoke(null);
      } else {
        /* Before Lollipop the WebView was bundled with the OS. */
        try {
          return this.getPackageManager().getPackageInfo("com.google.android.webview", 0);
        } catch (PackageManager.NameNotFoundException e) {
          Log.e(LOGTAG, "Cannot find package info: " + e.getMessage());
        }
      }
      return null;
    } catch (Exception e) {
      Log.e(LOGTAG, "Cannot determine current WebView engine. (" + e.getMessage() + ")");
      return null;
    }
  }

  private void openGooglePlayPage(String packageName) throws android.content.ActivityNotFoundException {

    String pName =
            packageName.equals("com.android.webview") ? "com.google.android.webview" : packageName;

    try {
      Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + pName));
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      startActivity(intent);
    } catch (android.content.ActivityNotFoundException e) {
      Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=" + pName));
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      startActivity(intent);
    } catch (Exception e) {
      Log.e(LOGTAG, "Cannot open Google Play. (" + e.getMessage() + ")");
    }
  }

  private void versionUpdateActions() {
    SharedPreferences prefs = getSharedPreferences("LiVersionCheck", Context.MODE_PRIVATE);
    int previousVersionCode = prefs.getInt("LAST_VERSION_CODE", 0);
    if (BuildConfig.VERSION_CODE > previousVersionCode) {
      // fix home quick setup loading bug when going from 6.x to 7.x
      if (previousVersionCode == 0) {
        deleteDir(getApplicationContext().getCacheDir());
      }
      SharedPreferences.Editor editor = prefs.edit();
      editor.putInt("LAST_VERSION_CODE", BuildConfig.VERSION_CODE);
      editor.apply();
    }
  }

  private static boolean deleteDir(File dir) {
    if (dir != null && dir.isDirectory()) {
      String[] children = dir.list();
      for (int i = 0; i < children.length; i++) {
        boolean success = deleteDir(new File(dir, children[i]));
        if (!success) {
          return false;
        }
      }
      return dir.delete();
    } else if(dir!= null && dir.isFile()) {
      return dir.delete();
    } else {
      return false;
    }
  }
}
