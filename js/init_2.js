// constants
var CUT_ICON = 40;
var NB_LINES = 4;
var NB_COLUMNS = 4;
var NB_ICONS = 6;

// variables
var debug_mode = false;
var hint_mode = false;
var best_score = 0;
var score = 0;
var best_combo = 0;
var combo = 0;
var finger_init_x = 0;
var finger_init_y = 0;
var $icon;
var $binomial;
var direction = '';
var mouse_down = false;
var placement_not_allowed = false;
var hint_timeout;
var fast_move_timeout;
var tab_icons = [];
var tab_suppr = [];
var test_horiz = [];
var test_worthy = [];
var tab_test = [];
var multiplier = 0;
var images = [
    'images/icons/sprite.png',
    'images/picto/fire.gif',
    'images/picto/star.gif',
    'images/anim/explosion.png'
];



$(function () { // DOM ready

    $(window).resize(on_resize);

    $('.icon').live('dragstart', function (e) {
        // prevent image dragging
        e.preventDefault();
    });

    $('#zone_message').live('touchmove mousemove', function (e) {
        // prevent window scrolling
        e.preventDefault();
    });

    $('.icon').live('touchstart mousedown', function (e) {

        if (!mouse_down) {
            dragmove = false;
            $icon = $(this);
            $icon.css('z-index', 20);
            icon_line = Number($icon.attr('data-line'));
            icon_col = Number($icon.attr('data-col'));
            if (e.originalEvent.type == 'touchstart') {
                finger_init_x = e.originalEvent.touches[0].clientX;
                finger_init_y = e.originalEvent.touches[0].clientY;
            }
            if (e.originalEvent.type == 'mousedown') {
                finger_init_x = e.originalEvent.clientX;
                finger_init_y = e.originalEvent.clientY;
            }
            console.log('finit ' + finger_init_x + ' ' + finger_init_y);
            mouse_down = true;
        }

    });

    $('#zone_play').live('touchmove mousemove', function (e) {
        console.log('I am here');
        // prevent window scrolling
        e.preventDefault();

        mouse_down = true;
        if (mouse_down) {

            var distance_x, distance_y;

            if (e.originalEvent.type == 'touchmove') {
                distance_x = e.originalEvent.touches[0].clientX - finger_init_x;
                distance_y = e.originalEvent.touches[0].clientY - finger_init_y;
            }
            if (e.originalEvent.type == 'mousemove') {
                distance_x = e.originalEvent.clientX - finger_init_x;
                distance_y = e.originalEvent.clientY - finger_init_y;
            }
            //console.log(distance_x+" "+distance_y);
            if (Math.abs(distance_x) > Math.abs(distance_y)) {
                if (distance_x > CUT_ICON / 2) {
                    console.log('moved right');
                    // right
                    if (icon_col < NB_COLUMNS - 1) {
                        dragmove = true;
                        $('.icon').removeClass('click adjacent');
                        placement(icon_line, icon_col, icon_line, icon_col + 1, 'right');
                    }
                }

                if (distance_x < -CUT_ICON / 2) {
                    console.log('moved left');
                    // left
                    if (icon_col > 0) {
                        dragmove = true;
                        $('.icon').removeClass('click adjacent');
                        placement(icon_line, icon_col, icon_line, icon_col - 1, 'left');
                    }
                }
            } else {
                if (distance_y > CUT_ICON / 2) {
                    console.log('moved down');
                    // down
                    if (icon_line < NB_LINES - 1) {
                        dragmove = true;
                        $('.icon').removeClass('click adjacent');
                        placement(icon_line, icon_col, icon_line + 1, icon_col, 'down');
                    }
                }

                if (distance_y < -CUT_ICON / 2) {
                    console.log('moved up');
                    // up
                    if (icon_line > 0) {
                        dragmove = true;
                        $('.icon').removeClass('click adjacent');
                        placement(icon_line, icon_col, icon_line - 1, icon_col, 'up');
                    }
                }
            }
        }
    });

    function placement(icon_line, icon_col, binomial_line, binomial_col, position) {
        mouse_down = false;
        $icon.css('z-index', 10);

        // icons switch positions
        var icon_line_origin = icon_line;
        var icon_col_origin = icon_col;
        var binomial_line_origin = binomial_line;
        var binomial_col_origin = binomial_col;

        $icon.attr('data-line', binomial_line_origin);
        $icon.attr('data-col', binomial_col_origin);
        //$binomial.attr('data-line', icon_line_origin);
        //$binomial.attr('data-col', icon_col_origin);

        //console.log("CUT_ICON " + CUT_ICON);

        $('#zone_play').find('.icon').each(function () {
            //console.log($(this).attr('data-line'));
            if ($(this).attr('data-line') == icon_line_origin) {
                if (position === 'right') {
                    $(this).css({
                        'left': eval(parseInt($(this).css('left')) + CUT_ICON)
                    });
                }
                else if (position === 'left') {
                    $(this).css({
                        'left': eval(parseInt($(this).css('left')) - CUT_ICON)
                    });
                }
            }
        });
    }

    $('.bt_new_game').live('click', function () {
        // tracking Google Analytics
        //_gaq.push(['_trackEvent', 'Fruit Salad', 'Play again', 'Play again']);
        init_game();
    });

    $('.bt-app-wall').live('click', function () {
        $('#app-wall').show();
    });

    $('#app-wall').live('click', function () {
        $('#app-wall').hide();
    });

    on_resize();

    // wait until every image is loaded to launch the game
    loadimages(images, function () {
        init_game();
    });

    // tabs and panels
    $('.panel').hide();
    $('.tab').click(function () {
        var $this = $(this);
        $('.tab').removeClass('on');
        $this.addClass('on');
        $('.panel').hide();
        $('#' + $this.attr('data-target')).show();
    });
    $('.tab:first').click();

    // android market link
    if ($('#android_link').length) {
        var ua = navigator.userAgent;
        ua = ua.toLowerCase();
        if (ua.indexOf('android') > -1) {
            $('#android_link').attr('href', 'market://details?id=com.phonegap.fruit_salad');
        }

    }

});

function verif_click($icon_test) {
    if (!$('.icon.click').length) {
        $icon_test.addClass('click');
        icon_test_line = Number($icon_test.attr('data-line'));
        icon_test_col = Number($icon_test.attr('data-col'));
        add_adjacent(icon_test_line, icon_test_col);
    } else {
        $icon_ref = $('.icon.click');
        icon_ref_line = Number($icon_ref.attr('data-line'));
        icon_ref_col = Number($icon_ref.attr('data-col'));
        icon_test_line = Number($icon_test.attr('data-line'));
        icon_test_col = Number($icon_test.attr('data-col'));
        // proximity check
        if (
                (icon_ref_line == icon_test_line && icon_ref_col == icon_test_col - 1) ||
                (icon_ref_line == icon_test_line && icon_ref_col == icon_test_col + 1) ||
                (icon_ref_line == icon_test_line - 1 && icon_ref_col == icon_test_col) ||
                (icon_ref_line == icon_test_line + 1 && icon_ref_col == icon_test_col)
                ) {
            $icon = $icon_ref;
            placement(icon_ref_line, icon_ref_col, icon_test_line, icon_test_col);
            $('.icon').removeClass('click adjacent');
        } else {
            $('.icon').removeClass('click adjacent');
            $icon_test.addClass('click');
            add_adjacent(icon_test_line, icon_test_col);
        }
    }
}
;

function add_adjacent(line, colonne) {
    if (line > 0) {
        $('.icon[data-line=' + (line - 1) + '][data-col=' + colonne + ']').addClass('adjacent');
    }
    if (colonne > 0) {
        $('.icon[data-line=' + line + '][data-col=' + (colonne - 1) + ']').addClass('adjacent');
    }
    if (colonne < NB_COLUMNS - 1) {
        $('.icon[data-line=' + line + '][data-col=' + (colonne + 1) + ']').addClass('adjacent');
    }
    if (line < NB_LINES - 1) {
        $('.icon[data-line=' + (line + 1) + '][data-col=' + colonne + ']').addClass('adjacent');
    }
}


function init_game() {

    // tracking Google Analytics
    //_gaq.push(['_trackEvent', 'Fruit Salad', 'Game start', 'Game start']);

    $('#zone_message').html('');

    score = 0;
    combo = 0;
    NB_ICONS = 6; // normal : 6

    tab_icons = [];
    var make_board = '';

    clearTimeout(hint_timeout);
    $('.hint').removeClass('hint');
    hint_mode = false;

    on_resize();

    for (var i = 0; i < NB_LINES; i++) {
        tab_icons[i] = [];
        for (var j = 0; j < NB_COLUMNS; j++) {
            var nb_icon = Math.ceil(Math.random() * NB_ICONS);

            if (i > 1) {
                while (tab_icons[i - 2][j] == nb_icon && tab_icons[i - 1][j] == nb_icon) {
                    nb_icon = Math.ceil(Math.random() * NB_ICONS);
                }
            }
            if (j > 1) {
                while (tab_icons[i][j - 2] == nb_icon && tab_icons[i][j - 1] == nb_icon) {
                    nb_icon = Math.ceil(Math.random() * NB_ICONS);

                    if (i > 1) {
                        while (tab_icons[i - 2][j] == nb_icon && tab_icons[i - 1][j] == nb_icon) {
                            nb_icon = Math.ceil(Math.random() * NB_ICONS);
                        }
                    }

                }
            }

            tab_icons[i][j] = nb_icon;
            make_board += '<div class="icon icon_' + nb_icon + '" data-line="' + i + '" data-col="' + j + '" data-icon="' + nb_icon + '" style="top: ' + Number(i * CUT_ICON) + 'px; left: ' + Number(j * CUT_ICON) + 'px;"></div>';
        }
    }

    $('#zone_play').html(make_board);

    var local_best_score = localStorage.getItem('best_score');
    if (local_best_score != null) {
        best_score = local_best_score;
    }
    $('#best_score_num').html(best_score);

    var local_best_combo = localStorage.getItem('best_combo');
    if (local_best_combo != null) {
        best_combo = local_best_combo;
    }
    $('#best_combo_num').html(best_combo);

    // initial check
    multiplier = 0;
    verif_board();

    $('#current_score_num').html(score);
    $('#current_combo_num').html(combo);

}
;



function verif_board() {

    for (var i = 0; i < NB_LINES; i++) {
        tab_suppr[i] = [];
        for (var j = 0; j < NB_COLUMNS; j++) {
            tab_suppr[i][j] = false;
        }
    }

    for (var i = 0; i < NB_LINES; i++) {
        test_horiz[i] = [];
        for (var j = 0; j < NB_COLUMNS; j++) {
            test_horiz[i][j] = false;
        }
    }

    for (var i = 0; i < NB_LINES; i++) {
        test_worthy[i] = [];
        for (var j = 0; j < NB_COLUMNS; j++) {
            test_worthy[i][j] = false;
        }
    }

    $('.icon.hypercube').removeClass('new');

    var chain_found = false;

    for (var i = 0; i < NB_LINES; i++) {
        for (var j = 0; j < NB_COLUMNS; j++) {
            if (test_chain(i, j)) {
                chain_found = true;
            }
        }
    }

    // check for hypercube move
    if ($icon != undefined && $binomial != undefined) {
        if ($icon.hasClass('hypercube') && !$icon.hasClass('new')) {
            destroy_color($binomial.attr('data-icon'), $icon.attr('data-line'), $icon.attr('data-col'));
            tab_suppr[$icon.attr('data-line')][$icon.attr('data-col')] = true;
            chain_found = true;
            multiplier++;
            if (multiplier > combo) {
                combo = multiplier;
                $('#current_combo_num').html(combo);
            }
            $('#zone_message').append('<div class="hypercube">EXCELLENT!</div>');
        }
        if ($binomial.hasClass('hypercube') && !$binomial.hasClass('new')) {
            destroy_color($icon.attr('data-icon'), $binomial.attr('data-line'), $binomial.attr('data-col'));
            tab_suppr[$binomial.attr('data-line')][$binomial.attr('data-col')] = true;
            chain_found = true;
            multiplier++;
            if (multiplier > combo) {
                combo = multiplier;
                $('#current_combo_num').html(combo);
            }
            $('#zone_message').append('<div class="hypercube">EXCELLENT!</div>');
        }
    }

    if (chain_found) {
        clearTimeout(fast_move_timeout);

        for (var i = 0; i < NB_LINES; i++) {
            for (var j = 0; j < NB_COLUMNS; j++) {
                if (tab_suppr[i][j]) {
                    tab_icons[i][j] = 0;
                    $('.icon[data-line=' + i + '][data-col=' + j + ']').fadeOut(300, function () {
                        $(this).remove();
                    });
                    var points = 10 * multiplier;
                    var $aff_score = $('<div class="aff_score" style="left:' + j * CUT_ICON + 'px; top:' + i * CUT_ICON + 'px;">+' + points + '</div>');
                    $('#zone_play').append($aff_score);
                    score += points;
                }
            }
        }
        $('#current_score_num').html(score);
        setTimeout(function () {
            $aff_score.fadeOut(400, function () {
                $('.aff_score').remove();
            });
            $('#zone_message').html('');
        }, 700);


        setTimeout(function () {
            chute_icons();
            setTimeout(function () {
                verif_board();
            }, 400);
        }, 400);
    } else {
        // no chain found

        if ($icon == undefined && $binomial == undefined) {
            if (test_possible_move()) {
                placement_not_allowed = false;
                if (score > 1000) {
                    // difficulty++
                    NB_ICONS = 7;
                }
                if (score > 2000) {
                    // difficulty++
                    NB_ICONS = 8;
                }

                // reset multiplier if the player not not find new chain fast
                fast_move_timeout = setTimeout(function () {
                    multiplier = 0;
                }, 1500);

                // display hint after a few seconds
                hint_timeout = setTimeout(function () {
                    hint_mode = true;
                    test_possible_move();
                }, 7000);
            } else {
                // tracking Google Analytics
                //_gaq.push(['_trackEvent', 'Fruit Salad', 'Game over', 'Game over', score]);
                $('#zone_message').html('<div class="bad">GAME OVER</div>');
                $('#zone_message').append('<div class="good">' + score + ' points</div>');
                if (score > best_score) {
                    best_score = score;
                    localStorage.setItem('best_score', best_score);
                    $('#best_score_num').html(best_score);
                }
                $('#zone_message').append('<div class="good">combo x ' + combo + '</div>');
                if (combo > best_combo) {
                    best_combo = combo;
                    localStorage.setItem('best_combo', best_combo);
                    $('#best_combo_num').html(best_combo);
                }
                $('#zone_message').append('<a target="_blank" href="http://www.baptistebrunet.com/games/" class="button">More games</a>');
                $('#zone_message').append('<div class="button bt_new_game">Play again</div>');

            }
        }
    }

    return chain_found;
}
;

function test_chain(line, colonne) {
    var chain_found = false;
    var num_icon = tab_icons[line][colonne];
    var suite_worthy = 1;
    var suite_horiz = 1;
    var i;

    // down
    if (!test_worthy[line][colonne]) {
        i = 1;
        while (line + i < NB_COLUMNS && tab_icons[line + i][colonne] == num_icon && !test_worthy[line + i][colonne]) {
            suite_worthy++;
            i++;
        }

        if (suite_worthy >= 3) {
            chain_found = true;
            multiplier++;
            if (multiplier > combo) {
                combo = multiplier;
                $('#current_combo_num').html(combo);
            }
            if (multiplier > 1) {
                var $aff_combo = $('<div class="aff_combo" style="left:' + (colonne * CUT_ICON) + 'px; top:' + (line * CUT_ICON) + 'px;">x' + multiplier + '</div>');
                $('#zone_play').append($aff_combo);
                $aff_combo.animate(
                        {
                            top: '-=' + (CUT_ICON / 2),
                            opacity: 0
                        },
                600,
                        function () {
                            $(this).remove();
                        }
                );
            }

            if ($('.icon[data-line=' + line + '][data-col=' + colonne + ']').hasClass('fire')) {
                destroy_around(line, colonne);
            }
            if ($('.icon[data-line=' + line + '][data-col=' + colonne + ']').hasClass('star')) {
                destroy_line_column(line, colonne);
            }

            tab_suppr[line][colonne] = true;
            test_worthy[line][colonne] = true;

            if (suite_worthy == 4) {
                // animate fireball creation
                $('.icon[data-line=' + line + '][data-col=' + colonne + ']').css({
                    'top': (line + 1) * CUT_ICON
                });
            }
            if (suite_worthy == 5) {
                // animate hypercube creation
                $('.icon[data-line=' + line + '][data-col=' + colonne + ']').css({
                    'top': (line + 2) * CUT_ICON
                });
            }

            // down
            i = 1;
            while (line + i < NB_COLUMNS && tab_icons[line + i][colonne] == num_icon) {
                if ($('.icon[data-line=' + (line + i) + '][data-col=' + colonne + ']').hasClass('fire')) {
                    destroy_around(line + i, colonne);
                }
                if ($('.icon[data-line=' + (line + i) + '][data-col=' + colonne + ']').hasClass('star')) {
                    destroy_line_column(line + i, colonne);
                }
                if (suite_worthy == 4) {
                    // animate fireball creation
                    $('.icon[data-line=' + (line + i) + '][data-col=' + colonne + ']').css({
                        'top': (line + 1) * CUT_ICON
                    });
                }
                if (suite_worthy == 5) {
                    // animate hypercube creation
                    $('.icon[data-line=' + (line + i) + '][data-col=' + colonne + ']').css({
                        'top': (line + 2) * CUT_ICON
                    });
                }
                if (i == 1 && multiplier % 5 == 0) {
                    // create a star gem (can destroy line and column)
                    $('.icon[data-line=' + (line + i) + '][data-col=' + colonne + ']').addClass('star');
                    $('#zone_message').append('<div class="star">SUPER COMBO!</div>');
                } else {
                    if (i == 1 && suite_worthy == 4) {
                        // create a fire gem (can destroy 8 surrounding icons)
                        $('.icon[data-line=' + (line + i) + '][data-col=' + colonne + ']').addClass('fire');
                        $('#zone_message').append('<div class="fire">FIREBALL!</div>');
                    } else {
                        if (i == 2 && suite_worthy == 5) {
                            // create a hypercube (can destroy all icons)
                            $('.icon[data-line=' + (line + i) + '][data-col=' + colonne + ']')
                                    .removeClass('icon_1 icon_2 icon_3 icon_4 icon_5 icon_6 icon_7 icon_8')
                                    .addClass('hypercube new');
                            tab_icons[line + i][colonne] = 10;
                            $('#zone_message').append('<div class="hypercube">HYPERCUBE!</div>');
                        } else {
                            tab_suppr[line + i][colonne] = true;
                            test_worthy[line + i][colonne] = true;
                        }
                    }
                }

                i++;
            }
        }
    }


    // right
    if (!test_horiz[line][colonne]) {
        i = 1;
        while (colonne + i < NB_LINES && tab_icons[line][colonne + i] == num_icon && !test_horiz[line][colonne + i]) {
            suite_horiz++;
            i++;
        }

        if (suite_horiz >= 3) {
            chain_found = true;
            multiplier++;
            if (multiplier > combo) {
                combo = multiplier;
                $('#current_combo_num').html(combo);
            }
            if (multiplier > 1) {
                var $aff_combo = $('<div class="aff_combo" style="left:' + (colonne * CUT_ICON) + 'px; top:' + (line * CUT_ICON) + 'px;">x' + multiplier + '</div>');
                $('#zone_play').append($aff_combo);
                $aff_combo.animate(
                        {
                            top: '-=' + (CUT_ICON / 2),
                            opacity: 0
                        },
                600,
                        function () {
                            $(this).remove();
                        }
                );
            }

            if ($('.icon[data-line=' + line + '][data-col=' + colonne + ']').hasClass('fire')) {
                destroy_around(line, colonne);
            }
            if ($('.icon[data-line=' + line + '][data-col=' + colonne + ']').hasClass('star')) {
                destroy_line_column(line, colonne);
            }

            tab_suppr[line][colonne] = true;
            test_horiz[line][colonne] = true;

            if (suite_horiz == 4) {
                // animate fireball creation
                $('.icon[data-line=' + line + '][data-col=' + colonne + ']').css({
                    'left': (colonne + 1) * CUT_ICON
                });
            }
            if (suite_horiz == 5) {
                // animate hypercube creation
                $('.icon[data-line=' + line + '][data-col=' + colonne + ']').css({
                    'left': (colonne + 2) * CUT_ICON
                });
            }

            // right
            i = 1;
            while (colonne + i < NB_LINES && tab_icons[line][colonne + i] == num_icon) {
                if ($('.icon[data-line=' + line + '][data-col=' + (colonne + i) + ']').hasClass('fire')) {
                    destroy_around(line, colonne + i);
                }
                if ($('.icon[data-line=' + line + '][data-col=' + (colonne + i) + ']').hasClass('star')) {
                    destroy_line_column(line, colonne + i);
                }
                if (suite_horiz == 4) {
                    // animate fireball creation
                    $('.icon[data-line=' + line + '][data-col=' + (colonne + i) + ']').css({
                        'left': (colonne + 1) * CUT_ICON
                    });
                }
                if (suite_horiz == 5) {
                    // animate hypercube creation
                    $('.icon[data-line=' + line + '][data-col=' + (colonne + i) + ']').css({
                        'left': (colonne + 2) * CUT_ICON
                    });
                }
                if (i == 1 && multiplier % 5 == 0) {
                    // create a star gem (can destroy line and column)
                    $('.icon[data-line=' + line + '][data-col=' + (colonne + i) + ']').addClass('star');
                    $('#zone_message').append('<div class="star">SUPER COMBO!</div>');
                } else {
                    if (i == 1 && suite_horiz == 4) {
                        // create a fire gem (can destroy 8 surrounding icons)
                        $('.icon[data-line=' + line + '][data-col=' + (colonne + i) + ']').addClass('fire');
                        $('#zone_message').append('<div class="fire">FIREBALL!</div>');
                    } else {
                        if (i == 2 && suite_horiz == 5) {
                            // create a hypercube (can destroy all icons)
                            $('.icon[data-line=' + line + '][data-col=' + (colonne + i) + ']')
                                    .removeClass('icon_1 icon_2 icon_3 icon_4 icon_5 icon_6 icon_7 icon_8')
                                    .addClass('hypercube new');
                            tab_icons[line][colonne + i] = 10;
                            $('#zone_message').append('<div class="hypercube">HYPERCUBE!</div>');
                        } else {
                            tab_suppr[line][colonne + i] = true;
                            test_horiz[line][colonne + i] = true;
                        }
                    }
                }

                i++;
            }
        }
    }
    return chain_found;
}
;


function destroy_around(line, colonne) {
    if (line > 0 && colonne > 0) {
        tab_suppr[line - 1][colonne - 1] = true;
    }
    if (line > 0) {
        tab_suppr[line - 1][colonne] = true;
    }
    if (line > 0 && colonne < NB_COLUMNS - 1) {
        tab_suppr[line - 1][colonne + 1] = true;
    }
    if (colonne > 0) {
        tab_suppr[line][colonne - 1] = true;
    }
    if (colonne < NB_COLUMNS - 1) {
        tab_suppr[line][colonne + 1] = true;
    }
    if (line < NB_LINES - 1 && colonne > 0) {
        tab_suppr[line + 1][colonne - 1] = true;
    }
    if (line < NB_LINES - 1) {
        tab_suppr[line + 1][colonne] = true;
    }
    if (line < NB_LINES - 1 && colonne < NB_COLUMNS - 1) {
        tab_suppr[line + 1][colonne + 1] = true;
    }
    explosion(line, colonne);
}
;

function explosion(line, colonne) {
    var $explosion = $('<div class="explosion"></div>');
    $explosion.css({
        'left': (colonne - 1) * CUT_ICON,
        'top': (line - 1) * CUT_ICON
    });
    $('#zone_play').append($explosion);
    $('#zone_message').append('<div class="fire">GREAT!</div>');
    setTimeout(function () {
        $explosion.remove();
    }, 600);

}
;

function destroy_color(num_icon, line, colonne) {
    for (var i = 0; i < NB_LINES; i++) {
        for (var j = 0; j < NB_COLUMNS; j++) {
            if (tab_icons[i][j] == num_icon) {
                tab_suppr[i][j] = true;
                $('.icon[data-line=' + i + '][data-col=' + j + ']').css({
                    'left': colonne * CUT_ICON,
                    'top': line * CUT_ICON
                });
            }
        }
    }
}
;

function destroy_line_column(line, colonne) {
    $('#zone_message').append('<div class="star">GREAT!</div>');
    for (var i = 0; i < NB_LINES; i++) {
        tab_suppr[i][colonne] = true;
        $('.icon[data-line=' + i + '][data-col=' + colonne + ']').css({
            'left': colonne * CUT_ICON,
            'top': line * CUT_ICON
        });
    }
    for (var i = 0; i < NB_LINES; i++) {
        tab_suppr[line][i] = true;
        $('.icon[data-line=' + line + '][data-col=' + i + ']').css({
            'left': colonne * CUT_ICON,
            'top': line * CUT_ICON
        });
    }
}
;


function chute_icons() {
    trou_trouve = false;
    for (var i = NB_LINES - 1; i >= 0; i--) {
        for (var j = 0; j < NB_COLUMNS; j++) {


            if (tab_icons[i][j] == 0) {
                trou_trouve = true;
                // look above for an icon to fill the hole
                var k = 1;
                while ((i - k) >= 0 && tab_icons[i - k][j] == 0) {
                    k++;
                }
                if ((i - k) < 0) {
                    // no icon found above : create random new icon
                    var random_icon = Math.ceil(Math.random() * NB_ICONS);
                    $new_icon = $('<div class="icon icon_' + random_icon + '" data-line="' + i + '" data-col="' + j + '" data-icon="' + random_icon + '"></div>');
                    $new_icon.css({
                        'left': j * CUT_ICON,
                        'top': -CUT_ICON
                    });
                    $('#zone_play').append($new_icon);

                    $new_icon.animate({
                        'top': i * CUT_ICON
                    }, 0);


                    tab_icons[i][j] = random_icon;
                } else {
                    // icon found above : icon falling animation
                    var $icon_chute = $('.icon[data-line=' + (i - k) + '][data-col=' + j + ']');
                    // update icon properties (correct line and column numbers)
                    $icon_chute.attr('data-line', i);
                    $icon_chute.css('top', i * CUT_ICON);

                    tab_icons[i][j] = tab_icons[i - k][j];
                    tab_icons[i - k][j] = 0;

                }
            }
        }
    }
}
;

function test_possible_move() {
    var move_found = false;
    var hint_displayed = false;
    var nb_possible_moves = 0;

    for (var i = 0; i < NB_LINES; i++) {
        tab_test[i] = [];
        for (var j = 0; j < NB_COLUMNS; j++) {
            tab_test[i][j] = tab_icons[i][j];
        }
    }

    for (var i = 0; i < NB_LINES; i++) {
        for (var j = 0; j < NB_COLUMNS; j++) {
            // test right move
            if (j < NB_COLUMNS - 1) {
                tab_test[i][j] = tab_icons[i][j + 1];
                tab_test[i][j + 1] = tab_icons[i][j];
                if (test_chain_game_over(i, j)) {
                    move_found = true;
                    nb_possible_moves++;
                    if (debug_mode) {
                        $('.icon[data-line=' + i + '][data-col=' + (j + 1) + ']').addClass('hint');
                    }
                    if (hint_mode && !hint_displayed) {
                        $('.icon[data-line=' + i + '][data-col=' + (j + 1) + ']').addClass('hint');
                        hint_displayed = true;
                    }
                }
                if (test_chain_game_over(i, j + 1)) {
                    move_found = true;
                    nb_possible_moves++;
                    if (debug_mode) {
                        $('.icon[data-line=' + i + '][data-col=' + j + ']').addClass('hint');
                    }
                    if (hint_mode && !hint_displayed) {
                        $('.icon[data-line=' + i + '][data-col=' + j + ']').addClass('hint');
                        hint_displayed = true;
                    }
                }
                tab_test[i][j] = tab_icons[i][j];
                tab_test[i][j + 1] = tab_icons[i][j + 1];
            }

            // test down move
            if (i < NB_LINES - 1) {
                tab_test[i][j] = tab_icons[i + 1][j];
                tab_test[i + 1][j] = tab_icons[i][j];
                if (test_chain_game_over(i, j)) {
                    move_found = true;
                    nb_possible_moves++;
                    if (debug_mode) {
                        $('.icon[data-line=' + (i + 1) + '][data-col=' + j + ']').addClass('hint');
                    }
                    if (hint_mode && !hint_displayed) {
                        $('.icon[data-line=' + (i + 1) + '][data-col=' + j + ']').addClass('hint');
                        hint_displayed = true;
                    }
                }
                if (test_chain_game_over(i + 1, j)) {
                    move_found = true;
                    nb_possible_moves++;
                    if (debug_mode) {
                        $('.icon[data-line=' + i + '][data-col=' + j + ']').addClass('hint');
                    }
                    if (hint_mode && !hint_displayed) {
                        $('.icon[data-line=' + i + '][data-col=' + j + ']').addClass('hint');
                        hint_displayed = true;
                    }
                }
                tab_test[i][j] = tab_icons[i][j];
                tab_test[i + 1][j] = tab_icons[i + 1][j];
            }
        }
    }

    if (nb_possible_moves <= 3) {
        if (nb_possible_moves <= 1) {
            $('#moves').addClass('critical').html(nb_possible_moves + '<br>move');
        } else {
            $('#moves').removeClass('critical').html(nb_possible_moves + '<br>moves');
        }
    } else {
        $('#moves').removeClass('critical').html('');
    }


    return move_found;
}
;




function test_chain_game_over(line, colonne) {
    var chain_found = false;
    var num_icon = tab_test[line][colonne];
    var suite_worthy = 1;
    var suite_horiz = 1;
    var i;
    // up
    i = 1;
    while (line - i >= 0 && tab_test[line - i][colonne] == num_icon) {
        suite_worthy++;
        i++;
    }
    // down
    i = 1;
    while (line + i < NB_COLUMNS && tab_test[line + i][colonne] == num_icon) {
        suite_worthy++;
        i++;
    }
    // left
    i = 1;
    while (colonne - i >= 0 && tab_test[line][colonne - i] == num_icon) {
        suite_horiz++;
        i++;
    }
    // right
    i = 1;
    while (colonne + i < NB_LINES && tab_test[line][colonne + i] == num_icon) {
        suite_horiz++;
        i++;
    }

    if (suite_worthy >= 3) {
        chain_found = true;
    }
    if (suite_horiz >= 3) {
        chain_found = true;
    }
    if (tab_test[line][colonne] == 10) {
        // hypercube
        chain_found = true;
    }
    return chain_found;
}
;

function on_resize() {
    board_size = $('#zone_play').width();
    console.log(board_size);
    CUT_ICON = board_size / 8;

    $('#zone_play').css({
        'height': board_size + 'px',
        'background-size': board_size / 4 + 'px ' + board_size / 4 + 'px'
    });

    for (var i = 0; i < NB_LINES; i++) {
        for (var j = 0; j < NB_COLUMNS; j++) {
            $('.icon[data-line=' + i + '][data-col=' + j + ']').css({
                'left': j * CUT_ICON + 'px',
                'top': i * CUT_ICON + 'px'
            });
        }
    }

    setTimeout(function () {
        // hide the address bar
        window.scrollTo(0, 1);
    }, 0);

}
;

function loadimages(imgArr, callback) {
    //Keep track of the images that are loaded
    var imagesLoaded = 0;
    function _loadAllImages(callback) {
        //Create an temp image and load the url
        var img = new Image();
        $(img).attr('src', imgArr[imagesLoaded]);
        if (img.complete || img.readyState === 4) {
            // image is cached
            imagesLoaded++;
            //Check if all images are loaded
            if (imagesLoaded == imgArr.length) {
                //If all images loaded do the callback
                callback();
            } else {
                //If not all images are loaded call own function again
                _loadAllImages(callback);
            }
        } else {
            $(img).load(function () {
                //Increment the images loaded variable
                imagesLoaded++;
                //Check if all images are loaded
                if (imagesLoaded == imgArr.length) {
                    //If all images loaded do the callback
                    callback();
                } else {
                    //If not all images are loaded call own function again
                    _loadAllImages(callback);
                }
            });
        }
    }
    ;
    _loadAllImages(callback);
}
