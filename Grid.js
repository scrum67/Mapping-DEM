/*
    grid.js - Object-oriented WebGL example

    IMPORTANT NOTE:
    This scripts assumes that the initGL.js script has already been loaded,
    and that consequently a variety of global variables are already defined,
    such as: gl, drawables, X_AXIS, Y_AXIS, Z_AXIS
*/

/*
    Constructor for a Grid object
 */
function Grid (nx, nz, program, verticesArray) {
    this.initShaders(program);
    this.initData(nx, nz, program, verticesArray);
}

Grid.prototype.vertFile = "vertex-shader";
Grid.prototype.fragFile = "fragment-shader";

/* Initialize properties of this color cube object. */
Grid.prototype.initData = function(nx, nz, program, verticesArray)
{
    this.points  = []; // this array will hold raw vertex positions
    this.colors  = []; // this array will hold per-vertex color data
    this.indices = []; // this array will hold the indexes-to-draw from the points
    this.transform = mat4(); // initialize object transform as identity matrix

    this.mkgrid(nx, nz, verticesArray); // delegate to auxiliary function

    this.vBufferId = gl.createBuffer(); // reserve a buffer object
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBufferId ); // set active array buffer
    // pass data to the graphics hardware (convert JS Array to a typed array)
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.points), gl.STATIC_DRAW );
    
    // TODO #2c reserve a buffer object for the color attribute data, then
    //   set it active and pass the data down to the graphics hardware
	this.cBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cBufferId);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW );
    
    // TODO #3a reserve a buffer object for the element indices, then set it
    //   active and pass the data down to the hardware (be sure to use an
    //   "element array buffer", and when converting the indices JS Array to
    //   a typed array use 'new Uint16Array()' instead of 'flatten()'
    //   [See TypedArray on Mozilla Developer Network for additional info]
    this.eBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.eBufferId);
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW );
}

/* Load shaders and initialize attribute pointers. */
Grid.prototype.initShaders = function(program) {

    // use the existing program if given, otherwise use our own defaults
    this.program = program ? program
    					   : initShaders( gl, this.vertFile, this.fragFile );

    // get the position attribute and save it to our program object
    //     then enable the vertex attribute array
    this.program.vposLoc = gl.getAttribLocation( this.program, "vPosition" );
    gl.enableVertexAttribArray( this.program.vposLoc );

    // TODO #2d get the color attribute and save it to our program object
    //     then enable the vertex attribute array
    this.colorLoc = gl.getAttribLocation( this.program, "vColor" );
    gl.enableVertexAttribArray( this.colorLoc );
    
    // get the projection matrix uniform variable
    this.program.projLoc = gl.getUniformLocation(this.program, "projection");

    // TODO #1e get the model matrix uniform variable
    this.program.modelMatrix = gl.getUniformLocation(this.program, "modelMatrix");
}

Grid.prototype.draw = function(){
    // TODO #1f tell WebGL to use the Grid's own shader program
    gl.useProgram( this.program ); // set the current shader programs

    // pass the projection matrix into the pipeline
    gl.uniformMatrix4fv(this.program.projLoc, false, flatten(projection));

    // TODO #1g pass the model matrix into the pipeline
    gl.uniformMatrix4fv(this.program.modelMatrix, false, flatten(this.transform));

    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBufferId ); // set pos buffer active
    // map position buffer data to the corresponding vertex shader attribute
    gl.vertexAttribPointer( this.program.vposLoc, 4, gl.FLOAT, false, 0, 0 );

    // TODO #2e set color buffer active
    // TODO #2f map color buffer data to the corresponding vertex shader attribute
    gl.bindBuffer( gl.ARRAY_BUFFER, this.cBufferId );
    gl.vertexAttribPointer( this.colorLoc, 4, gl.FLOAT, false, 0, 0 );

    // TODO #3b set index buffer active
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.eBufferId );

    // TODO #3c render the primitives by calling drawElements
    gl.drawElements(gl.TRIANGLE_STRIP, this.numelems(), gl.UNSIGNED_SHORT, 0);
    
}

/* Returns the total count of vertices to be sent into the pipeline. */
Grid.prototype.numverts = function() {return this.points.length;};
/* Returns the total count of elements to be sent into the pipeline. */
Grid.prototype.numelems = function() {return this.indices.length;};

/* Build a grid object with random heights. */
Grid.prototype.mkgrid = function(nx, nz, verticesArray)
{
    var x, z, i; // best practice in JS is to declare our variables up front
	var columnNum = 1;
	
    // generate a regular, rectangular grid of points with random heights
    for (x = 0; x < nx; x++) {
        for (z = 0; z < nz; z++) {
        	this.points.push(vec4(x, verticesArray[x*nz+z]/2000, z, 1));
            //this.points.push(vec4(x, Math.pow(Math.random(), 2), z, 1));
            //console.log("Pushing points " + verticesArray[v]);
            if(verticesArray[x*nz+z]/1200 < 0.25) {
                this.colors.push(0.0, 0.0, 1.0, 1.0);
            } else if (verticesArray[x*nz+z]/1200 < 0.5) { 
            	this.colors.push(vec4(0.0, 1.0, 0.0, 1.0));
            } else if(verticesArray[x*nz+z]/1200 < 0.75) { 
            	this.colors.push(vec4(1.0, 1.0, 0.0, 1.0));
            } else {
            	this.colors.push(1.0, 1.0, 0.0, 1.0);
            }
           //this.colors.push(vec4(1, x % 2, z % 2, 1.0));
        }
    }
    // diagnostic output to verify that our points look correct
    console.log('Points['+this.points.length+']: ' + this.points);

    // TODO #3 figure out how to fill the indices array with the correct values
    // A call to mkgrid(4, 5) should yield points with indices as follows
    //      15 10  5  0
    //      16 11  6  1
    //      17 12  7  2
    //      18 13  8  3
    //      19 14  9  4
    // where the indices array reflects the winding order of triangle strips
    // with a stutter* at the end of a strip to wrap to next column
    // [0,5,1,6,2,7,3,8,4,9,9*,5*,5,10,6,11,7,12,8,13,9,14,14*,10*,10,15,11..]
    
    console.log("nz: " + nz + "nx: " + nx);
    for (i = 0; i < nx * nz - nz; i++) {/* TODO #3d replace with the correct test */
    /* TODO #3e push next two indices onto the array */
    //console.log("I: " + i);
        this.indices.push(i);
        this.indices.push(i + nz);
		
        /* TODO how #3f do we know when to wrap? */
        if(i - (nz * columnNum) + 1 == 0 && i != 0) { /* TODO #3g push the two stutter indices on */
            console.log("i: " + i);
        	this.indices.push((i + nz));
        	this.indices.push((i + 1));
        	columnNum++;
        }
    }
    // diagnostic output to verify that our indices look correct
    console.log('Indices['+this.indices.length+']: ' + this.indices);
}

/* Translate this cube along the specified canonical axis. */
Grid.prototype.move = function(dist, axis) {
    var delta = [0, 0, 0];

    if (axis === undefined) axis = Y_AXIS;
    delta[axis] = dist;

    this.transform = mult(translate(delta), this.transform);
}

/* Rotate this cube around the specified canonical axis. */
Grid.prototype.turn = function(angle, axis){
    var avec = [0, 0, 0];

    if (axis === undefined) axis = Y_AXIS;
    avec[axis] = 1;

    this.transform = mult(rotate(angle, avec), this.transform);
}

/* Set up event callback to start the application 
window.onload = function() {
    var w = 16, h = 16, g, shaders;

    initGL(); // basic WebGL setup for the scene 

    shaders = initShaders( gl, "vertex-shader", "fragment-shader" );

    // create a grid
    g = new Grid(16, 16, shaders);
    // center it at the origin
    g.move((1-w)/2, X_AXIS);
    g.move((1-h)/2, Z_AXIS);

    drawables.push(g); // add the grid to our list of drawables

    renderScene();
}*/
