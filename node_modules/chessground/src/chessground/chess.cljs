(ns chessground.chess
  "Immutable board data. Does not implement chess rules"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.fen :as forsyth]
            [chessground.premove :as premove]))

(comment
  ; Representation of a chess game:
  {"a1" nil
   "a2" {:color "white" ; piece color
         :role "king" ; piece role
         }})

(def colors ["white" "black"])
(def roles ["pawn" "rook" "knight" "bishop" "queen" "king"])

(def clear
  (into {} (for [rank (range 1 9)
                 file ["a" "b" "c" "d" "e" "f" "g" "h"]
                 :let [key (str file rank)]]
             [key nil])))

(defn make [fen]
  (merge
    clear
    (forsyth/parse (if (= fen "start") forsyth/default fen))))

(defn get-piece [chess key] (get chess key))

(defn get-pieces [chess] (into {} (filter second chess)))

(comment
  {"white" {"pawn" 3 "queen" 1}
   "black" {"bishop" 2}})
(defn material-diff [chess]
  (reduce (fn [diff [role value]]
            (if (= value 0) diff
              (assoc-in diff [(if (> value 0) "white" "black") role] (Math/abs value))))
          {"white" {} "black" {}}
          (reduce (fn [acc [_ {color :color role :role}]]
                    (update-in acc [role] (if (= color "white") inc dec)))
                  {}
                  (get-pieces chess))))

(defn remove-piece [chess key] (assoc chess key nil))

(defn put-piece [chess key piece] (assoc chess key piece))

(defn set-pieces [chess changes]
  (reduce (fn [c [key p]]
            (if p (put-piece c key p) (remove-piece c key)))
          chess changes))

(defn move-piece [chess [orig dest]]
  "Return nil if orig and dest make no sense"
  (or (when (not= orig dest)
        (when-let [piece (get-piece chess orig)]
          (-> chess
              (remove-piece orig)
              (put-piece dest piece))))
      chess))
