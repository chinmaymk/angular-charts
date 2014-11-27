angular.module('angularCharts').factory('Utils', function () {

    var HTML_ENTITY_MAP = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function(char) {
            return HTML_ENTITY_MAP[char];
        });
    }

    /**
     * Filters down the x axis labels if a limit is specified
     */
    function filterXAxis(chart, xAxis, x) {
        var allTicks = x.domain();
        if (chart.config.xAxisMaxTicks && allTicks.length > chart.config.xAxisMaxTicks) {
            var mod = Math.ceil(allTicks.length / chart.config.xAxisMaxTicks);
            xAxis.tickValues(allTicks.filter(function(e, i) {
                return (i % mod) === 0;
            }));
        }
    }

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
     * Utility function to call when we run out of colors!
     * @return {String} Hexadecimal color
     */
    function getRandomColor() {
        var r = (Math.round(Math.random() * 127) + 127).toString(16);
        var g = (Math.round(Math.random() * 127) + 127).toString(16);
        var b = (Math.round(Math.random() * 127) + 127).toString(16);
        return '#' + r + g + b;
    }

    return {
        escapeHtml: escapeHtml,
        filterXAxis: filterXAxis,
        getChildrenByClassname: getChildrenByClassname,
        getRandomColor: getRandomColor,
        defaultColors: [
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
        ]
    }
});
