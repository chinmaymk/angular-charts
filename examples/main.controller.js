
angular.module('example', ['angularCharts']);

function MainController($scope) {
    $scope.chartType = 'pie';
    $scope.data = {
        data: [{
                x: "Sales",
                y: [100, 500, 0],
                tooltip: "this is a tooltip"
            },
            {
                x: "Not Sales",
                y: [300, 100, 100]
            },
            {
                x: "Tax",
                y: [351]
            },
            {
                x: "Not Tax",
                y: [54, 0, 879]
            }]
    };

    $scope.data1 = {
        series: ['This', 'Is', 'Something', 'Else', 'Entirely'],
        data: [{
                x: "These",
                y: [150, 500, 0],
                tooltip: "this is tooltip"
            },
            {
                x: "Are",
                y: [500, 600, 100]
            },
            {
                x: "Somewhat",
                y: [351]
            },
            {
                x: "Different",
                y: [82, 14, 879]
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