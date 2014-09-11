angular-charts [![Build Status](https://travis-ci.org/chinmaymk/angular-charts.svg?branch=master)](https://travis-ci.org/chinmaymk/angular-charts)
==============

angular directives for common charts using d3, for more information visit

http://chinmaymk.github.io/angular-charts/

##Downloading zip from this page won't work!!!
We recommend downloading a copy of angular-charts from [releases](https://github.com/chinmaymk/angular-charts/releases).
Releases sit on the bower branch. If you want to build from master download and run grunt

##Playground
You can try out angular-charts on [plunkr](http://plnkr.co/edit/T9J7bz?p=preview).


##Features
1. One click chart change
2. Tiny - 4.4kb minified and gzipped
3. Auto tooltips
4. Auto h,w dimensions updates automatically when resizing
5. Beautiful animations
6. Callback events
7. Simple data format

##Installation
Installation is very straight forward. Grab the latest zip from github. Copy angular-chart.min.js in your root, and refer it in your page.

```js
<script type='text/javascript' src='path/to/js/angular-charts.min.js'></script>
```
Add as dependency in your module
```js
angular.module('yourApp', ['angularCharts']);
```
###Dependencies
angular
d3

###Install using bower
```
bower install angular-charts
```

Refer all dependencies in your page in right order
```js
<script type='text/javascript' src='./bower_components/angular/angular.min.js'></script> 
<script type='text/javascript' src='./bower_components/d3/d3.min.js'></script> 
<script type='text/javascript' src='./bower_components/angular-charts/dist/angular-charts.min.js'></script>
```

##Configuration
Directive syntax
```html
<div ac-chart="chartType" ac-data="data" ac-config="config" id='chart' class='chart'></div>
```
**Note:** chartType, data and config are properties of scope. Not the actual values.


###ac-chart  - string
**Values:** 'pie', 'bar', 'line', 'point', 'area'

###ac-config - object
```js            
 var config = {
  title: '', // chart title
  tooltips: true,
  labels: false, // labels on data points
  // exposed events 
  mouseover: function() {}, 
  mouseout: function() {},
  click: function() {},
  // legend config
  legend: {
    display: true, // can be either 'left' or 'right'.
    position: 'left',
    // you can have html in series name
    htmlEnabled: false
  },
  // override this array if you're not happy with default colors
  colors: [],
  innerRadius: 0, // Only on pie Charts
  lineLegend: 'lineEnd', // Only on line Charts
  lineCurveType: 'cardinal', // change this as per d3 guidelines to avoid smoothline
  isAnimate: true // run animations while rendering chart
};
```  

###ac-data - object

Entire data structure looks like this
```js
var acData = {
  "series": [
    "Sales",
    "Income",
    "Expense"
  ],
  "data": [
    {
      "x": "Computers",
      "y": [
        54,
        0,
        879
      ],
      "tooltip": "This is a tooltip"
    }
  ]
}
```

###series - string array
```js
var series = [
  "Sales",
  "Income",
  "Expense"
]
```
###data
x defines what goes on x axis, must be a string, y defines what goes on y axis, must be an array of numbers. 

Values are mapped to series by index. y[0] belongs to series[0], y[1] belongs to series[1] and so on. Tooltip is optional.

```js
var data = {
  "x": "Computers",
  "y": [
    54,
    0,
    879
  ],
  "tooltip": "This is a tooltip"
}
```
**Note:** series and data are arrays

##Events
Three events are exposed via config objects.
```
onmouseover
onmouseout
click
```

```js     
click : function(d) {
  $scope.messages.push('clicked!');
},
mouseover : function(d) {
  $scope.messages.push('mouseover!');
},
mouseout : function(d) {
  $scope.messages.push('mouseout!');
}
```

## How to contribite
Please make sure all tests are passing.
**Note**: Please don't send any PRs until you see this. I'm refactoring angular-charts.

    git clone git@github.com:chinmaymk/angular-charts.git
    npm install
    bower install
    grunt

To run tests:

    grunt karma

Thanks to all awesome [contributors](https://github.com/chinmaymk/angular-charts/network/members)

License - MIT.

##Got suggestions ?
Feel free to submit a pull request, file an issue, or get in touch on twitter [@_chinmaymk](https://twitter.com/_chinmaymk)
