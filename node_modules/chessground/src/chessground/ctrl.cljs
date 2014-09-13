(ns chessground.ctrl
  "User actions"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]))

(defn- move-piece [app [orig dest]]
  "A move initiated through the UI"
  (if (= orig dest)
    app
    (or (when (data/can-move? app orig dest)
          (-> app
              (data/move-piece orig dest)
              data/unselect))
        (when (data/can-premove? app orig dest)
          (-> app
              (data/set-premovable-current [orig dest])
              data/unselect))
        (data/set-selected app (when (or (data/movable? app dest)
                                         (data/premovable? app dest))
                                 dest)))))

(defn select-square [app key]
  (if-let [orig (:selected app)]
    (move-piece app [orig key])
    (if (or (data/movable? app key) (data/premovable? app key))
      (data/set-selected app key)
      (data/set-premovable-current app nil))))

(defn drop-off [app]
  (data/unselect
    (or (when (= "trash" (-> app :movable :drop-off))
          (when-let [key (:selected app)]
            (update-in app [:chess] chess/set-pieces {key nil})))
        app)))

(defn drop-on [app dest]
  (if-let [orig (:selected app)]
    (move-piece app [orig dest])
    (drop-off app)))
