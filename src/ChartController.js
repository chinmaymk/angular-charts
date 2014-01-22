var angularCharts = angularCharts || {
    utils: {
        colorPicker: {
            colors: ['steelBlue', 'rgb(255,153,0)', 'rgb(220,57,18)', 'rgb(70,132,238)', 'rgb(73,66,204)', 'rgb(0,128,0)'],
            getRandomColor: function() {
                var letters = '0123456789ABCDEF'.split('');
                var color = '#';
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.round(Math.random() * 15)];
                }
                return color;
            },
            getColor: function(i) {
                if(isNaN(i)){
                    throw "Expected a numeric index, got " + typeof(i);
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

angularCharts.ChartController = function($scope, $element, $templateCache, $compile, $window) {

    var config = {
        tooltips: true,
        labels: false,
        mouseover: function() {
        },
        mouseout: function() {
        },
        click: function() {
        }
    };

    var chartType;
    var chartContainer;
    var legendContainer;

    var tooltip = {
        style: ["display:none;",
            "position:absolute;",
            "border:1px solid #333;",
            "background-color:#161616;",
            "border-radius:5px;",
            "padding:5px;",
            "color:#fff;"].join(''),
        create: function(data) {
            if (!config.tooltips) {
                return;
            }
            angular.element('<p class="ac-tooltip" style="' + this.style + '"></p>')
                    .html(data)
                    .appendTo('body')
                    .fadeIn('slow');
        },
        remove: function() {
            angular.element('.ac-tooltip').remove();
        },
        update: function() {
            angular.element('.ac-tooltip').css({left: d3.event.pageX + 20, top: d3.event.pageY - 30});
        }
    };

    var helper = {
        showLabels: config.labels,
        mouseover: function(d) {
            config.mouseover();
            var data = (d[0].data || d[0]);
            tooltip.create(data.tooltip || data.y[0] || data.y);
        },
        mouseout: function() {
        },
        mouseleave: function() {
            tooltip.remove();
        },
        mousemove: function(d) {
            config.mouseout();
            tooltip.update();
        },
        click: function() {
            config.click();
        },
        getDimensions: function() {
            return chartContainer[0].getBoundingClientRect();
        },
        getColor: function(i) {
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

    /**
     * Creates appropriate DOM structure for chart
     */
    function setContainers() {
        var container = $templateCache.get('chart');
        $element.html($compile(container)($scope));
        chartContainer = $element.find('.ac-chart');
        legendContainer = $element.find('.ac-legend');
        return chartContainer;
    }

    var winElem = angular.element($window);
    $scope.getWindowDimensions = function() {
        return {'h': winElem.height(), 'w': winElem.width()};
    };

    //add some watchers
    $scope.$watch('acChart', init, true);
    $scope.$watch('acData', init, true);
    $scope.$watch('acConfig', init, true);
    $scope.$watch('acSeries', init, true);
    $scope.$watch('acPoints', init, true);
};