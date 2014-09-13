(ns chessground.api
  "External JavaScript API exposed to the end user"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]
            [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :as am]))

(defn functions
  "Creates JavaScript functions that push to the channel"
  [tell]
  (letfn [(ask [question callback]
            (let [response-chan (a/chan)]
              (am/go
                (tell question response-chan)
                (callback (clj->js (a/<! response-chan)))
                (a/close! response-chan))
              nil))]
    (clj->js
      {:set               #(tell :set (js->clj % :keywordize-keys true))
       :getOrientation    #(ask :get-orientation %)
       :getPosition       #(ask :get-position %)
       :getFen            #(ask :get-fen %)
       :getState          #(ask :get-state %)
       :getCurrentPremove #(ask :get-current-premove %)
       :toggleOrientation #(tell :toggle-orientation nil)
       :move              #(tell :api-move [%1 %2])
       :setPieces         (fn [pieces]
                            (tell :set-pieces (common/map-values common/keywordize-keys (js->clj pieces))))
       :playPremove       #(tell :play-premove nil)})))

(defn set-config [state raw-config]
  (let [config (if (get-in raw-config [:movable :dests])
                 (update-in raw-config [:movable :dests] common/stringify-keys)
                 raw-config)]
    (reduce (fn [st [cfg k f]]
              (if (contains? cfg k)
                (f st (get cfg k))
                st))
            state
            [[config :fen data/with-fen]
             [config :orientation data/set-orientation]
             [config :turnColor data/set-turn-color]
             [config :check data/set-check]
             [config :lastMove data/set-last-move]
             [config :selected data/set-selected]
             [(:animation config) :enabled data/set-animation-enabled?]
             [(:animation config) :duration data/set-animation-duration]
             [(:movable config) :free data/set-movable-free?]
             [(:movable config) :color data/set-movable-color]
             [(:movable config) :dests data/set-movable-dests]
             [(:movable config) :dropOff data/set-drop-off]
             [(get-in config [:movable :events]) :after data/set-movable-after]
             [(:premovable config) :enabled data/set-premovable-enabled?]
             [(:premovable config) :current data/set-premovable-current]
             ])))

(defn main [config] (set-config data/defaults config))
