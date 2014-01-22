var angularCharts = angularCharts || {
    utils: {
      colorPicker: {
        colors: [
          'steelBlue',
          'rgb(255,153,0)',
          'rgb(220,57,18)',
          'rgb(70,132,238)',
          'rgb(73,66,204)',
          'rgb(0,128,0)'
        ],
        getRandomColor: function () {
          var letters = '0123456789ABCDEF'.split('');
          var color = '#';
          for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
          }
          return color;
        },
        getColor: function (i) {
          if (isNaN(i)) {
            throw 'Expected a numeric index, got ' + typeof i;
          }
          if (i < this.colors.length) {
            return this.colors[i];
          } else {
            var color = this.getRandomColor();
            this.colors.push(color);
            return color;
          }
        }
      }
    }
  };
angularCharts.ChartController = function ($scope, $element, $templateCache, $compile, $window) {
  var config = {
      tooltips: true,
      labels: false,
      mouseover: function () {
      },
      mouseout: function () {
      },
      click: function () {
      }
    };
  var chartType;
  var chartContainer;
  var legendContainer;
  var tooltip = {
      style: [
        'display:none;',
        'position:absolute;',
        'border:1px solid #333;',
        'background-color:#161616;',
        'border-radius:5px;',
        'padding:5px;',
        'color:#fff;'
      ].join(''),
      create: function (data) {
        if (!config.tooltips) {
          return;
        }
        angular.element('<p class="ac-tooltip" style="' + this.style + '"></p>').html(data).appendTo('body').fadeIn('slow');
      },
      remove: function () {
        angular.element('.ac-tooltip').remove();
      },
      update: function () {
        angular.element('.ac-tooltip').css({
          left: d3.event.pageX + 20,
          top: d3.event.pageY - 30
        });
      }
    };
  var helper = {
      showLabels: config.labels,
      mouseover: function (d) {
        config.mouseover();
        var data = d[0].data || d[0];
        tooltip.create(data.tooltip || data.y[0] || data.y);
      },
      mouseout: function () {
      },
      mouseleave: function () {
        tooltip.remove();
      },
      mousemove: function (d) {
        config.mouseout();
        tooltip.update();
      },
      click: function () {
        config.click();
      },
      getDimensions: function () {
        return chartContainer[0].getBoundingClientRect();
      },
      getColor: function (i) {
        return angularCharts.utils.colorPicker.getColor(i);
      }
    };
  function init() {
    var data = $scope.acData;
    chartType = $scope.acChart;
    helper.series = $scope.acSeries || data.series || [];
    helper.points = $scope.acPoints || data.data || [];
    if ($scope.acConfig) {
      angular.extend(config, $scope.acConfig);
    }
    angularCharts[chartType + 'Chart'](setContainers(), helper);
  }
  function setContainers() {
    var container = $templateCache.get('chart');
    $element.html($compile(container)($scope));
    chartContainer = $element.find('.ac-chart');
    legendContainer = $element.find('.ac-legend');
    return chartContainer;
  }
  var winElem = angular.element($window);
  $scope.getWindowDimensions = function () {
    return {
      'h': winElem.height(),
      'w': winElem.width()
    };
  };
  $scope.$watch('acChart', init, true);
  $scope.$watch('acData', init, true);
  $scope.$watch('acConfig', init, true);
  $scope.$watch('acSeries', init, true);
  $scope.$watch('acPoints', init, true);
};var angularCharts = angularCharts || {};
angularCharts.areaChart = function (chartContainer, helper) {
  var width = helper.getDimensions().width, height = helper.getDimensions().height || width;
  var margin = {
      top: 0,
      right: 40,
      bottom: 20,
      left: 40
    };
  width -= margin.left + margin.right;
  height -= margin.top + margin.bottom;
  var x = d3.scale.ordinal().domain(helper.points.map(function (d) {
      return d.x;
    })).rangeRoundBands([
      0,
      width
    ]);
  var y = d3.scale.linear().range([
      height,
      10
    ]);
  var xAxis = d3.svg.axis().scale(x).orient('bottom');
  var yAxis = d3.svg.axis().scale(y).orient('left').ticks(5).tickFormat(d3.format('s'));
  var yData = [0];
  var linedata = [];
  helper.points.forEach(function (d) {
    d.y.map(function (e, i) {
      yData.push(e);
    });
  });
  var yMaxPoints = d3.max(helper.points.map(function (d) {
      return d.y.length;
    }));
  helper.series.slice(0, yMaxPoints).forEach(function (value, index) {
    var d = {};
    d.series = value;
    d.values = helper.points.map(function (point) {
      return point.y.map(function (e) {
        return {
          x: point.x,
          y: e
        };
      })[index] || {
        x: helper.points[index].x,
        y: 0
      };
    });
    linedata.push(d);
  });
  var svg = d3.select(chartContainer[0]).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  var padding = d3.max(yData) * 0.2;
  y.domain([
    d3.min(yData),
    d3.max(yData) + padding
  ]);
  svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
  svg.append('g').attr('class', 'y axis').call(yAxis);
  var point = svg.selectAll('.points').data(linedata).enter().append('g');
  var area = d3.svg.area().interpolate('basis').x(function (d) {
      return getX(d.x);
    }).y0(function (d) {
      return y(0);
    }).y1(function (d) {
      return y(0 + d.y);
    });
  point.append('path').attr('class', 'area').attr('d', function (d) {
    return area(d.values);
  }).style('fill', function (d, i) {
    return helper.getColor(i);
  }).style('opacity', '0.7');
  function getX(d) {
    return Math.round(x(d)) + x.rangeBand() / 2;
  }
  ;
};var angularCharts = angularCharts || {};
angularCharts.barChart = function (chartContainer, helper) {
  var width = helper.getDimensions().width, height = helper.getDimensions().height || width;
  var margin = {
      top: 0,
      right: 20,
      bottom: 30,
      left: 40
    };
  width -= margin.left + margin.right;
  height -= margin.top + margin.bottom;
  var x = d3.scale.ordinal().rangeRoundBands([
      0,
      width
    ], 0.1);
  var y = d3.scale.linear().range([
      height,
      10
    ]);
  var x0 = d3.scale.ordinal().rangeRoundBands([
      0,
      width
    ], 0.1);
  var yData = [0];
  helper.points.forEach(function (d) {
    d.nicedata = d.y.map(function (e, i) {
      yData.push(e);
      return {
        x: d.x,
        y: e,
        s: i
      };
    });
  });
  var yMaxPoints = d3.max(helper.points.map(function (d) {
      return d.y.length;
    }));
  x.domain(helper.points.map(function (d) {
    return d.x;
  }));
  var padding = d3.max(yData) * 0.2;
  y.domain([
    d3.min(yData),
    d3.max(yData) + padding
  ]);
  x0.domain(d3.range(yMaxPoints)).rangeRoundBands([
    0,
    x.rangeBand()
  ]);
  var xAxis = d3.svg.axis().scale(x).orient('bottom');
  var yAxis = d3.svg.axis().scale(y).orient('left').ticks(10).tickFormat(d3.format('s'));
  var svg = d3.select(chartContainer[0]).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
  svg.append('g').attr('class', 'y axis').call(yAxis);
  var barGroups = svg.selectAll('.state').data(helper.points).enter().append('g').attr('class', 'g').attr('transform', function (d) {
      return 'translate(' + x(d.x) + ',0)';
    });
  var bars = barGroups.selectAll('rect').data(function (d) {
      return d.nicedata;
    }).enter().append('rect');
  bars.attr('width', x0.rangeBand());
  bars.attr('x', function (d, i) {
    return x0(i);
  }).attr('y', height).style('fill', function (d, i) {
    return helper.getColor(i);
  }).attr('height', 0).transition().ease('cubic-in-out').duration(1000).attr('y', function (d) {
    return y(Math.max(0, d.y));
  }).attr('height', function (d) {
    return Math.abs(y(d.y) - y(0));
  });
  bars.on('mouseover', function () {
    helper.mouseover.call(helper, arguments);
  }).on('mouseleave', function () {
    helper.mouseleave.call(helper, arguments);
  }).on('mousemove', function () {
    helper.mousemove.call(helper, arguments);
  }).on('click', function () {
    helper.click.call(helper, arguments);
  });
  if (helper.showLabels) {
    barGroups.selectAll('not-a-class').data(function (d) {
      return d.nicedata;
    }).enter().append('text').attr('x', function (d, i) {
      return x0(i);
    }).attr('y', function (d) {
      return height - Math.abs(y(d.y) - y(0));
    }).text(function (d) {
      return d.y;
    });
  }
  svg.append('line').attr('x1', width).attr('y1', y(0)).attr('y2', y(0)).style('stroke', 'silver');
};var angularCharts = angularCharts || {};
angularCharts.lineChart = function (chartContainer, helper) {
  var width = helper.getDimensions().width, height = helper.getDimensions().height || width;
  var margin = {
      top: 0,
      right: 40,
      bottom: 20,
      left: 40
    };
  width -= margin.left + margin.right;
  height -= margin.top + margin.bottom;
  var x = d3.scale.ordinal().domain(helper.points.map(function (d) {
      return d.x;
    })).rangeRoundBands([
      0,
      width
    ]);
  var y = d3.scale.linear().range([
      height,
      10
    ]);
  var xAxis = d3.svg.axis().scale(x).orient('bottom');
  var yAxis = d3.svg.axis().scale(y).orient('left').ticks(5).tickFormat(d3.format('s'));
  var line = d3.svg.line().interpolate('cardinal').x(function (d) {
      return getX(d.x);
    }).y(function (d) {
      return y(d.y);
    });
  var yData = [0];
  var linedata = [];
  helper.points.forEach(function (d) {
    d.y.map(function (e, i) {
      yData.push(e);
    });
  });
  var yMaxPoints = d3.max(helper.points.map(function (d) {
      return d.y.length;
    }));
  helper.series.slice(0, yMaxPoints).forEach(function (value, index) {
    var d = {};
    d.series = value;
    d.values = helper.points.map(function (point) {
      return point.y.map(function (e) {
        return {
          x: point.x,
          y: e
        };
      })[index] || {
        x: helper.points[index].x,
        y: 0
      };
    });
    linedata.push(d);
  });
  var svg = d3.select(chartContainer[0]).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  var padding = d3.max(yData) * 0.2;
  y.domain([
    d3.min(yData),
    d3.max(yData) + padding
  ]);
  svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
  svg.append('g').attr('class', 'y axis').call(yAxis);
  var point = svg.selectAll('.helper.points').data(linedata).enter().append('g');
  path = point.attr('helper.points', 'helper.points').append('path').attr('class', 'ac-line').style('stroke', function (d, i) {
    return helper.getColor(i);
  }).attr('d', function (d) {
    return line(d.values);
  }).attr('stroke-width', '2').attr('fill', 'none');
  var last = linedata[linedata.length - 1].values;
  var totalLength = path.node().getTotalLength() + getX(last[last.length - 1].x);
  path.attr('stroke-dasharray', totalLength + ' ' + totalLength).attr('stroke-dashoffset', totalLength).transition().duration(1500).ease('linear').attr('stroke-dashoffset', 0).attr('d', function (d) {
    return line(d.values);
  });
  angular.forEach(linedata, function (value, key) {
    var points = svg.selectAll('.circle').data(value.values).enter();
    points.append('circle').attr('cx', function (d) {
      return getX(d.x);
    }).attr('cy', function (d) {
      return y(d.y);
    }).attr('r', 3).style('fill', helper.getColor(linedata.indexOf(value))).style('stroke', helper.getColor(linedata.indexOf(value))).on('mouseover', function () {
      helper.mouseover.call(helper, arguments);
    }).on('mouseleave', function () {
      helper.mouseleave.call(helper, arguments);
    }).on('mousemove', function () {
      helper.mousemove.call(helper, arguments);
    }).on('click', function () {
      helper.click.call(helper, arguments);
    });
    if (helper.showLabels) {
      helper.points.append('text').attr('x', function (d) {
        return getX(d.x);
      }).attr('y', function (d) {
        return y(d.y);
      }).text(function (d) {
        return d.y;
      });
    }
  });
  point.append('text').datum(function (d) {
    return {
      name: d.series,
      value: d.values[d.values.length - 1]
    };
  }).attr('transform', function (d) {
    return 'translate(' + getX(d.value.x) + ',' + y(d.value.y) + ')';
  }).attr('x', 3).text(function (d) {
    return d.name;
  });
  function getX(d) {
    return Math.round(x(d)) + x.rangeBand() / 2;
  }
  ;
  return linedata;
};var angularCharts = angularCharts || {};
angularCharts.pieChart = function (chartContainer, helper) {
  var width = helper.getDimensions().width, height = helper.getDimensions().height || width;
  var radius = Math.min(width, height) / 2;
  var svg = d3.select(chartContainer[0]).append('svg').attr('width', width).attr('height', height).append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
  var arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(0);
  d3.svg.arc().outerRadius(radius + 5).innerRadius(0);
  var pie = d3.layout.pie().sort(null).value(function (d) {
      return d.y[0];
    });
  var path = svg.selectAll('.arc').data(pie(helper.points)).enter().append('g');
  path.append('path').style('fill', function (d, i) {
    return helper.getColor(i);
  }).transition().ease('linear').duration(500).attrTween('d', tweenPie).attr('class', 'arc');
  path.on('mouseover', function (d) {
    d3.select(this).select('path').transition().duration(200).style('stroke', 'white').style('stroke-width', '2px');
    helper.mouseover.call(helper, arguments);
  }).on('mouseleave', function (d) {
    d3.select(this).select('path').transition().duration(200).style('stroke', '').style('stroke-width', '');
    helper.mouseleave.call(helper, arguments);
  }).on('mousemove', function () {
    helper.mousemove.call(helper, arguments);
  }).on('click', function () {
    helper.mousemove.call(helper, arguments);
  });
  if (!!helper.showLabels) {
    path.append('text').attr('transform', function (d) {
      return 'translate(' + arc.centroid(d) + ')';
    }).attr('dy', '.35em').style('text-anchor', 'middle').text(function (d) {
      return d.data.y[0];
    });
  }
  function tweenPie(b) {
    b.innerRadius = 0;
    var i = d3.interpolate({
        startAngle: 0,
        endAngle: 0
      }, b);
    return function (t) {
      return arc(i(t));
    };
  }
};var angularCharts = angularCharts || {};
angularCharts.pointChart = function (chartContainer, helper) {
  var width = helper.getDimensions().width, height = helper.getDimensions().height || width;
  var margin = {
      top: 0,
      right: 40,
      bottom: 20,
      left: 40
    };
  width -= margin.left - margin.right;
  height -= margin.top - margin.bottom;
  var x = d3.scale.ordinal().domain(helper.points.map(function (d) {
      return d.x;
    })).rangeRoundBands([
      0,
      width
    ]);
  var y = d3.scale.linear().range([
      height,
      10
    ]);
  var xAxis = d3.svg.axis().scale(x).orient('bottom');
  var yAxis = d3.svg.axis().scale(y).orient('left').ticks(5).tickFormat(d3.format('s'));
  var yData = [0];
  var linedata = [];
  helper.points.forEach(function (d) {
    d.y.map(function (e, i) {
      yData.push(e);
    });
  });
  var yMaxPoints = d3.max(helper.points.map(function (d) {
      return d.y.length;
    }));
  helper.series.slice(0, yMaxPoints).forEach(function (value, index) {
    var d = {};
    d.series = value;
    d.values = helper.points.map(function (point) {
      return point.y.map(function (e) {
        return {
          x: point.x,
          y: e
        };
      })[index] || {
        x: helper.points[index].x,
        y: 0
      };
    });
    linedata.push(d);
  });
  var svg = d3.select(chartContainer[0]).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  var padding = d3.max(yData) * 0.2;
  y.domain([
    d3.min(yData),
    d3.max(yData) + padding
  ]);
  svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
  svg.append('g').attr('class', 'y axis').call(yAxis);
  svg.selectAll('.points').data(linedata).enter().append('g');
  angular.forEach(linedata, function (value, key) {
    var points = svg.selectAll('.circle').data(value.values).enter();
    points.append('circle').attr('cx', function (d) {
      return getX(d.x);
    }).attr('cy', function (d) {
      return y(d.y);
    }).attr('r', 3).style('fill', helper.getColor(linedata.indexOf(value))).style('stroke', helper.getColor(linedata.indexOf(value))).on('mouseover', function () {
      helper.mouseover.call(helper, arguments);
    }).on('mouseleave', function () {
      helper.mouseleave.call(helper, arguments);
    }).on('mousemove', function () {
      helper.mousemove.call(helper, arguments);
    }).on('click', function () {
      helper.click.call(helper, arguments);
    });
    if (helper.showLabels) {
      helper.points.append('text').attr('x', function (d) {
        return getX(d.x);
      }).attr('y', function (d) {
        return y(d.y);
      }).text(function (d) {
        return d.y;
      });
    }
  });
  function getX(d) {
    return Math.round(x(d)) + x.rangeBand() / 2;
  }
  ;
};var angularCharts = angularCharts || {};
angular.module('angularCharts', ['angularChartsTemplates']);
angular.module('angularCharts').directive('acChart', [
  '$templateCache',
  '$compile',
  '$window',
  function ($templateCache, $compile, $window) {
    function link(scope, element, attrs) {
    }
    return {
      restrict: 'EA',
      link: link,
      controller: angularCharts.ChartController,
      scope: {
        acChart: '=',
        acData: '=',
        acConfig: '='
      }
    };
  }
]);angular.module('angularCharts').directive('acLegend', [
  '$templateCache',
  '$compile',
  '$window',
  function ($templateCache, $compile, $window) {
    function link($scope, $element, attrs) {
      var container = $templateCache.get('legend');
      $element.html($compile(container)($scope));
    }
    return {
      restrict: 'EA',
      link: link,
      controller: [
        '$scope',
        function ($scope) {
          function draw() {
            $scope.legends = [];
            if ($scope.acLegend == 'pie') {
              angular.forEach($scope.acPoints, function (value, i) {
                $scope.legends.push({
                  color: angularCharts.utils.colorPicker.getColor(i),
                  title: value.x
                });
              });
            } else {
              angular.forEach($scope.acSeries, function (value, i) {
                $scope.legends.push({
                  color: angularCharts.utils.colorPicker.getColor(i),
                  title: value
                });
              });
            }
          }
          $scope.$watch('acLegend', draw, true);
          $scope.$watch('acSeries', draw, true);
          $scope.$watch('acPoints', draw, true);
        }
      ],
      scope: {
        acPoints: '=',
        acColors: '=',
        acLegend: '=',
        acSeries: '='
      }
    };
  }
]);
angular.module('angularChartsTemplates', ['chart', 'legend']);

angular.module("chart", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("chart",
    "<style>\n" +
    "    .axis path,\n" +
    "    .axis line {\n" +
    "        fill: none;\n" +
    "        stroke: #333;\n" +
    "    }\n" +
    "    .ac-line {\n" +
    "        fill:none;\n" +
    "        stroke-width:2px;\n" +
    "    }\n" +
    "</style>\n" +
    "<div class='ac-chart' ></div>");
}]);

angular.module("legend", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("legend",
    "<div class='ac-legend'>\n" +
    "    <table>\n" +
    "        <tr ng-repeat=\"l in legends\">\n" +
    "            <td><div ng-attr-style='background:{{l.color}}; height:15px;width:15px;'></div></td>\n" +
    "            <td ng-bind='l.title'></td>\n" +
    "        </tr>\n" +
    "    </table>\n" +
    "</div>");
}]);
