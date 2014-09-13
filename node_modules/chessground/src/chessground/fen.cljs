(ns chessground.fen
  "Forsyth Edwards notation"
  (:require [chessground.common :refer [pp]]
            [clojure.string :refer [lower-case upper-case join]]))

(def default "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

(def ^private role-names {"p" "pawn"
                          "r" "rook"
                          "n" "knight"
                          "b" "bishop"
                          "q" "queen"
                          "k" "king"})

(def ^private role-keys
  (into {} (map (fn [[k v]] [v k]) role-names)))

(defn- num->key [pos]
  (str (get "abcdefgh" (mod pos 8))
       (- 8 (int (/ pos 8)))))

(defn- parse-squares
  "Parses a FEN-notation of a chess board into a map of locations ->
   piece, where piece is represented as {:role r, :color c}."
  [fen-chars]
  (loop [pieces {}
         pos 0
         [current & next] fen-chars]
    (let [as-int (js/parseInt current)
          spaces (when-not (js/isNaN as-int) as-int)]
      (cond
        (> pos 63) pieces
        (= current "/") (recur pieces pos next)
        (not (nil? spaces)) (recur pieces (+ pos spaces) next)
        :else (let [key (num->key pos)
                    lower (lower-case current)
                    piece {:role (get role-names lower)
                           :color (if (= current lower) "black" "white")}]
                (recur (assoc pieces key piece) (inc pos) next))))))

(defn parse [fen]
  (parse-squares
    (->> (or fen default)
         (remove #(= "/" %))
         (take-while #(not= \space %)))))

(defn- piece->str [piece]
  (cond-> (get role-keys (:role piece))
    (= "white" (:color piece)) upper-case))

(defn dump [chess]
  (reduce #(.replace %1 (js/RegExp. (apply str (repeat %2 1)) "g") %2)
          (join "/"
                (for [rank (range 8 0 -1)]
                  (apply str
                         (for [file "abcdefgh"]
                           (if-let [piece (get chess (str file rank))]
                             (piece->str piece)
                             1)))))
          (range 8 1 -1)))

