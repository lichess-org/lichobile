(ns chessground.ui
  (:require [chessground.common :as common :refer [pp]]
            [chessground.data :as data]
            [chessground.chess :as chess]
            [chessground.premove :as premove]
            [chessground.drag :as drag]
            [chessground.animation :as animation])
  (:require-macros [cljs.core.async.macros :as am]))

(def ^private dom (.-DOM js/React))

(def ^private div (.-div dom))

(defn- class-set [obj] (-> obj js/Object.keys (.filter #(aget obj %)) (.join " ")))

(defn- piece-hash [piece]
  (when piece
    (.join #js [(aget piece "color") (aget piece "role") (aget piece "draggable?")] "")))

(defn- make-diff [prev next]
  (fn [k] (not (== (aget prev k) (aget next k)))))

(def ^private piece-component
  (js/React.createClass
    #js
    {:displayName "Piece"
     :getInitialState (fn [] #js {:x 0 :y 0})
     ; :shouldComponentUpdate
     ; (fn [next-props next-state]
     ;   (this-as this
     ;            (or (not= 0 (aget next-state "x") (aget next-state "y"))
     ;                (not (== (piece-hash (.-props this))
     ;                         (piece-hash next-props))))))
     :componentDidMount
     (fn []
       (this-as this
                (.setState this #js {:draggable-instance (drag/piece
                                                           (.getDOMNode this)
                                                           (aget (.-props this) "ctrl")
                                                           (aget (.-props this) "draggable?"))})
                (when-let [anim (aget (.-props this) "anim")]
                  (animation/piece this anim))))
     :componentWillUpdate
     (fn [next-props _]
       (this-as this
                (when (not= (aget next-props "draggable?")
                            (aget (.-props this) "draggable?"))
                  (drag/piece-switch (aget (.-state this) "draggable-instance")
                                     (aget next-props "draggable?")))))
     :componentWillUnmount
     (fn []
       (this-as this
                (-> this .-state (aget "draggable-instance") .unset)))
     :render
     (fn []
       (this-as this
                (let [dx (aget (.-state this) "x")
                      dy (aget (.-state this) "y")
                      style (when (not= 0 dx dy)
                              (let [translation (common/translate dx dy)
                                    st (js-obj)]
                                (aset st common/transform-prop translation)
                                st))]
                  (div #js {:className (.join #js ["cg-piece"
                                                   (aget (.-props this) "color")
                                                   (aget (.-props this) "role")] " ")
                            :style style}))))}))

(def ^private square-component
  (js/React.createClass
    #js
    {:displayName "Square"
     :shouldComponentUpdate
     (fn [next-props _]
       (this-as this
                (let [diff? (make-diff (.-props this) next-props)]
                  (or (diff? "selected?")
                      (diff? "move-dest?")
                      (diff? "premove-dest?")
                      (diff? "check?")
                      (diff? "last-move?")
                      (diff? "current-premove?")
                      (diff? "orientation")
                      (not (== (piece-hash (aget (.-props this) "piece"))
                               (piece-hash (aget next-props "piece"))))))))
     :componentDidMount
     (fn []
       (this-as this
                (let [el (.getDOMNode this)
                      key (aget (.-props this) "key")
                      ctrl (aget (.-props this) "ctrl")]
                  (let [ev (if common/touch-device? "touchstart" "mousedown")]
                    (.addEventListener el ev (fn [e]
                                               (.preventDefault e)
                                               (ctrl :select-square key))))
                  (drag/square el))))
     :render
     (fn []
       (this-as this
                (let [read #(aget (.-props this) %)
                      orientation (read "orientation")
                      ctrl (read "ctrl")
                      key (read "key")
                      white? (= orientation "white")
                      x (inc (.indexOf "abcdefgh" (get key 0)))
                      y (js/parseInt (get key 1))
                      style-x (str (* (dec x) 12.5) "%")
                      style-y (str (* (dec y) 12.5) "%")]
                  (div #js
                       {:style (if white?
                                 #js {"left" style-x "bottom" style-y}
                                 #js {"right" style-x "top" style-y})
                        :className (class-set #js {"cg-square" true
                                                   "selected" (read "selected?")
                                                   "check" (read "check?")
                                                   "last-move" (read "last-move?")
                                                   "move-dest" (read "move-dest?")
                                                   "premove-dest" (read "premove-dest?")
                                                   "current-premove" (read "current-premove?")})
                        :data-key key
                        :data-coord-x (when (== y (if white? 1 8)) (get key 0))
                        :data-coord-y (when (== x (if white? 8 1)) y)}
                       (when-let [piece (read "piece")]
                         (piece-component piece))))))}))

(def board-component
  (js/React.createClass
    #js
    {:displayName "Board"
     :render
     (fn []
       (this-as this
                (div #js {:className "cg-board"}
                     (.map (aget (.-props this) "chess")
                           square-component))))}))

(def ^private all-keys
  (let [arr (array)]
    (loop [rank 1]
      (loop [file 1]
        (.push arr (str (aget "abcdefgh" (dec file)) rank))
        (when (< file 8) (recur (inc file))))
      (when (< rank 8) (recur (inc rank))))
    arr))

(defn- array-of [coll] (if coll (clj->js coll) (array)))

(defn clj->react [app ctrl]
  (let [orientation (get app :orientation)
        chess (get app :chess)
        draggable-color (data/draggable-color app)
        last-move (get app :last-move)
        last-move-orig (get last-move 0)
        last-move-dest (get last-move 1)
        selected (get app :selected)
        check (get app :check)
        current-premove (array-of (get (get app :premovable) :current))
        move-dests (array-of (when-let [orig (get app :selected)]
                               (when (data/movable? app orig)
                                 (get-in app [:movable :dests orig]))))
        premove-dests (array-of (when-let [orig (get app :selected)]
                                  (when (data/premovable? app orig)
                                    (when-let [piece (get chess orig)]
                                      (premove/possible chess orig piece)))))
        make-square (fn [key]
                      (let [last-move-index (.indexOf move-dests key)]
                        #js {:key key
                             :ctrl ctrl
                             :orientation orientation
                             :piece (when-let [piece (get chess key)]
                                      (let [color (get piece :color)]
                                        #js {:ctrl ctrl
                                             :color color
                                             :role (get piece :role)
                                             :anim (when (and (== last-move-dest key)
                                                              (get-in app [:animation :enabled?]))
                                                     #js {:orig last-move-orig
                                                          :dest key
                                                          :duration (get-in app [:animation :duration])})
                                             :draggable? (or (= draggable-color "both")
                                                             (= draggable-color color))}))
                             :selected? (== selected key)
                             :check? (== check key)
                             :last-move? (or (== last-move-orig key) (== last-move-dest key))
                             :move-dest? (not (== -1 (.indexOf move-dests key)))
                             :premove-dest? (not (== -1 (.indexOf premove-dests key)))
                             :current-premove? (not (== -1 (.indexOf current-premove key)))}))]
    #js {:chess (.map all-keys make-square)}))
