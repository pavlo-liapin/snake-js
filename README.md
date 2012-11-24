snake-js
========

#  Welcome to Snake-JS from [UWC 3](http://iii.uwc.org.ua) final!
![SnakeJS](http://cdn1.iconfinder.com/data/icons/crystalproject/128x128/apps/ksnake.png)
Enjoy the 6-hour-made fun game from the Ukrainian Web Challenge III! Reach the greatest level within the minimum time and be happy! :)


## Tech specs:

### JS Dependencies
* [jQuery](http://jquery.com)
* [Underscore.js](http://underscorejs.org)

### Size

* Dev: 10.8 kB
* Minified: 4.79 kB

### Usage example
```html
<script src="snake.js"></script>
<script>
    SnakeJS.init({
        // optional parameters
        maxFood: 10
    });
</script>
```
### Optional parameters

* `snakeLength` - initial cells count for snake (default: `6`)
* `speed` - initial timeout in milliseconds for snake to move (default: `500`)
* `acceleration` - timeout reduction in milliseconds after level up (default: `20`)
* `maxSpeed` - end point for timeout, when it will not be changed anymore (default: `200`)
* `cols` - playfield columns (default: `20`)
* `rows` - playfield rows (default: `13`)
* `maxFood` - maximum number of food, that can be generated after all food is eaten by snake. minimum is 1 (default: `5`)

### Support or Contact
Have questions? Feel free to contact me on [Github](https://github.com/pavel-lyapin/).