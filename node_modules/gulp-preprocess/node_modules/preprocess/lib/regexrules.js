
module.exports = {
  html : {
    echo : "<!--[ \t]*@echo[ \t]*([^\n-]*)[ \t]*-->",
    include : "(.*)<!--[ \t]*@include[ \t]*([^\n]*)[ \t]*-->",
    exclude : {
      start : "(?:[ \t]*)?<!--[ \t]*@exclude[ \t]*([^\n]*)[ \t]*-->(?:[ \t]*[\r\n]+)?",
      end   : "(?:[ \t]*)?<!--[ \t]*@endexclude[ \t]*-->(?:[ \t]*[\r\n]+)?"
    },
    if : {
      start : "(?:[ \t]*)?<!--[ \t]*@if[ \t]*(.*?)(?:(?!-->|!>))[ \t]*(?:-->|!>)(?:[ \t]*[\r\n]+)?",
      end   : "(?:[ \t]*)?<!--[ \t]*@endif[ \t]*-->(?:[ \t]*[\r\n]+)?"
    },
    ifdef : {
      start : "(?:[ \t]*)?<!--[ \t]*@ifdef[ \t]*(.*?)(?:(?!-->|!>))[ \t]*(?:-->|!>)(?:[ \t]*[\r\n]+)?",
      end   : "(?:[ \t]*)?<!--[ \t]*@endif[ \t]*-->(?:[ \t]*[\r\n]+)?"
    },
    ifndef : {
      start : "(?:[ \t]*)?<!--[ \t]*@ifndef[ \t]*(.*?)(?:(?!-->|!>))[ \t]*(?:-->|!>)",
      end   : "(?:[ \t]*)?<!--[ \t]*@endif[ \t]*-->(?:[ \t]*[\r\n]+)?"
    }
  },
  js : {
    echo : "(?://|/\\*)[ \t]*@echo[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
    include : "(.*)(?://|/\\*)[ \t]*@include[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
    exclude : {
      start : "(?:[ \t]*)?(?://|/\\*)[ \t]*@exclude[ \t]*([^\n*]*)[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?",
      end   : "(?:[ \t]*)?(?://|/\\*)[ \t]*@endexclude[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?"
    },
    if : {
      start : "(?:[ \t]*)?(?://|/\\*)[ \t]*@if[ \t]*([^\n*]*)[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?",
      end   : "(?:[ \t]*)?(?://|/\\*)[ \t]*@endif[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?"
    },
    ifdef : {
      start : "(?:[ \t]*)?(?://|/\\*)[ \t]*@ifdef[ \t]*([^\n*]*)[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?",
      end   : "(?:[ \t]*)?(?://|/\\*)[ \t]*@endif[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?"
    },
    ifndef : {
      start : "(?:[ \t]*)?(?://|/\\*)[ \t]*@ifndef[ \t]*([^\n*]*)[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?",
      end   : "(?:[ \t]*)?(?://|/\\*)[ \t]*@endif[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?"
    }
  },
  coffee : {
    echo : "(?://|/\\*)[ \t]*@echo[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
    include : "(.*)(?:#)[ \t]*@include[ \t]*([^\n*]*)[ \t]*(?:\\*/)?",
    exclude : {
      start : "(?:[ \t]*)?(?:#)[ \t]*@exclude[ \t]*([^\n*]*)[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?",
      end   : "(?:[ \t]*)?(?:#)[ \t]*@endexclude[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?"
    },
    if : {
      start : "(?:[ \t]*)?(?:#)[ \t]*@if[ \t]*([^\n*]*)[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?",
      end   : "(?:[ \t]*)?(?:#)[ \t]*@endif[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?"
    },
    ifdef : {
      start : "(?:[ \t]*)?(?:#)[ \t]*@ifdef[ \t]*([^\n*]*)[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?",
      end   : "(?:[ \t]*)?(?:#)[ \t]*@endif[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?"
    },
    ifndef : {
      start : "(?:[ \t]*)?(?:#)[ \t]*@ifndef[ \t]*([^\n*]*)[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?",
      end   : "(?:[ \t]*)?(?:#)[ \t]*@endif[ \t]*(?:\\*/)?(?:[ \t]*[\r\n]+)?"
    }
  }

};

module.exports.xml        = module.exports.html;

module.exports.javascript = module.exports.js;
module.exports.c          = module.exports.js;
module.exports.cc         = module.exports.js;
module.exports.cpp        = module.exports.js;
module.exports.cs         = module.exports.js;
module.exports.csharp     = module.exports.js;
module.exports.java       = module.exports.js;
module.exports.less       = module.exports.js;
module.exports.sass       = module.exports.js;
module.exports.scss       = module.exports.js;
module.exports.css        = module.exports.js;
module.exports.php        = module.exports.js;

module.exports.coffee     = module.exports.coffee;
module.exports.bash       = module.exports.coffee;
module.exports.shell      = module.exports.coffee;
module.exports.sh         = module.exports.coffee;
