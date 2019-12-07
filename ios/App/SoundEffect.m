//
//  SoundEffect.m
//  App
//
//  Created by Vincent on 07/10/2019.
//


#import <Capacitor/Capacitor.h>

CAP_PLUGIN(SoundEffect, "SoundEffect",
           CAP_PLUGIN_METHOD(loadSound, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(play, CAPPluginReturnPromise);
           )
