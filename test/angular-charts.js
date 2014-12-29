describe('angularCharts', function() {
  var $scope, $compile, $chart, $chart_childrens, body //we'll be working on a unique chart
    , numberOfPoints

  // load the charts code
  beforeEach(module('angularCharts'));

  beforeEach(inject(function(_$rootScope_, _$compile_) {
    $scope = _$rootScope_
    $compile = _$compile_


    $scope.data = {
      series: ['Sales', 'Income', 'Expense'],
      data: [{
        x: "Sales",
        y: [100, 500, 0],
        tooltip: "this is tooltip"
      }, {
        x: "Not Sales",
        y: [300, 100, 100]
      }, {
        x: "Tax",
        y: [351]
      }, {
        x: "Not Tax",
        y: [54, 0, 879]
      }]
    }

    $scope.chartType = 'bar';

    $scope.config = {
      labels: true,
      title: "Not Products",
      legend: {
        display: true,
        position: 'left'
      }
    }

    body = body === undefined ? angular.element(document.body).append('<div ac-chart="chartType" ac-data="data" ac-config="config" id="chart"></div>') : body


    //just counting number of points in the data scope
    numberOfPoints = 0

    for (var i in $scope.data.data) {

      for (var j in $scope.data.data[i]) {

        if (typeof $scope.data.data[i][j] == 'object') {

          if ($scope.data.data[i][j].indexOf(0) === -1)
            numberOfPoints += $scope.data.data[i][j].length + 1
          else
            numberOfPoints += $scope.data.data[i][j].length
        }
      }
    }

  }))

  // load the templates
  // beforeEach(module('tpl/tabs.html', 'tpl/pane.html'));


  var compileChart = function() {
    return $compile(body)($scope)
  }

  var widthHeightError = new Error('Please set height and width for the chart element');

  it('should throw width/height error by default', function() {
    expect(compileChart).toThrow(widthHeightError)
  })

  it('should not throw width/height error if the chart has a width/height', function() {
    angular.element(document.body).append('<style type="text/css">#chart { width:150px; height: 300px}</style>')
    expect(compileChart).not.toThrow(widthHeightError)
  })

  it('should not throw error if waitForHeightAndWidth is set to true', function() {
    $scope.config.waitForHeightAndWidth = true
    expect(compileChart).not.toThrow(widthHeightError)
  })

  it('should digest scope', function() {
    compileChart()
    $scope.$digest()

    $chart = document.getElementById('chart')
    $chart_childrens = angular.element($chart).children()
  })

  it('should have the right elements in the legend', function() {

    var $legendItems = $chart.querySelector('.ac-legend tbody').children

    expect($legendItems.length).toEqual($scope.data.series.length)

    for (var i in $scope.data.series) {
      expect($legendItems[i].querySelector('.ng-binding').innerText).toEqual($scope.data.series[i])
    }

  })

  describe('legends', function() {

    it('should escape HTML in the legend if HTML legends are disabled', function() {
      $scope.config.legend.htmlEnabled = false;
      $scope.data.series[0] = '<b>hello</b>';
      compileChart()
      $scope.$digest()
      expect($chart.querySelector('.ac-legend tbody').innerHTML).toContain('&lt;b&gt;hello&lt;/b&gt;');
    })

    it('should preserve HTML in the legend if HTML legends are enabled', function() {
      $scope.config.legend.htmlEnabled = true;
      $scope.data.series[0] = '<b>hello</b>';
      compileChart()
      $scope.$digest()
      expect($chart.querySelector('.ac-legend tbody').innerHTML).toContain('<b>hello</b>');
    })

  })

  describe('bars', function() {

    it('should have the same amount of graphic items as there are datas', function() {
      expect(d3.selectAll('.ac-chart svg > g > g.g').size()).toEqual($scope.data.data.length)
    })

  })

  describe('lines', function() {

    it('should change chartType to line', function() {
      $scope.chartType = 'line'
      compileChart()
      $scope.$digest()
    })

    it('should have the same amount of graphic items as there are series', function() {
      expect(d3.selectAll('.ac-chart svg > g > g:not(.axis)').size()).toEqual($scope.data.series.length)
    })

    it('should have the same amount of circles as there are datas points', function() {
      expect(d3.selectAll('.ac-chart svg > g > circle').size()).toEqual(numberOfPoints)
    })
  })


  describe('point', function() {

    it('should change chartType to point', function() {
      $scope.chartType = 'point'
      compileChart()
      $scope.$digest()
    })

    it('should have the same amount of circles as there are datas points', function() {
      expect(d3.selectAll('.ac-chart svg > g > circle').size()).toEqual(numberOfPoints)
    })
  })

  describe('area', function() {

    it('should change chartType to area', function() {
      $scope.chartType = 'area'
      compileChart()
      $scope.$digest()
    })

    it('should have the same amount of graphic items as there are series', function() {
      expect(d3.selectAll('.ac-chart svg > g > g:not(.axis)').size()).toEqual($scope.data.series.length)
    })
  })

  describe('pie', function() {

    it('should change chartType to pie', function() {
      $scope.chartType = 'pie'
      compileChart()
      $scope.$digest()
    })


    it('should have the same amount of graphic items as there are datas', function() {
      expect(d3.selectAll('.ac-chart svg > g > g').size()).toEqual($scope.data.data.length)
    })
  })

  describe('styles', function() {

    it('should add styles to the document', function() {
      var styleElements = document.querySelectorAll('style');

      // First style element should be Angular's own styles (.ng-show, etc.).
      expect(styleElements[0].innerHTML).toContain('.ng-hide{display:none');

      // Second style element should be Angular chart's styles.
      // They should be namespaced under the template's classes.
      expect(styleElements[1].innerHTML).toContain('.angular-charts-template .axis path,.angular-charts-template .axis line{');

      // Third style element should be the one added in the test suite.
      expect(styleElements[2].innerHTML).toContain('#chart { width:150px;');
    })

  })

  describe('title', function() {
    beforeEach(function() {
      angular.element(document.body).append('<style type="text/css">#chart { width:150px; height: 300px}</style>');
      $scope.chartType = 'area';
    });

    it('should set the title in the title element', function() {
      $scope.config.title = 'My Title';

      compileChart();
      $scope.$digest();

      $chart = document.getElementById('chart')
      expect($chart.querySelectorAll('.ac-title').length).toBe(1);
      expect($chart.querySelector('.ac-title').innerText).toEqual('My Title')
    });

    it('should not have a title element if the title is false', function() {
      $scope.config.title = false;

      compileChart();
      $scope.$digest();

      $chart = document.getElementById('chart');
      expect($chart.querySelectorAll('.ac-title').length).toBe(0);
    });

  });
})
