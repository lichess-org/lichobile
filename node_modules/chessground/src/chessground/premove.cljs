(ns chessground.premove
  "Computes possible premoves"
  (:require [chessground.common :as common :refer [pp]]))

(defn- diff [a b] (.abs js/Math (- a b)))

(defn- pawn [color [x1 y1] [x2 y2]]
  (and (< (diff x1 x2) 2)
       (if (= color "white")
         (or (= y2 (inc y1))
             (and (= y1 2) (= y2 4) (= x1 x2)))
         (or (= y2 (dec y1))
             (and (= y1 7) (= y2 5) (= x1 x2))))))

(defn- knight [[x1 y1] [x2 y2]]
  (let [xd (diff x1 x2)
        yd (diff y1 y2)]
    (or (and (= 1 xd) (= 2 yd))
        (and (= 2 xd) (= 1 yd)))))

(defn- bishop [[x1 y1] [x2 y2]] (= (diff x1 x2) (diff y1 y2)))

(defn- rook [[x1 y1] [x2 y2]] (or (= x1 x2) (= y1 y2)))

(defn- queen [p1 p2] (or (bishop p1 p2) (rook p1 p2)))

(defn- rook-files-of [ch color]
  (map (comp common/file->pos first first)
       (filter (fn [[k p]] (and (= (:role p) "rook")
                                (= (:color p) color))) ch)))

(defn- king [rook-files color [x1 y1] [x2 y2]]
  (or (and (< (diff x1 x2) 2)
           (< (diff y1 y2) 2))
      (and (= y1 y2 (if (= color "white") 1 8))
           (or (and (= x1 5)
                    (or (= x2 3) (= x2 7)))
               (common/seq-contains? rook-files x2)))))

(defn possible [ch key piece]
  (let [orig (common/key->pos key)
        mobility (case (:role piece)
                   "pawn" (partial pawn (:color piece))
                   "knight" knight
                   "bishop" bishop
                   "rook" rook
                   "queen" queen
                   "king" (let [color (:color piece)]
                            (partial king (rook-files-of ch color) color)))]
    (for [x (range 1 9)
          y (range 1 9)
          :when (mobility orig [x y])]
      (common/pos->key [x y]))))
