/*global jQuery, _ */

/*!
 * SnakeJS UWC v0.1
 * https://github.com/pavel-lyapin/snake-js
 *
 * Requires jQuery (http://jquery.com), Underscore.js (http://underscorejs.org)
 *
 * Released under the MIT license
 * Date: Sat Nov 24 2012
 */
(function (window, $, _) {
    "use strict";
    var SnakeJS = SnakeJS || {};

    /**
     * Get a block by column and row.
     *
     * @param {number} col
     * @param {number} row
     * @return {object} jQuery object
     */
    SnakeJS.getBlock = function(col, row) {
        return $('div.game-block.col' + parseInt(col, 10) + '.row' + parseInt(row, 10));
    };

    /**
     * Get a block by {x: int, y: int} object.
     *
     * @param {object} obj
     * @return {object} position object
     */
    SnakeJS.getBlockByObject = function(obj) {
        return $('div.game-block.col' + obj.x + '.row' + obj.y);
    };

    /**
     * Remove snake and food (optionally) from field.
     *
     * @param {bool} full Remove food fields too or not
     */
    SnakeJS.clear = function(full) {
        var blocks = $('div.game-block');
        blocks.removeClass('snake-here').removeClass('snake-head')
                .removeClass('down').removeClass('up').removeClass('right').removeClass('left');
        if (full) {
            blocks.removeClass('food-here');
        }
    };

    /**
     * Bind keyboard arrow keys
     */
    SnakeJS.bindKeyboard = function() {
        var that = this;
        $(document).keydown(function (e) {
            var keyCode = e.keyCode || e.which,
                arrow = {37: 'LEFT', 38: 'UP', 39: 'RIGHT', 40: 'DOWN'};

            // prohibit change direction to reverse (e.g. can't change from up to down)
            if (!(arrow[keyCode+2] === that.direction || arrow[keyCode-2] === that.direction)) {
                that.direction = arrow[keyCode];
            }
        });
    };

    /**
     * Initialize the field with cells (using columns and rows number from settings)
     *
     * @param {object} domElement jQuery DOM element to insert fields
     */
    SnakeJS.generateField = function(domElement) {
        // cols and rows in "for" statement
        var i = 0, j = 0;
        var insertedFields = '';
        for (; i < this.settings.cols * this.settings.rows; i++) {
            if (i > 0 && i % this.settings.cols === 0) {
                j++;
                insertedFields += '<div class="game-block col' + i % this.settings.cols + ' row' + j + '" style="clear: both" />';
            } else {
                insertedFields += '<div class="game-block col' + i % this.settings.cols + ' row' + j + '" />';
            }
        }
        domElement.html(insertedFields);
    };

    /**
     * Randomly generate food over the play field.
     *
     * @param {number} maxFood maximum number of food fields to be generated (min. is 1)
     */
    SnakeJS.generateFood = function(maxFood) {
        var foodCount = Math.floor((Math.random()*maxFood)+1), i;
        for (i = 0; i < foodCount; i++) {
            var row = Math.floor((Math.random()*this.settings.rows));
            var col = Math.floor((Math.random()*this.settings.cols));

            // do not generate food over snake
            if (!this._inSnake({x: col, y: row})) {
                this.getBlock(col, row).addClass('food-here');
            } else {
                // regenerate number
                i--;
            }
        }
    };

    /**
     * Initialize the snake position array (from the top of play field)
     */
    SnakeJS.initSnake = function() {
        var x = Math.round(this.settings.cols / 2), i;
        this.snake = [];
        for (i = -this.settings.snakeLength; i < 0; i++) {
            this.snake.push({x: x, y: i});
        }
    };

    /**
     * Paint the snake using data from {this.snake} array
     */
    SnakeJS.paintSnake = function() {
        for (var i in this.snake) {
            if (this.snake.hasOwnProperty(i)) {
                this.getBlock(this.snake[i].x, this.snake[i].y).addClass('snake-here');
            }
        }
        // show direction to switch snake head direction (via css)
        this.getBlock(this.snake[i].x, this.snake[i].y).addClass(this.direction.toLowerCase()).addClass('snake-head');
    };

    /**
     * Update the timer that counts minutes:seconds
     */
    SnakeJS.timerTick = function() {
        this.time++;
        var minutes = Math.floor(this.time / 60);
        var seconds = this.time % 60;
        $('.game-timer').text((minutes < 10 ? "0" : "") + minutes + ':' + (seconds < 10 ? "0" : "") + seconds);
    };

    /**
     * Action after user levels up
     */
    SnakeJS.levelUp = function() {
        var level = $('.game-level');
        level.text(parseInt(level.text(), 10) + 1);
        if (!$('.food-here').length) {
            this.generateFood(this.settings.maxFood);
        }
        this.accelerate();
    };

    /**
     * Speed up the snake
     */
    SnakeJS.accelerate = function() {
        clearInterval(this.intervalPlay);
        if (this.currentSpeed > this.settings.maxSpeed) {
            this.currentSpeed -= this.settings.acceleration;
        }
        var that = this;
        this.intervalPlay = setInterval(function() {
            that.move();
        }, that.currentSpeed);
    };

    /**
     * Checks if {x: int, y: int} object belongs to the current snake position
     * @private
     * @param {object} obj position object
     */
    SnakeJS._inSnake = function(obj) {
        return _.find(this.snake, function(s) {
            return (s.x === obj.x && s.y === obj.y);
        });
    };

    /**
     * Make the snake move by one step
     */
    SnakeJS.move = function() {
        this.clear();

        var snakeHead = SnakeJS.snake[SnakeJS.snake.length-1];
        var newPos = {x: snakeHead.x, y: snakeHead.y};

        switch (this.direction) {
            case 'DOWN':
                newPos.y++;
                break;
            case 'UP':
                newPos.y--;
                break;
            case 'LEFT':
                newPos.x--;
                break;
            case 'RIGHT':
                newPos.x++;
                break;
        }

        var hasSelfIntersection = this._inSnake(newPos);

        // snake confronted with border or with itself
        if (newPos.x < 0 || newPos.x > this.settings.cols ||
                newPos.y < 0 ||newPos.y > this.settings.rows || hasSelfIntersection) {
            this.lose();
            return;
        }

        var newObj = this.getBlockByObject(newPos);

        if (newObj.hasClass('food-here')) {
            newObj.removeClass('food-here');
            this.levelUp();
        } else {
            this.snake.shift();
        }

        this.snake.push(newPos);
        this.paintSnake();
    };

    /**
     * Action after user loses the game
     */
    SnakeJS.lose = function() {
        clearInterval(this.intervalPlay);
        clearInterval(this.intervalTimer);
        $('.game-alert').fadeIn().find('.close').click(function() {
            $(this).parent().fadeOut();
        });
        this.addResult();
        this.reset();
    };

    /**
     * Add result to the table and localStorage
     */
    SnakeJS.addResult = function() {
        var table = $('.game-best-results tbody');
        table.append('<tr><td>' + $('#game-name').val() + '</td><td>' +
            $('.game-level').text() + '</td><td>' + $('.game-timer').text() + '</td></tr>');
        localStorage['results'] = table.html();
    };

    /**
     * Load results from localStorage
     */
    SnakeJS.loadResults = function() {
        var table = $('.game-best-results tbody');
        if (localStorage['results']) {
            table.html(localStorage['results']);
        } else {
            table.html('');
        }
    };

    /**
     * Initial reset of parameters (when starting a new game)
     */
    SnakeJS.reset = function() {
        this.clear('full');
        clearInterval(this.intervalPlay);
        clearInterval(this.intervalTimer);
        this.time = 0;
        this.paused = false;
        this.currentSpeed = this.settings.speed;
        this.direction = 'DOWN';
        $('.game-timer').text('00:00');
        $('.game-level').text('0');
    };

    /**
     * Pause/resume the game
     */
    SnakeJS.pause = function() {
        var that = this;

        if (this.paused === false) {
            clearInterval(this.intervalPlay);
            clearInterval(this.intervalTimer);
            this.paused = true;
        } else {
            that.intervalTimer = setInterval(function() {
                that.timerTick();
            }, 1000);

            that.intervalPlay = setInterval(function() {
                that.move();
            }, that.currentSpeed);
            this.paused = false;
        }
    };

    /**
     * Initialize game
     * @param {object} options Overwrites the default configuration. See documentation or default settings for all options.
     */
    SnakeJS.init = function(options) {
        // Default configuration (please extend via "options" parameter)
        this.settings = $.extend({
            'snakeLength': 6,
            'speed' : 500,
            'acceleration': 20,
            'maxSpeed': 200,
            'cols': 20,
            'rows': 13,
            'maxFood': 5
        }, options);

        this.generateField($('.game-field'));
        this.bindKeyboard();
        this.loadResults();

        var that = this;

        $('.game-start').click(function() {
            var name = $('#game-name');
            if (!name.val()) {
                name.parent().addClass('error');
                return;
            }
            name.parent().removeClass('error');
            that.reset();
            that.initSnake();
            that.generateFood(that.settings.maxFood);

            // timer for counting minutes:seconds
            that.intervalTimer = setInterval(function() {
                that.timerTick();
            }, 1000);

            // timer for counting snake moves
            that.intervalPlay = setInterval(function() {
                that.move();
            }, that.settings.speed);
        });

        $('.game-pause').click(function() {
            that.pause();
            if ($(this).hasClass('btn-info')) {
                $(this).removeClass('btn-info').addClass('btn-warning').text('Resume');
            } else {
                $(this).removeClass('btn-warning').addClass('btn-info').text('Pause');
            }
        });

        $('.game-history-clear').click(function() {
            localStorage.clear();
            that.loadResults();
        });
    };

    // reveal SnakeJS to browser
    window.SnakeJS = SnakeJS;

})(window, jQuery, _);