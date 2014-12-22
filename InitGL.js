/*
    initGL.js - Essential setup for our WebGL application
*/

var canvas; // global to hold reference to an HTML5 canvas
var gl; // global to hold reference to our WebGL context

// a few simple constants
const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;

var currAngle = 0;

var drawables = []; // used to store any objects that need to be drawn

/* Initialize global WebGL stuff - not object specific */
function initGL()
{
    // look up our canvas element
    canvas = document.getElementById( "gl-canvas" );

    // obtain a WebGL context bound to our canvas
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height ); // use the whole canvas
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 ); // background color
    gl.enable(gl.DEPTH_TEST); // required for 3D hidden-surface elimination

    // set the projection matrix
    // note: added rotation just to better see the shapes of our cubes
    projection = ortho(-10, 10, -5, 5, -16, 16);
    projection = mult(projection, lookAt(vec3(2, 1, -2), vec3(0, 0, 0), vec3(0, 1, 0)));
    projection = mult(scale(1, 1, 1), projection);

    // set up an event handler for this button
    var a = document.getElementById("Btn_TR");
    a.addEventListener("click",
        function(){
            if (currAngle === 0) {
                currAngle = 90;
            }
        },
        false
    );

    // set up an event handler for this button
    var b = document.getElementById("Btn_TL");
    b.addEventListener("click",
        function(){
            if (currAngle === 0) {
                currAngle = -90;
            }
        },
        false
    );
}

/* Global render callback - would draw multiple objects if there were more than one */
var renderScene = function(){
    // start from a clean frame buffer for this frame
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (currAngle > 0) {
        currAngle -= 2
        drawables[0].turn(2);
    } else if (currAngle < 0) {
        currAngle += 2;
        drawables[0].turn(-2);
    }

    // loop over all objects and draw each
    var i;
    for (i in drawables) {
        drawables[i].draw();
    }

    // queue up this same callback for the next frame
    requestAnimFrame(renderScene);
}
