//Debugging Screen Canvas
var debug = $("#Debugging")[0];
var debug_ctx = debug.getContext("2d");

//Menu Screen Canvas
var menu_canvas = $("#Menu_C")[0];
var menu_ctx = menu_canvas.getContext("2d");

//Moving Objects Canvas
var movObj_canvas = $("#Moving_Object_C")[0];
var movObj_ctx = movObj_canvas.getContext("2d");

//Static Objects Canvas
var staObj_canvas = $("#Static_Object_C")[0];
var staObj_ctx = staObj_canvas.getContext("2d");

//Background Canvas
var bg_canvas = $("#Background_C")[0];
var bg_ctx = bg_canvas.getContext("2d");

// Browser Animation Frame Request
var requestAnimationFrame = window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        window.oRequestAnimationFrame;

//Screen Variables

var canvas_width = $("#Background_C").width();      // total drawing width
var canvas_height = $("#Background_C").height();    // total drawing height

var game_width = 400;       // drawing width for game
var game_height = 400;      // drawing height for game

var bgImg = new Image();
bgImg.src = "./imgs/Grass_Background.png";

var hillImg = new Image();
hillImg.src = "./imgs/AntHill.png";

//Game check Variables
var isPlaying = false;

// Global Key_Check Variables
var isUpKey = false;
var isDownKey = false;
var isRightKey = false;
var isLeftKey = false;

//Default font style
var o_font = bg_ctx.font; // currently: default provided by browser

// Timer variables
var gametime;       // This is the interval variable
var count = 0;      // This holds the amount of time passed unpaused

//Supporting Functions

function rotateCanvas(x, y, angle, layer) {
    var rad = Math.PI / 180 * angle;
    var sin = Math.sin(rad);
    var cos = Math.cos(rad);
    layer.translate(x, y);
    layer.transform(cos, sin, -sin, cos, 0, 0);
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt(
                     (x2 - x1) * (x2 - x1)
                     + (y2 - y1) * (y2 - y1));
}

function coordRotation(o_x, o_y, angle) {
    rad = Math.PI / 180 * angle;
    return coords = {
        x: Math.round(o_x * Math.cos(rad) - o_y * Math.sin(rad)),
        y: Math.round(o_x * Math.sin(rad) + o_y * Math.cos(rad)),
    };
}

function draw_Triangle(x, y, side, angle, fill_Color, stroke_Color, layer) {
    layer.save();
    rotateCanvas(x, y, angle, layer);
    var len = Math.sqrt(3) * side / 2;
    var center = side / (Math.sqrt(3) * 2);

    var y1 = -(len - center);

    var coords1 = coordRotation(0, y1, 0);
    var coords2 = coordRotation(0, y1, 120);
    var coords3 = coordRotation(0, y1, 240);

    layer.beginPath();
    layer.moveTo(coords1.x, coords1.y);
    layer.lineTo(coords2.x, coords2.y);
    layer.lineTo(coords3.x, coords3.y);

    layer.fillStyle = fill_Color;
    layer.fill();
    layer.strokeStyle = stroke_Color;
    layer.stroke();

    layer.restore();

}

function draw_Square(x, y, size, angle, fill_Color, stroke_Color, layer) {
    layer.save();
    var center = Math.round(size / 2);
    rotateCanvas(x, y, angle, layer);
    layer.fillStyle = fill_Color;
    layer.fillRect(-center, -center, size, size);
    layer.strokeStyle = stroke_Color;
    layer.strokeRect(-center, -center, size, size);
    layer.restore();
}

function draw_Circle(x, y, radius, fill_Color, stroke_Color, layer) {
    layer.beginPath();
    layer.fillStyle = fill_Color;
    layer.strokeStyle = stroke_Color;
    layer.arc(x, y, radius, 0, 2 * Math.PI, true);
    layer.fill();
    layer.stroke();
}
