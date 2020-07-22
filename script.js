var x = 0; 
var y = 0; 
var n = 3; // sisi
var r = 700; // radius from center
var ang;
var startAng;
var triangle_points; // coordinate for drawing triangles
var line_points; // coordinate for drawing lines
var show_lines = false;

var canvas; // canvas
var gl; // WebGL context

function init() {
    canvas = document.getElementById("mycanvas");
    gl = canvas.getContext("experimental-webgl");

    drawPolygon();

    var input_n = document.getElementById("sides");
    input_n.oninput = function() {
        document.getElementById("sides_label").innerHTML = "Jumlah sisi: " + input_n.value;

        // redraw
        n = input_n.value;
        drawPolygon();
    };
}

function drawPolygon() {
    compute();
    drawTriangle();
}

function toRadians(degs) {
    return Math.PI * degs / 180;
}

function isOdd(n) {
    return (n % 2 == 1);
}

function compute() {
    n = Math.round(n);
    var centerAng = 2.0 * Math.PI / n;

    // calculate the start angle
    if(isOdd(n)) {
        startAng = - Math.PI / 2.0;  // 12 oclock
    } else {
        startAng = - Math.PI / 2.0 - centerAng / 2.0;
    }

    // calculate points
    line_points = new Array();
    triangle_points = new Array();
    triangle_points.push(x, y); // center coordinate
    for (var i = 0 ; i < n ; i++) {
        ang = startAng + (i * centerAng);
        vx = Math.round(x + r * Math.cos(ang)) / 1000;
        vy = Math.round(y - r * Math.sin(ang)) / 1000;

        triangle_points.push(vx, vy);
        line_points.push(x, y, vx, vy);
    }
    triangle_points.push(triangle_points[2], triangle_points[3]);
}

function drawTriangle() {
    /* Define the geometry and store it in buffer objects */
    var vertices = triangle_points;

    // Create a new buffer object
    var vertex_buffer = gl.createBuffer();

    // Bind an empty array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    // Pass the vertices data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    /* Create and compile Shader programs */
    // Vertex shader source code
    var vertCode =
    "attribute vec2 coordinates;" +
    "void main(void) {" + " gl_Position = vec4(coordinates,0.0, 1.0);" + "}";

    // Create a vertex shader object
    var vertShader = gl.createShader(gl.VERTEX_SHADER);

    // Attach vertex shader source code
    gl.shaderSource(vertShader, vertCode);

    //Compile the vertex shader
    gl.compileShader(vertShader);

    // Fragment shader source code
    var fragCode = "void main(void) {" + "gl_FragColor = vec4(0.8, 0.8, 0.8, 0.7);" + "}";

    // Create fragment shader object
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    // Attach fragment shader source code
    gl.shaderSource(fragShader, fragCode);

    // Compile the fragment shader
    gl.compileShader(fragShader);

    // Create a shader program object to store combined shader program
    var shaderProgram = gl.createProgram();

    // Attach a vertex shader
    gl.attachShader(shaderProgram, vertShader);

    // Attach a fragment shader
    gl.attachShader(shaderProgram, fragShader);

    // Link both programs
    gl.linkProgram(shaderProgram);

    // Use the combined shader program object
    gl.useProgram(shaderProgram);


    /* Associate the shader programs to buffer objects */
    // Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    // Get the attribute location
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");

    // Point an attribute to the currently bound VBO
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);

    // Enable the attribute
    gl.enableVertexAttribArray(coord);


    /* Drawing the required object (triangle) */
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);

    // Enable the depth test
    gl.enable(gl.DEPTH_TEST);

    // Clear the color buffer bit
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the view port
    gl.viewport(0,0,canvas.width,canvas.height);

    // Draw the triangle
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n + 2);
}

