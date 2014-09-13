(ns chessground.drag
  "Make pieces draggable, and squares droppable"
  (:require [chessground.common :as common :refer [pp]]
            [chessground.chess :as chess]
            [cljs.core.async :as a]))

(def ^private class-dragging "dragging")
(def ^private class-drag-over "drag-over")

(def ^private dragging-div-pos
  (atom {}))

(when common/touch-device?
  (.addEventListener js/document "DOMContentLoaded"
                     (fn []
                       (let [div (.createElement js/document "div")]
                         (set! (.-id div) "cg-moving-square")
                         (.appendChild (.-body js/document) div)))))

; from interact.js
(def ^private get-scroll-xy
  {:x (or js/scrollX (-> js/document .-documentElement .-scrollLeft))
   :y (or js/scrollY (-> js/document .-documentElement .-scrollTop))})

(def ^private iStuffRe (js/RegExp. (.-source "ipad|iphone|ipod") "i"))

(def ^private scroll (if (.test iStuffRe (.-userAgent js/navigator))
                       {:x 0 :y 0}
                       get-scroll-xy))

; from interact.js with some differences
(defn- get-element-rect [element]
  (let [rect (.getBoundingClientRect element)]
    {:left (+ (.-left rect) (:x scroll))
     :right (+ (.-right rect) (:x scroll))
     :top (+ (.-top rect) (:y scroll))
     :bottom (+ (.-bottom rect) (:y scroll))
     :width (or (.-width rect) (- (.-right rect) (.-left rect)))
     :height (or (.-height rect) (- (.-bottom rect) (.-top rect)))}))

(defn- on-start [event center-piece]
  "Shift piece right under the cursor"
  (let [piece (.-target event)]
    (-> piece .-classList (.add class-dragging))
    (when center-piece
      (let [pos (common/offset piece)
            center-x (+ (:left pos) (/ (.-offsetWidth piece) 2))
            center-y (+ (:top pos) (/ (.-offsetHeight piece) 2))
            decay-x (- (.-pageX event) center-x)
            decay-y (- (.-pageY event) center-y)]
        (set! (.-x piece) decay-x)
        (set! (.-y piece) decay-y)))))

(defn- on-move [event]
  (let [piece (.-target event)
        x (+ (or (.-x piece) 0) (.-dx event))
        y (+ (or (.-y piece) 0) (.-dy event))
        transform (common/translate x y)]
    (set! (.-x piece) x)
    (set! (.-y piece) y)
    (aset (.-style piece) common/transform-prop transform)))

(defn- unfuck [piece]
  (set! (.-x piece) 0)
  (set! (.-y piece) 0)
  (aset (.-style piece) common/transform-prop ""))

(defn- on-end [event ctrl]
  (let [piece (.-target event)
        orig (.-parentNode piece)
        dest (.-dropzone event)]
    (when-let [dragging-div (.getElementById js/document "cg-moving-square")]
      (set! (-> dragging-div .-style .-display) "none"))
    (when dest
      (-> dest .-classList (.remove class-drag-over)))
    (-> piece .-classList (.remove class-dragging))
    (.setTimeout js/window #(unfuck piece) 20)
    ; are orig and dest from the same chess board?
    (if (and dest (= (.-parentNode orig) (.-parentNode dest)))
      (ctrl :drop-on (.getAttribute dest "data-key"))
      (ctrl :drop-off))))

(defn- on-click-dragenter [event]
  (-> event .-target .-classList (.add class-drag-over)))

(defn- on-click-dragleave [event]
  (-> event .-target .-classList (.remove class-drag-over)))

(defn- on-touch-dragenter [event]
  (let [rect (get-element-rect (.-target event))
        h (- (:height rect) 1)
        w (- (:width rect) 1)
        h2 (* h 2)
        w2 (* w 2)
        dragging-div (.getElementById js/document "cg-moving-square")]
    (when (not (.-offsetParent dragging-div))
      (set! (-> dragging-div .-style .-height) (str h2 "px"))
      (set! (-> dragging-div .-style .-width) (str w2 "px"))
      (set! (-> dragging-div .-style .-left) (str (- (:left rect) (/ w 2)) "px"))
      (set! (-> dragging-div .-style .-top) (str (- (:top rect) (/ h 2)) "px"))
      (set! (-> dragging-div .-style .-display) "block")
      (reset! dragging-div-pos rect))
    (let [pos @dragging-div-pos
          x (- (:left rect) (:left pos))
          y (- (:top rect) (:top pos))]
      (aset (.-style dragging-div) common/transform-prop (common/translate x y)))))

(defn- on-touch-dragleave [] nil)

(defn square [el]
  (-> (js/interact el)
      (.dropzone true)
      (.on "dragenter" (if common/touch-device? on-touch-dragenter on-click-dragenter))
      (.on "dragleave" (if common/touch-device? on-touch-dragleave on-click-dragleave))))

(defn piece [el ctrl draggable?]
  (-> (js/interact el)
      (.draggable draggable?)
      (.on "dragstart" #(on-start % true))
      (.on "dragmove" on-move)
      (.on "dragend" #(on-end % ctrl))))

(defn piece-switch [instance draggable?]
  (.set instance #js {:draggable draggable?}))
