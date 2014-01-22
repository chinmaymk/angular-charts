var angularCharts = angularCharts || {};

/**
* Main module
*/
angular.module('angularCharts', ['angularChartsTemplates']);

/**
* Main directive handling drawing of all charts
*/
angular.module('angularCharts').directive('acChart', function($templateCache, $compile, $window) {

  /**
   * Main link function
   * @param  {[type]} scope   [description]
   * @param  {[type]} element [description]
   * @param  {[type]} attrs   [description]
   * @return {[type]}         [description]
   */
  function link(scope, element, attrs) {
    
  }

  return {
    restrict:'EA',
    link : link,
    controller: angularCharts.ChartController,
    scope: {
      acChart : '=',
      acData : '=',
      acConfig: '='
    }
  } 
});
