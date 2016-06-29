// constants
var board_row_size = 6;
var board_col_size = 5;

// variables
var debug_mode = false;
var hint_mode = false;
var best_score = 0;
var score = 0;
var $icon;
var $binomial;
var direction = '';
var multiplier = 0;
var images = [
    'images/icons/sprite.png',
    'images/picto/fire.gif',
    'images/picto/star.gif',
    'images/anim/explosion.png'
];

var timeout;
var movingTile;
var pastPositions = {};
var topPositions = [];
var leftPositions = [];

var floorClasses = {};
var tileClasses = {};

function changeCss(className, classValue) {
    // we need invisible container to store additional css definitions
    var cssMainContainer = $('#css-modifier-container');
    if (cssMainContainer.length == 0) {
        var cssMainContainer = $('<div id="css-modifier-container"></div>');
        cssMainContainer.hide();
        cssMainContainer.appendTo($('head'));
    }

    // and we need one div for each class
    classContainer = cssMainContainer.find('div[data-class="' + className + '"]');
    if (classContainer.length == 0) {
        classContainer = $('<div data-class="' + className + '"></div>');
        classContainer.appendTo(cssMainContainer);
    }

    // append additional style
    classContainer.html('<style>' + className + ' {' + classValue + '}</style>');
}