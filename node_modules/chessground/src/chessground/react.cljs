(ns chessground.react
  (:require [chessground.common :refer [pp]]))

(def dom (.-DOM js/React))

(def div (.-div dom))

(defn class-set [obj]
  (-> obj
      js/Object.keys
      (.filter #(aget obj %))
      (.join " ")))
