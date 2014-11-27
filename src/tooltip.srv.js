angular.module('angularCharts').factory('Tooltips', function() {
    /**
     * Creates and displays tooltip
     * @return {[type]} [description]
     */
    function makeToolTip(chart, scope, data, event) {
        if (!chart.config.tooltips) {
            return;
        }
        if (typeof chart.config.tooltips === 'function') {
            data = chart.config.tooltips(data);
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
    function removeToolTip(scope) {
        if (scope.$tooltip) {
            scope.$tooltip.remove();
        }
    }

    function updateToolTip(scope, d, event) {
        if (scope.$tooltip) {
            scope.$tooltip.css({
                left: (event.pageX + 20) + 'px',
                top: (event.pageY - 30) + 'px'
            });
        }
    }

    return {
        makeToolTip: makeToolTip,
        removeToolTip: removeToolTip,
        updateToolTip: updateToolTip
    }
})