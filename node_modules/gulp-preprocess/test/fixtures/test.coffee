#global define

define [], ->
  "use strict"

  # @exclude NODE_ENV='production'
  superExpensiveFunction()
  # @endexclude

  # @if NODE_ENV='production'
  superExpensiveFunction()
  # @endif

  # @include include.txt