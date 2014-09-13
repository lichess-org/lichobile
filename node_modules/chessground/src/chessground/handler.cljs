(ns chessground.handler
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]
            [chessground.fen :as fen]
            [chessground.ctrl :as ctrl]
            [chessground.api :as api]
            [cljs.core.async :as a]))

(defn- do-process [k msg]
  (case k
    :set                  #(api/set-config % msg)
    :select-square        #(ctrl/select-square % msg)
    :drop-off             ctrl/drop-off
    :drop-on              #(ctrl/drop-on % msg)
    :toggle-orientation   data/toggle-orientation
    :get-orientation      #(a/put! msg (:orientation %))
    :get-position         #(a/put! msg (chess/get-pieces (:chess %)))
    :get-fen              #(a/put! msg (fen/dump (:chess %)))
    :get-state            #(a/put! msg %)
    :get-current-premove  #(a/put! msg (-> % :premovable :current))
    :api-move             #(data/api-move-piece % msg)
    :set-pieces           (fn [app] (update-in app [:chess] #(chess/set-pieces % msg)))
    :play-premove         data/play-premove))

(defn process
  "Return a function that transforms an app data"
  [k msg]
  (fn [app]
    (let [new-app ((do-process k msg) app)]
      (if (contains? new-app :chess) new-app app))))
