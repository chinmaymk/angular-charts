/**
 * Main directive handling drawing of all charts
 */
angular.module('angularCharts').directive('acChart', function($templateCache, $compile, $rootElement, $window, $timeout, $sce, Utils, pieChart, barChart, lineChart, areaChart, pointChart) {

  /**
   * Main link function
   * @param  {[type]} scope   [description]
   * @param  {[type]} element [description]
   * @param  {[type]} attrs   [description]
   * @return {[type]}         [description]
   */
  function link(scope, element, attrs) {

      var chart = {
          config: {
              title: '',
              tooltips: true,
              labels: false,
              mouseover: function () {},
              mouseout: function () {},
              click: function () {},
              legend: {
                  display: true, // can be either 'left' or 'right'.
                  position: 'left',
                  htmlEnabled: false
              },
              colors: Utils.defaultColors,
              innerRadius: 0, // Only on pie Charts
              lineLegend: 'lineEnd', // Only on line Charts
              lineCurveType: 'cardinal',
              isAnimate: true,
              yAxisTickFormat: 's'
          },
          series: [],
          points: [],
          height: 200,
          width: 300
      };

    var totalWidth = element[0].clientWidth;
    var totalHeight = element[0].clientHeight;

    if (totalHeight === 0 || totalWidth === 0) {
      throw new Error('Please set height and width for the chart element');
    }

    var data,
      legendContainer,
      chartType;

    /**
     * All the magic happens here
     * handles extracting chart type
     * getting data
     * validating data
     * drawing the chart
     * @return {[type]} [description]
     */
    function init() {
      prepareData();
      setHeightWidth();
      setContainers();
      var chartFunc = getChartFunction(chartType);
      chartFunc(chart, scope, getColor);
      drawLegend();
    }

    /**
     * Sets height and width of chart area based on legend
     * used for setting radius, bar width of chart
     */
    function setHeightWidth() {
      if (!chart.config.legend.display) {
        chart.height = totalHeight;
        chart.width = totalWidth;
        return;
      }
      switch (chart.config.legend.position) {
        case 'top':
        case 'bottom':
        chart.height = totalHeight * 0.75;
        chart.width = totalWidth;
          break;
        case 'left':
        case 'right':
            chart.height = totalHeight;
            chart.width = totalWidth * 0.75;
          break;
      }
    }

    /**
     * Creates appropriate DOM structure for legend + chart
     */
    function setContainers() {
      var container = $templateCache.get('angularChartsTemplate_' + chart.config.legend.position);
      element.html(container); //http://stackoverflow.com/a/17883151
      $compile(element.contents())(scope);

      //getting children divs
      var childrens = element.find('div');
      chart.chartContainer = Utils.getChildrenByClassname(childrens, 'ac-chart');
      legendContainer = Utils.getChildrenByClassname(childrens, 'ac-legend');

        chart.height -= Utils.getChildrenByClassname(childrens, 'ac-title')[0].clientHeight;
    }

    /**
     * Parses data from attributes
     * @return {[type]} [description]
     */
    function prepareData() {
      data = scope.acData;
      chartType = scope.acChart;
      chart.series = (data) ? data.series || [] : [];
      chart.points = (data) ? data.data || [] : [];

      if (scope.acConfig) {
        angular.extend(chart.config, scope.acConfig);
      }
    }

    /**
     * Returns appropriate chart function to call
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    function getChartFunction(type) {
      var charts = {
        'pie': pieChart,
        'bar': barChart,
        'line': lineChart,
        'area': areaChart,
        'point': pointChart
      };
      return charts[type];
    }





    /**
     * Adds data to legend
     * @return {[type]} [description]
     */
    function drawLegend() {
      scope.legends = [];
      if (chartType === 'pie') {
        angular.forEach(chart.points, function(value, key) {
          scope.legends.push({
            color: chart.config.colors[key],
            title: getBindableTextForLegend(value.x)
          });
        });
      }
      if (chartType === 'bar' || chartType === 'area' || chartType === 'point' ||
        (chartType === 'line' && chart.config.lineLegend === 'traditional')) {
        angular.forEach(chart.series, function(value, key) {
          scope.legends.push({
            color: chart.config.colors[key],
            title: getBindableTextForLegend(value)
          });
        });
      }
    }

    function getBindableTextForLegend(text) {
      return $sce.trustAsHtml(chart.config.legend.htmlEnabled ? text : Utils.escapeHtml(text));
    }

    /**
     * Checks if index is available in color
     * else returns a random color
     * @param  {[type]} i [description]
     * @return {[type]}   [description]
     */
    function getColor(i) {
      if (i < chart.config.colors.length) {
        return chart.config.colors[i];
      } else {
        var color = Utils.getRandomColor();
          chart.config.colors.push(color);
        return color;
      }
    }

    var w = angular.element($window);
    var resizePromise = null;
    w.bind('resize', function(ev) {
      resizePromise && $timeout.cancel(resizePromise);
      resizePromise = $timeout(function() {
        totalWidth = element[0].clientWidth;
        totalHeight = element[0].clientHeight;
        init();
      }, 100);
    });

    scope.getWindowDimensions = function() {
      return {
        'h': w[0].clientHeight,
        'w': w[0].clientWidth
      };
    };

    // Watch for any of the config changing.
    scope.$watch('[acChart, acData, acConfig]', init, true);

    scope.$watch(function() {
        return {
          w: element[0].clientWidth,
          h: element[0].clientHeight
        };
      },
      function(newvalue) {
        totalWidth = newvalue.w;
        totalHeight = newvalue.h;
        init();
      }, true);
  }

  return {
    restrict: 'EA',
    link: link,
    transclude: 'true',
    scope: {
      acChart: '=',
      acData: '=',
      acConfig: '='
    }
  };
});


