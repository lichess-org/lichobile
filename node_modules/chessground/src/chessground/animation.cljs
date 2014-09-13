(ns chessground.animation
  (:require [chessground.common :as common :refer [pp]]))

(defn- key->vector [key size]
  (let [[x y] (common/key->pos key)]
    [(* x size -1) (* y size)]))

(defn- square-vect [el orig dest]
  (let [size (.-clientWidth el)
        orig-vec (key->vector orig size)
        dest-vec (key->vector dest size)]
    #js {:x (- (first dest-vec) (first orig-vec))
         :y (- (second dest-vec) (second orig-vec))}))

(defn- animate [component start-at duration delta]
  (js/requestAnimationFrame
    (fn []
      (let [progress (/ (- (.getTime (js/Date.)) start-at) duration)]
        (if (>= progress 1)
          (.setState component #js {:x 0 :y 0})
          (let [x (aget delta "x")
                y (aget delta "y")
                x2 (* x (- 1 progress))
                y2 (* y (- 1 progress))
                delta2 #js {:x x2 :y y2}]
            (.setState component delta2 #(animate component start-at duration delta))))))))

(defn piece [component anim]
  (let [piece-el (.getDOMNode component)
        square-el (.-parentNode piece-el)
        vect (square-vect square-el (aget anim "orig") (aget anim "dest"))]
    (animate component
             (.getTime (js/Date.))
             (aget anim "duration")
             vect)))
