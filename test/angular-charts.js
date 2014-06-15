/**
* Utility function that gets the child that matches the classname
* because Angular.element.children() doesn't take selectors
* it's still better than a whole jQuery implementation
* @param  {Array}  childrens       An array of childrens - element.children() or element.find('div')
* @param  {String} className       Class name
* @return {Angular.element|null}    The founded child or null
*/
function find(childrens, className) {
  var child = null;

  for(var i in childrens) {
    if(angular.isElement(childrens[i])) {
      child = angular.element(childrens[i]);
      if(child.hasClass(className))
        return child;
    }
  }

  return child;
}


describe('angularCharts', function() {
  var $scope, $compile, $chart, $chart_childrens, body //we'll be working on a unique chart
    , numberOfPoints

  // load the charts code
  beforeEach(module('angularCharts'));

  beforeEach(inject(function (_$rootScope_, _$compile_) {
    $scope = _$rootScope_
    $compile = _$compile_


    $scope.data = {
      series: ['Sales', 'Income', 'Expense'],
      data : [{
        x : "Sales",
        y: [100,500, 0],
        tooltip:"this is tooltip"
      },
      {
        x : "Not Sales",
        y: [300, 100, 100]
      },
      {
        x : "Tax",
        y: [351]
      },
      {
        x : "Not Tax",
        y: [54, 0, 879]
      }]
    }

    $scope.chartType = 'bar';

    $scope.config = {
      labels: true,
      title : "Not Products",
      legend : {
        display:true,
        position:'left'
      }
    }

    body = body === undefined ? angular.element(document.body).append('<div ac-chart="chartType" ac-data="data" ac-config="config" id="chart"></div>') : body


    //just counting number of points in the data scope
    numberOfPoints = 0

    for(var i in $scope.data.data) {

      for(var j in $scope.data.data[i]) {

        if(typeof $scope.data.data[i][j] == 'object') {

          if($scope.data.data[i][j].indexOf(0) === -1)
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

  it('should throw width/height error', function() {
    expect(compileChart).toThrow()
  })

  it('should throw width/height error', function() {
    angular.element(document.body).append('<style type="text/css">#chart { width:150px; height: 300px}</style>')
    expect(compileChart).not.toThrow()
  })

  it('should digest scope', function() {
    compileChart()
    $scope.$digest()

    $chart = document.getElementById('chart')
    $chart_childrens = angular.element($chart).children()
  })

  it('should have the right DOM title', function() {
    expect(find($chart_childrens, 'ac-title').text()).toEqual('Not Products')
  })

  it('should have the right elements in the legend', function() {

    var $legendItems = find($chart_childrens, 'ac-legend').find('tbody').children()

    expect($legendItems.length).toEqual($scope.data.series.length)

    for(var i in $scope.data.series) {
      expect(find($legendItems[i], 'ng-binding').text()).toEqual($scope.data.series[i])
    }

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

})