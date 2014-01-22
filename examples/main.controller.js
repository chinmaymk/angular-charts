
angular.module('example', ['angularCharts']);

function MainController($scope) {
    $scope.chartType = 'pie';

    $scope.data = {
        series: ['These Will Be', 'Ignored By', 'Pie Charts'],
        data: [{
                x: "Jack",
                y: [100, 210, 384],
                tooltip: "This is a custom tooltip text"
            },
            {
                x: "John",
                y: [300, 289, 456]
            },
            {
                x: "Stacy",
                y: [351, 170, 255]
            },
            {
                x: "Luke",
                y: [54, 341, 879]
            }]
    };

    $scope.data1 = {
        series: ['This Is', 'Something', 'Else', 'Entirely'],
        data: [{
                x: "These",
                y: [210, 384, 100, 255],
                tooltip: "This is another custom tooltip text"
            },
            {
                x: "Are",
                y: [289, 456, 300, 879]
            },
            {
                x: "Somewhat",
                y: [170, 255, 351, 384]
            },
            {
                x: "Different",
                y: [341, 879, 54, 456]
            }]
    };

    $scope.config = {
        labels: false,
        title: "Not Products"
    };

    $scope.config1 = {
        labels: false,
        title: "Products"
    };
}