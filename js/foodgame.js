$(document).ready(function () {
    //Game Objects

    //Generic Ant Objects
    function GenericAnt(x, y, size, speed, carry, inEnemyTerr,
			 gavePoints, color, hill) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.carry = carry;
        this.inEnemyTerr = inEnemyTerr;
        this.gavePoints = gavePoints;
        this.color = color;
        this.hill = hill;
    }
    GenericAnt.prototype.manageSpeed = function () {
        if (this.carry == 0) {
            this.speed = 5;
        }
        if (this.speed >= 0.5) {
            this.speed = (5 - this.carry / 100);
        }
        if (this.speed < 0.5) {
            this.speed = 0.5;
        }
    }
    GenericAnt.prototype.action = function () { console.log("bad") }
    GenericAnt.prototype.draw = function () {
        draw_Square(this.x, this.y, this.size, this.color, movObj_ctx);
        debug_ctx.font = o_font;
        var text = "F: " + this.carry;
        debug_ctx.fillText(text, this.x - (this.size / 2 + 2), this.y - (this.size / 2 + 2));
    }

    //Specific Ant Objects

    //Player ant
    Ant.prototype = new GenericAnt();
    function Ant() {
        this.x = Math.round(game_width - (game_width / 4));
        this.y = Math.round(game_height - (game_height / 4));
        this.size = 8;
        this.speed = 5;
        this.carry = 0;
        this.inEnemyTerr = false;
        this.gavePoints = false;
        this.color = "blue";
        this.hill = p_antHill;
    }

    Ant.prototype.action = function () {

        //Checking for keypress
        if (isUpKey && this.y >= 5) {
            this.y -= this.speed;
        }
        if (isDownKey && this.y <= game_height - 5) {
            this.y += this.speed;
        }
        if (isLeftKey && this.x >= 5) {
            this.x -= this.speed;
        }
        if (isRightKey && this.x <= game_width - 5) {
            this.x += this.speed;
        }

        //Handles speed control based on score
        this.manageSpeed();

        //Checking Collision will all objects in object_arr
        for (var i = 0; i < object_arr.length; i++) {
            var curO = object_arr[i];
            var radius = curO.size / 2 + 2;
            if (this.x > curO.x - radius && this.x < curO.x + radius &&
                this.y > curO.y - radius && this.y < curO.y + radius) {
                if (curO instanceof Food) {
                    this.carry += Math.floor(curO.score);
                    object_arr.splice(i, 1);
                    object_arr.push(create_food());
                }
                else if (curO instanceof EnemyAnt) {
                    var avg = Math.floor((this.carry + curO.carry) / 2);
                    this.carry = avg;
                    curO.carry = avg;
                }
                else if (curO instanceof GenericAntHill) {
                    if (curO === this.hill) {
                        curO.score += this.carry;
                        this.carry = 0;
                    }
                    else {
                        this.inEnemyTerr = true;
                        if (!this.gavePoints) {
                            this.gavePoints = true;
                            curO.score += Math.round((this.carry / 4) * 3);
                            this.carry = Math.round(this.carry / 4);
                        }
                    }
                }
            }
            radius = e_antHill.size / 2 + 2;
            if (!(this.x > e_antHill.x - radius && this.x < e_antHill.x + radius &&
                 this.y > e_antHill.y - radius && this.y < e_antHill.y + radius)) {
                this.inEnemyTerr = false;
                this.gavePoints = false;
            }
        }
    }

    //Enemy Ant
    EnemyAnt.prototype = new GenericAnt();
    function EnemyAnt() {
        this.x = Math.round(Math.random() * (game_width / 2));
        this.y = Math.round(Math.random() * (game_height / 2));
        this.size = 8;
        this.speed = 5;
        this.carry = 0;
        this.inEnemyTerr = false;
        this.gavePoints = false;
        this.color = "red";
        this.hill = e_antHill;
    }
    EnemyAnt.prototype.action = function () {
        curE = this; // enemyAnt object
        var curF;

        var hasTarget = false;
        var x = 0;
        var y = 0;
        var dist = 1000;
        var ratio = 0;

        for (var i = 0; i < object_arr.length; i++) {
            curF = object_arr[i];
            if (curF instanceof Food) {
                var distX = curF.x - this.x;
                var distY = curF.y - this.y;
                distX = distX * distX;
                distY = distY * distY;
                var distF = Math.sqrt(distX + distY);
                var ratioF = curF.score / distY;
                if (distF < dist) {
                    dist = distF;
                    x = curF.x;
                    y = curF.y;
                    hasTarget = true;
                }
            }
        }

        if (curE.carry > 400) {
            x = e_antHill.x;
            y = e_antHill.y;
        }

        if ((x > this.x + 5) && hasTarget) {
            this.x += this.speed;
        }
        else if ((x < this.x - 5) && hasTarget) {
            this.x -= this.speed;
        }
        if ((y > this.y + 5) && hasTarget) {
            this.y += this.speed;
        }
        if ((y < this.y - 5) && hasTarget) {
            this.y -= this.speed;
        }

        for (var i = 0; i < object_arr.length; i++) {
            var curO = object_arr[i];
            var radius = curO.size / 2 + 2;
            if (this.x > curO.x - radius && this.x < curO.x + radius &&
                this.y > curO.y - radius && this.y < curO.y + radius) {
                if (curO instanceof Food) {
                    var radius = (curO.size / 2) + 2;
                    if (this.x > curO.x - radius && this.x < curO.x + radius &&
                        this.y > curO.y - radius && this.y < curO.y + radius) {
                        this.carry += Math.floor(curO.score);
                        object_arr.splice(i, 1);
                        object_arr.push(create_food());
                        hasTarget = false;
                    }
                }
                else if (curO instanceof GenericAntHill) {
                    if (curO === this.hill) {
                        curO.score += this.carry;
                        this.carry = 0;
                    }
                    else {
                        this.inEnemyTerr = true;
                        if (!this.gavePoints) {
                            this.gavePoints = true;
                            curO.score += Math.round((this.carry / 4) * 3);
                            this.carry = Math.round(this.carry / 4);
                        }
                    }
                }
                radius = p_antHill.size / 2 + 2;
                if (!(this.x > p_antHill.x - radius && this.x < p_antHill.x + radius &&
                     this.y > p_antHill.y - radius && this.y < p_antHill.y + radius)) {
                    this.inEnemyTerr = false;
                    this.gavePoints = false;
                }
            }
        }

        this.manageSpeed();
        if (count < 4) {
            this.speed = 2;
        }
    }

    // Food object
    function Food(x, y, size, score) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.score = score;
    }
    Food.prototype.action = function () { };
    Food.prototype.draw = function () {
        draw_Square(this.x, this.y, this.size, "Orange", staObj_ctx);
        debug_ctx.fillStyle = "black";
        var foodVal = "V: " + this.score;
        debug_ctx.fillText(foodVal, this.x - (this.size / 2 + 2), this.y - (this.size / 2 + 2));
    }

    //Generic Anthill Object
    function GenericAntHill(x, y, size, score, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.score = score;
        this.color = color;
    }
    GenericAntHill.prototype.action = function () { };
    GenericAntHill.prototype.draw = function () {
        //draw_Square(this.x, this.y, this.size, this.color, staObj_ctx);
        staObj_ctx.drawImage(hillImg, 0, 0, this.size, this.size,
                                         this.x - this.size/2, this.y - this.size/2, this.size, this.size);

        debug_ctx.fillStyle = this.color;
        var text = "Score: " + this.score;

        debug_ctx.font = o_font;
        if (this.x < game_width / 2) {
            if (this.y < game_height / 2) {
                debug_ctx.fillText(text, this.x - (this.size / 2 + 2), this.y + (this.size / 2 + 10));
            }
            else if (this.y > game_height / 2) {
                debug_ctx.fillText(text, this.x - (this.size / 2 + 2), this.y - (this.size / 2 + 5));
            }
        }
        else if (this.x > game_width / 2) {
            if (this.y < game_height / 2) {
                debug_ctx.fillText(text, this.x - (this.size / 2 + 2), this.y + (this.size / 2 + 10));
            }
            else if (this.y > game_height / 2) {
                debug_ctx.fillText(text, this.x - (this.size / 2 + 2), this.y - (this.size / 2 + 5));
            }
        }

        //debug_ctx.font = 'bold 15px helvetica';
        //debug_ctx.fillStyle = "white";
        //debug_ctx.fillText((this.color).toUpperCase(), this.x - 20, this.y);
        debug_ctx.font = o_font;
    }


    // Specfic Anthill Objects 
    var p_antHill = new GenericAntHill(game_width - 32,        //x-coord
                                       game_height - 32,       //y-coord
                                       64,                     //size
                                       0,                      //initial score
                                       "blue");                //color 

    var e_antHill = new GenericAntHill(32,                     //x-coord
                                       32,                     //y-coord
                                       64,                     //size
                                       0,                      //inital score
                                       "red");                 //color


    var object_arr = new Array();

    //This function will set up the ant and food
    //This function will call draw on the animation loop

    function init() {

        clearInterval(gametime);
        //create Player Ant
        object_arr.push(new Ant());

        //Create Enemy Ants
        for (var i = 0; i < 1; i++) {
            object_arr.push(createEnemy());
        }

        object_arr.push(p_antHill);
        object_arr.push(e_antHill);

        //Create Food
        for (var i = 0; i < 5; i++) {
            object_arr.push(create_food());
        }

        drawMenu();
        drawbg();
        console.log("The Game has started");
        gameLoop();

        return;
    }

    init();

    function gameLoop() {
        if (!isPlaying) {
            pause();
            requestAnimationFrame(gameLoop);
        }
        if (isPlaying) {
            update();
            paint();
            requestAnimationFrame(gameLoop);
        }

    }

    function pause() {
        debug_ctx.clearRect(0, 0, canvas_width, canvas_height);
        menu_ctx.fillStyle = "black";
        menu_ctx.globalAlpha = 0.01;
        menu_ctx.fillRect(0, 0, game_width, game_width);
        menu_ctx.globalAlpha = 1;
        menu_ctx.fillStyle = "White"
        menu_ctx.font = 'bold 20px helvetica';
        menu_ctx.fillText("Press 'p' to continue.", game_width / 2 - 100, game_height / 2);
        menu_ctx.font = o_font;
    }

    function startTime() {
        gametime = setInterval(counter, 1000);
    }

    function stopTime() {
        clearInterval(gametime);
        gametime = null;
    }

    function counter() {
        if (count == 60) {
            isPlaying = false;
        }
        else {
            count++;
        }
    }

    function update() {
        //        ant.action();
        for (var i = 0; i < object_arr.length; i++) {
            object_arr[i].action();
        }
    }

    function paint() {
        debug_ctx.clearRect(0, 0, canvas_width, canvas_height);
        menu_ctx.clearRect(0, 0, canvas_width, canvas_height);
        movObj_ctx.clearRect(0, 0, canvas_width, canvas_height);
        staObj_ctx.clearRect(0, 0, canvas_width, canvas_height);
        bg_ctx.clearRect(0, 0, canvas_width, canvas_height);

        drawbg();
        drawMenu();

        for (var i = 0; i < object_arr.length; i++) {
            object_arr[i].draw();
        }

        debug_ctx.font = o_font;
        return;
    }

    function drawbg() {
        //bg_ctx.fillStyle = "white";
        //bg_ctx.fillRect(0, 0, game_width, game_height);
        //bg_ctx.strokeStyle = "black";
        //bg_ctx.strokeRect(0, 0, game_width, game_height);

        bg_ctx.drawImage(bgImg, 0, 0, game_width, game_height,
                                0, 0, game_width, game_height);

        var text = "Time Remaining: " + (60 - count);
        debug_ctx.font = 'bold 15px helvetica';
        debug_ctx.fillText(text, 5, game_height - 5);
    }

    function drawMenu() {
        menu_ctx.fillStyle = "#5976FF";
        menu_ctx.fillRect(0, game_height, canvas_width, canvas_height - game_height);
        menu_ctx.fillRect(game_width, 0 , canvas_width-game_width, canvas_height);

        menu_ctx.strokeStyle = "black";
        menu_ctx.strokeRect(0, 0, canvas_width, canvas_height);
        //menu_ctx.strokeRect(0, 0, game_width, game_height);
    }

    function draw_Square(x, y, size, a_color, layer) {
        var center = Math.round(size / 2);
        layer.fillStyle = a_color;
        layer.fillRect(x - center, y - center, size, size);
        layer.strokeStyle = "black";
        layer.strokeRect(x - center, y - center, size, size);
    }

    //Create object Functions

    function createEnemy() {
        return (new EnemyAnt());
    }

    function create_food() {
        var l_size = Math.round(Math.random() * 15 + 7);
        return new Food(Math.round(Math.random() * (game_width - 100) + 50),
            Math.round(Math.random() * (game_height - 100) + 50),
            l_size,
            Math.round(l_size * (l_size / 2)));
    }

    //gets key press for ant control
    $(document).keydown(function (e) {
        var key = (e.keyCode) ? e.keyCode : e.which;

        if (key == "37") {
            e.preventDefault();
            isLeftKey = true;
        }
        if (key == "38") {
            e.preventDefault();
            isUpKey = true;
        }
        if (key == "39") {
            e.preventDefault();
            isRightKey = true;
        }
        if (key == "40") {
            e.preventDefault();
            isDownKey = true;
        }
        if (key == "80") {
            e.preventDefault();
            if (count < 60) {
                isPlaying = !isPlaying;
                if (gametime) {
                    stopTime();
                }
                else {
                    startTime();
                }
            }
        }
    })

    $(document).keyup(function (e) {
        var key = (e.keyCode) ? e.keyCode : e.which;

        if (key == "37") {
            e.preventDefault();
            isLeftKey = false;
        }
        if (key == "38") {
            e.preventDefault();
            isUpKey = false;
        }
        if (key == "39") {
            e.preventDefault();
            isRightKey = false;
        }
        if (key == "40") {
            e.preventDefault();
            isDownKey = false;
        }
        if (key == "80") {
            e.preventDefault();
        }

    })

})