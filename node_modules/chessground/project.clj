(defproject org.lichess/chessground "0.3.8"
  :description "Extendable basics for chess UIs."
  :license {:name "MIT" :url "http://opensource.org/licenses/MIT"}
  :plugins [[lein-cljsbuild "1.0.3"]]
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/clojurescript "0.0-2322"]
                 [org.clojure/core.async "0.1.338.0-5c5012-alpha"]
                 [com.facebook/react "0.11.1"]]
  :cljsbuild
  {:builds
   {:dev
    {:source-paths ["src"]
     :compiler
     {:output-to "chessground.dev.js"
      :output-dir "out-dev"
      :optimizations :none
      :source-map true}}
    :prod
    {:source-paths ["src"]
     :compiler
     {:output-to "chessground.prod.js"
      :output-dir "out-prod"
      :optimizations :advanced
      :externs ["libs/interact.js" "react/externs/react.js"]
      :pretty-print false
      :output-wrapper false
      :closure-warnings {:externs-validation :off
                         :non-standard-jsdoc :off}}}}})
