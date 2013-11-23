angular.module('angularChartsTemplates', ['left']);

angular.module("left", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("left",
    "<div class='ac-legend' style='float:left; witdh:25%'>\n" +
    "</div>\n" +
    "<div class='ac-chart' style='float:left; witdh:75%'>\n" +
    "</div>");
}]);
