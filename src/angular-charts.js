/**
 * Main module
 */
angular.module('angularCharts', ['angularChartsTemplates']);

/**
 * Main directive handling drawing of all charts
 */
angular.module('angularCharts').directive('acChart', function($templateCache, $compile, $rootElement, $window, $timeout, $sce, acChartLogic) {

  var defaultColors = [
    'rgb(255,153,0)',
    'rgb(220,57,18)',
    'rgb(70,132,238)',
    'rgb(73,66,204)',
    'rgb(0,128,0)',
    'rgb(0, 169, 221)',
    'steelBlue',
    'rgb(0, 169, 221)',
    'rgb(50, 205, 252)',
    'rgb(70,132,238)',
    'rgb(0, 169, 221)',
    'rgb(5, 150, 194)',
    'rgb(50, 183, 224)',
    'steelBlue',
    'rgb(2, 185, 241)',
    'rgb(0, 169, 221)',
    'steelBlue',
    'rgb(0, 169, 221)',
    'rgb(50, 205, 252)',
    'rgb(70,132,238)',
    'rgb(0, 169, 221)',
    'rgb(5, 150, 194)',
    'rgb(50, 183, 224)',
    'steelBlue',
    'rgb(2, 185, 241)'
  ];

  /**
   * Utility function that gets the child that matches the classname
   * because Angular.element.children() doesn't take selectors
   * it's still better than a whole jQuery implementation
   * @param  {Array}  childrens       An array of childrens - element.children() or element.find('div')
   * @param  {String} className       Class name
   * @return {Angular.element|null}    The founded child or null
   */
  function getChildrenByClassname(childrens, className) {
    var child = null;

    for (var i in childrens) {
      if (angular.isElement(childrens[i])) {
        child = angular.element(childrens[i]);
        if (child.hasClass(className))
          return child;
      }
    }

    return child;
  }

  /**
   * Main link function
   * @param  {[type]} scope   [description]
   * @param  {[type]} element [description]
   * @param  {[type]} attrs   [description]
   * @return {[type]}         [description]
   */
  function link(scope, element, attrs) {

    var config = {
      title: '',
      tooltips: true,
      labels: false,
      mouseover: function() {},
      mouseout: function() {},
      click: function() {},
      legend: {
        display: true, // can be either 'left' or 'right'.
        position: 'left',
        htmlEnabled: false
      },
      colors: defaultColors,
      innerRadius: 0, // Only on pie Charts
      lineLegend: 'lineEnd', // Only on line Charts
      lineCurveType: 'cardinal',
      isAnimate: true,
      yAxisTickFormat: 's',
      xAxisMaxTicks: null,
      xAxisLabelRotation: 0 //Degrees of rotation
    };

    var totalWidth = element[0].clientWidth;
    var totalHeight = element[0].clientHeight;

    if (totalHeight === 0 || totalWidth === 0) {
      throw new Error('Please set height and width for the chart element');
    }


    var data,
      series,
      points,
      chartType;

    //Passed into chartFunctions
    var box = {
      height: 0,
      width: 0,
      chartContainer: null,
      legendContainer: null,
      yMaxData: 0,
      legends: []
    };

    /**
     * Passed into the chartFunctions to keep $scope out of the provider
     */
    var domFunctions = {
      makeToolTip: function(data, d, event){
        makeToolTip(data, event);
        config.mouseover(d, event);
        scope.$apply();
      },
      removeToolTip: function(d, event){
        removeToolTip();
        config.mouseout(d, event);
        scope.$apply();
      },
      updateToolTip: function(d, event){
        updateToolTip(d, event);
      },
      click: function(d, event){
        config.click.call(d, event);
        scope.$apply();
      }
    };

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
      acChartLogic.callChartFunction(chartType, config, box, domFunctions, series, points);
      setYMaxData();
      drawLegend();
    }

    /**
     * Sets height and width of chart area based on legend
     * used for setting radius, bar width of chart
     */
    function setHeightWidth() {
      if (!config.legend.display) {
        box.height = totalHeight;
        box.width = totalWidth;
        return;
      }
      switch (config.legend.position) {
        case 'top':
        case 'bottom':
          box.height = totalHeight * 0.75;
          box.width = totalWidth;
          break;
        case 'left':
        case 'right':
          box.height = totalHeight;
          box.width = totalWidth * 0.75;
          break;
      }
    }

    /**
     * Creates appropriate DOM structure for legend + chart
     */
    function setContainers() {
      if(box.chartContainer == null && box.legendContainer == null){
        var container = $templateCache.get('angularChartsTemplate_' + config.legend.position);
        element.html(container); //http://stackoverflow.com/a/17883151
        

        //getting children divs
        var childrens = element.find('div');
        box.chartContainer = getChildrenByClassname(childrens, 'ac-chart');
        box.legendContainer = getChildrenByClassname(childrens, 'ac-legend');
        box.height -= getChildrenByClassname(childrens, 'ac-title')[0].clientHeight;
      }else{
        d3.select(box.chartContainer[0]).selectAll('svg').remove();
        d3.select(box.legendContainer[0]).selectAll('tr').remove();
      }

      $compile(element.contents())(scope);
    }

    /**
     * Parses data from attributes
     * @return {[type]} [description]
     */
    function prepareData() {
      data = scope.acData;
      chartType = scope.acChart;
      series = (data) ? data.series || [] : [];
      points = (data) ? data.data || [] : [];

      if (scope.acConfig) {
        angular.extend(config, scope.acConfig);
      }
    }

    /**
     * Set yMaxData
     */
     function setYMaxData(){
      scope.yMaxData = d3.max(points.map(function(d){
        return d.y.length;
      }));
     }

    /**
     * Creates and displays tooltip
     * @return {[type]} [description]
     */
    function makeToolTip(data, event) {
      if (!config.tooltips) {
        return;
      }
      if (typeof config.tooltips === 'function') {
        data = config.tooltips(data);
      } else {
        data = data.value;
      }

      var el = angular.element('<p class="ac-tooltip"></p>')
        .html(data)
        .css({
          left: (event.pageX + 20) + 'px',
          top: (event.pageY - 30) + 'px'
        });

      angular.element(document.querySelector('.ac-tooltip')).remove();
      angular.element(document.body).append(el);

      scope.$tooltip = el;
    }

    /**
     * Clears the tooltip from body
     * @return {[type]} [description]
     */
    function removeToolTip() {
      if (scope.$tooltip) {
        scope.$tooltip.remove();
      }
    }

    function updateToolTip(d, event) {
      if (scope.$tooltip) {
        scope.$tooltip.css({
          left: (event.pageX + 20) + 'px',
          top: (event.pageY - 30) + 'px'
        });
      }
    }

    /**
     * Adds data to legend
     * @return {[type]} [description]
     */
    function drawLegend() {
      scope.legends = box.legends;
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