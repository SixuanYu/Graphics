
// Vertex shader program----------------------------------
var VSHADER_SOURCE = 
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE = 
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var ANGLE_STEP = 45.0;
var floatsPerVertex = 7;  
var isDrag=false;    // mouse-drag: true when user holds down mouse button
var xMclik=0.0;      // last mouse button-down position
var yMclik=0.0;   
var xMdragTot=0.0;   // total (accumulated) mouse-drag amounts
var yMdragTot=0.0;  
var currentAngle = 0.0;
var tempX1=-0.3, tempX2, tempY1=0.0, tempY2;
var isclick=false;

function main() {

  var canvas = document.getElementById('webgl');
  numX = 0;
  numY = 0;
  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  var n = initVertexBuffer(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  canvas.onmousedown = function(ev){myMouseDown( ev, gl, canvas) }; 
  canvas.onmouseup =  function(ev){myMouseUp(currentAngle,n,modelMatrix,u_ModelMatrix,ev, gl, canvas)};
  canvas.onmousemove = function(ev){myMouseMove( ev, gl, canvas) };         

  window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("keyup", myKeyUp, false);
  window.addEventListener("keypress", myKeyPress, false);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.enable(gl.DEPTH_TEST);     
  
  // Get handle to graphics system's storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Create a local version of our model matrix in JavaScript 
  var modelMatrix = new Matrix4();
  
  // Create, init current rotation angle value in JavaScript
 pos_x = -0.3, pos_y = 0.0, pos_z = 0.0;

  var tick = function() {
    initVertexBuffer(gl);
    currentAngle = animate(currentAngle);  
    if(!isclick){
      draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix, tempX1, tempY1, pos_z);}
      isclick=false;
    requestAnimationFrame(tick, canvas);   
  };

  tick();
}

function initVertexBuffer(gl) {

  var c30 = Math.sqrt(0.75);
  var sq2 = Math.sqrt(2.0);            

  makeSphere();
  makePatrickHead();
  makePatrickBody();
  makeTorus();
  makeSpongeEye();

  
  var mySiz = sphVerts.length + sph2Verts.length + cylVerts.length + cyl2Verts.length + torVerts.length + 108*7+12*7;
  var nn = mySiz / floatsPerVertex;

  var colorShapes = new Float32Array(mySiz);
  sphStart = 0;
  for(i=0,j=0; j< sphVerts.length; i++, j++) {
    colorShapes[i] = sphVerts[j];
    }

  sph2Start = i;
  for(j=0; j< sph2Verts.length; i++, j++) {
    colorShapes[i] = sph2Verts[j];
    }

  cylStart = i;
  for(j=0; j< cylVerts.length; i++, j++) {
    colorShapes[i] = cylVerts[j];
    }

  cyl2Start = i;
  for(j=0; j< cylVerts.length; i++, j++) {
    colorShapes[i] = cyl2Verts[j];
    }

  torStart = i;
  for(j=0; j< torVerts.length; i++, j++) {
    colorShapes[i] = torVerts[j];
    }
  pointsStart = i;
  var pointsShapes = new Float32Array([

    // SpongeBob's Face
    // +x face: 
     0.3, -1.0, -1.0, 1.0,    1.0, 1.0, 0.0,  // Node 3
     0.3,  1.0, -1.2, 1.0,    1.0, 1.0, 0.0,  // Node 2
     0.3,  1.0,  1.2, 1.0,    1.0, 1.0, 0.0,  // Node 4
     
     0.3,  1.0,  1.2, 1.0,    1.0, 1.0, 0.1,  // Node 4
     0.3, -1.0,  1.0, 1.0,    1.0, 1.0, 0.1,  // Node 7
     0.3, -1.0, -1.0, 1.0,    1.0, 1.0, 0.1,  // Node 3

    // +y face: 
    -0.3,  1.0, -1.2, 1.0,    1.0, 0.8, 0.0,  // Node 1
    -0.3,  1.0,  1.2, 1.0,    1.0, 0.8, 0.0,  // Node 5
     0.3,  1.0,  1.2, 1.0,    1.0, 0.8, 0.0,  // Node 4

     0.3,  1.0,  1.2, 1.0,    1.0, 0.8, 0.1,  // Node 4
     0.3,  1.0, -1.2, 1.0,    1.0, 0.8, 0.1,  // Node 2 
    -0.3,  1.0, -1.2, 1.0,    1.0, 0.8, 0.1,  // Node 1

    // +z face: 
    -0.3,  1.0,  1.2, 1.0,    1.0, 0.8, 0.0,  // Node 5
    -0.3, -1.0,  1.0, 1.0,    1.0, 0.8, 0.0,  // Node 6
     0.3, -1.0,  1.0, 1.0,    1.0, 0.8, 0.0,  // Node 7

     0.3, -1.0,  1.0, 1.0,    1.0, 0.8, 0.1,  // Node 7
     0.3,  1.0,  1.2, 1.0,    1.0, 0.8, 0.1,  // Node 4
    -0.3,  1.0,  1.2, 1.0,    1.0, 0.8, 0.1,  // Node 5

    // -x face: 
    -0.3, -1.0,  1.0, 1.0,    1.0, 1.0, 0.0,  // Node 6 
    -0.3,  1.0,  1.2, 1.0,    1.0, 1.0, 0.0,  // Node 5 
    -0.3,  1.0, -1.2, 1.0,    1.0, 1.0, 0.0,  // Node 1
    
    -0.3,  1.0, -1.2, 1.0,    1.0, 1.0, 0.1,  // Node 1
    -0.3, -1.0, -1.0, 1.0,    1.0, 1.0, 0.1,  // Node 0  
    -0.3, -1.0,  1.0, 1.0,    1.0, 1.0, 0.1,  // Node 6  
    
    // -y face: 
     0.3, -1.0, -1.0, 1.0,    1.0, 0.8, 0.0,  // Node 3
     0.3, -1.0,  1.0, 1.0,    1.0, 0.8, 0.0,  // Node 7
    -0.3, -1.0,  1.0, 1.0,    1.0, 0.8, 0.0,  // Node 6

    -0.3, -1.0,  1.0, 1.0,    1.0, 0.8, 0.1,  // Node 6
    -0.3, -1.0, -1.0, 1.0,    1.0, 0.8, 0.1,  // Node 0
     0.3, -1.0, -1.0, 1.0,    1.0, 0.8, 0.1,  // Node 3

     // -z face: 
     0.3,  1.0, -1.2, 1.0,    1.0, 0.8, 0.0,  // Node 2
     0.3, -1.0, -1.0, 1.0,    1.0, 0.8, 0.0,  // Node 3
    -0.3, -1.0, -1.0, 1.0,    1.0, 0.8, 0.0,  // Node 0   

    -0.3, -1.0, -1.0, 1.0,    1.0, 0.8, 0.1,  // Node 0
    -0.3,  1.0, -1.2, 1.0,    1.0, 0.8, 0.1,  // Node 1
     0.3,  1.0, -1.2, 1.0,    1.0, 0.8, 0.1,  // Node 2

     // SpongeBob's Body
     // +x face: 
     0.3, -1.0, -1.0, 1.0,    0.59, 0.29, 0.0,  // Node 3
     0.3,  1.0, -1.0, 1.0,    1.0, 1.0, 1.0,    // Node 2
     0.3,  1.0,  1.0, 1.0,    1.0, 1.0, 1.0,    // Node 4
     
     0.3,  1.0,  1.0, 1.0,    1.0, 1.0, 1.0,    // Node 4
     0.3, -1.0,  1.0, 1.0,    0.59, 0.29, 0.1,  // Node 7
     0.3, -1.0, -1.0, 1.0,    0.59, 0.29, 0.1,  // Node 3

    // +y face:
    -0.3,  1.0, -1.0, 1.0,    1.0, 1.0, 1.0,  // Node 1
    -0.3,  1.0,  1.0, 1.0,    1.0, 1.0, 1.0,  // Node 5
     0.3,  1.0,  1.0, 1.0,    1.0, 1.0, 1.0,  // Node 4

     0.3,  1.0,  1.0, 1.0,    1.0, 1.0, 1.0,    // Node 4
     0.3,  1.0, -1.0, 1.0,    1.0, 1.0, 1.0,    // Node 2 
    -0.3,  1.0, -1.0, 1.0,    0.59, 0.29, 0.1,  // Node 1

    // +z face:
    -0.3,  1.0,  1.0, 1.0,    1.0, 1.0, 1.0,    // Node 5
    -0.3, -1.0,  1.0, 1.0,    0.59, 0.29, 0.0,  // Node 6
     0.3, -1.0,  1.0, 1.0,    0.59, 0.29, 0.1,  // Node 7

     0.3, -1.0,  1.0, 1.0,    0.59, 0.29, 0.1,  // Node 7
     0.3,  1.0,  1.0, 1.0,    1.0, 1.0, 1.0,    // Node 4
    -0.3,  1.0,  1.0, 1.0,    1.0, 1.0, 1.0,    // Node 5

    // -x face:
    -0.3, -1.0,  1.0, 1.0,    0.59, 0.29, 0.0,  // Node 6 
    -0.3,  1.0,  1.0, 1.0,    1.0, 1.0, 1.0,    // Node 5 
    -0.3,  1.0, -1.0, 1.0,    1.0, 1.0, 1.0,    // Node 1
    
    -0.3,  1.0, -1.0, 1.0,    1.0, 1.0, 1.0,    // Node 1
    -0.3, -1.0, -1.0, 1.0,    0.59, 0.29, 0.1,  // Node 0  
    -0.3, -1.0,  1.0, 1.0,    0.59, 0.29, 0.1,  // Node 6  
    
    // -y face: 
     0.3, -1.0, -1.0, 1.0,    0.59, 0.29, 0.0,  // Node 3
     0.3, -1.0,  1.0, 1.0,    0.59, 0.29, 0.0,  // Node 7
    -0.3, -1.0,  1.0, 1.0,    0.59, 0.29, 0.0,  // Node 6

    -0.3, -1.0,  1.0, 1.0,    0.59, 0.29, 0.1,  // Node 6
    -0.3, -1.0, -1.0, 1.0,    0.59, 0.29, 0.1,  // Node 0
     0.3, -1.0, -1.0, 1.0,    0.59, 0.29, 0.1,  // Node 3

     // -z face:
     0.3,  1.0, -1.0, 1.0,    1.0, 1.0, 1.0,    // Node 2
     0.3, -1.0, -1.0, 1.0,    0.59, 0.29, 0.0,  // Node 3
    -0.3, -1.0, -1.0, 1.0,    0.59, 0.29, 0.0,  // Node 0   

    -0.3, -1.0, -1.0, 1.0,    0.59, 0.29, 0.1,  // Node 0
    -0.3,  1.0, -1.0, 1.0,    1.0, 1.0, 1.0,    // Node 1
     0.3,  1.0, -1.0, 1.0,    1.0, 1.0, 1.0,    // Node 2


    // Patrick's Hand
    // +x face:
     0.3, -0.5, -1.0, 1.0,    1.0, 1.0, 0.0,  // Node 3
     0.3,  0.5, -1.0, 1.0,    1.0, 1.0, 0.0,  // Node 2
     0.3,  0.5,  1.0, 1.0,    1.0, 1.0, 0.0,  // Node 4
    
     0.3,  0.5,  1.0, 1.0,    1.0, 1.0, 0.1,  // Node 4
     0.3, -0.5,  1.0, 1.0,    1.0, 1.0, 0.1,  // Node 7
     0.3, -0.5, -1.0, 1.0,    1.0, 1.0, 0.1,  // Node 3

    // +y face:
    -0.3,  0.5, -1.0, 1.0,    1.0, 0.8, 0.0,  // Node 1
    -0.3,  0.5,  1.0, 1.0,    1.0, 0.8, 0.0,  // Node 5
     0.3,  0.5,  1.0, 1.0,    1.0, 0.8, 0.0,  // Node 4

     0.3,  0.5,  1.0, 1.0,    1.0, 0.8, 0.1,  // Node 4
     0.3,  0.5, -1.0, 1.0,    1.0, 0.8, 0.1,  // Node 2 
    -0.3,  0.5, -1.0, 1.0,    1.0, 0.8, 0.1,  // Node 1

    // +z face: 
    -0.3,  0.5,  1.0, 1.0,    1.0, 0.8, 0.0,  // Node 5
    -0.3, -0.5,  1.0, 1.0,    1.0, 0.8, 0.0,  // Node 6
     0.3, -0.5,  1.0, 1.0,    1.0, 0.8, 0.0,  // Node 7

     0.3, -0.5,  1.0, 1.0,    1.0, 0.8, 0.1,  // Node 7
     0.3,  0.5,  1.0, 1.0,    1.0, 0.8, 0.1,  // Node 4
    -0.3,  0.5,  1.0, 1.0,    1.0, 0.8, 0.1,  // Node 5

    -0.3, -0.5,  1.0, 1.0,    0.85,0.2, 0.53,  // Node 6 
    -0.3,  0.5,  1.0, 1.0,    0.85,0.2, 0.53,  // Node 5 
    -0.3,  0.5, -1.0, 1.0,    0.85,0.2, 0.53,  // Node 1
    
    -0.3,  0.5, -1.0, 1.0,    0.85,0.2, 0.53,   // Node 1
    -0.3, -0.5, -1.0, 1.0,    0.85, 0.2, 0.53,  // Node 0  
    -0.3, -0.5,  1.0, 1.0,    0.85, 0.2, 0.53,  // Node 6  
    
    // -y face: 
     0.3, -0.5, -1.0, 1.0,    0.85, 0.2, 0.53,  // Node 3
     0.3, -0.5,  1.0, 1.0,    0.85, 0.2, 0.53,  // Node 7
    -0.3, -0.5,  1.0, 1.0,    0.85, 0.2, 0.53,  // Node 6

    -0.3, -0.5,  1.0, 1.0,    0.85, 0.2, 0.53,   // Node 6
    -0.3, -0.5, -1.0, 1.0,    0.85, 0.2, 0.53,   // Node 0
     0.3, -0.5, -1.0, 1.0,    0.85, 0.2, 0.53,   // Node 3

     // -z face:
     0.3,  0.5, -1.0, 1.0,    0.85, 0.2, 0.53,   // Node 2
     0.3, -0.5, -1.0, 1.0,    0.85, 0.2, 0.53,   // Node 3
    -0.3, -0.5, -1.0, 1.0,    0.85, 0.2, 0.53,   // Node 0   

    -0.3, -0.5, -1.0, 1.0,    0.85, 0.2, 0.53,   // Node 0
    -0.3,  0.5, -1.0, 1.0,    0.85, 0.2, 0.53,   // Node 1
     0.3,  0.5, -1.0, 1.0,    0.85, 0.2, 0.53,   // Node 2

     0.0,   0.0, sq2, 1.0,    0.93,  0.23,  0.51,  // Node 0
     c30, -0.5, 0.0, 1.0,     0.85,  0.2,  0.53,  // Node 1
     0.0,  1.0, 0.0, 1.0,     0.28,  0.02,  0.03,  // Node 2
      // Face 1: (right side)
     0.0,  0.0, sq2, 1.0,     0.93,  0.23,  0.51,  // Node 0
     0.0,  1.0, 0.0, 1.0,     0.28,  0.02,  0.03, // Node 2
    -c30, -0.5, 0.0, 1.0,     0.28,  0.02,  0.03,  // Node 3
      // Face 2: (lower side)
     0.0,  0.0, sq2, 1.0,     0.93,  0.23,  0.51,  // Node 0 
    -c30, -0.5, 0.0, 1.0,     0.28,  0.02,  0.03, // Node 3
     c30, -0.5, 0.0, 1.0,     0.85,  0.2,  0.53, // Node 1 
      // Face 3: (base side)  
    -c30, -0.5,  0.0, 1.0,   0.28,  0.02,  0.03,  // Node 3
     0.0,  1.0,  0.0, 1.0,   0.28,  0.02,  0.03,  // Node 2
     c30, -0.5,  0.0, 1.0,   0.85,  0.2,  0.53// Node 1
  ]);

  for(j=0; j< pointsShapes.length; i++, j++) {
    colorShapes[i] = pointsShapes[j];
    }

  // Create a buffer object
  var shapeBufferHandle = gl.createBuffer();  
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }

  // Bind the the buffer object to target:
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  // Transfer data from Javascript array colorShapes to Graphics system VBO
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; 
    
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  gl.vertexAttribPointer(
      a_Position,   
      4,            
      gl.FLOAT,     
      false,        
      FSIZE * 7,    
      0);   

  gl.enableVertexAttribArray(a_Position);  

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }

  gl.vertexAttribPointer(
    a_Color,        
    3,              
    gl.FLOAT,       
    false,          
    FSIZE * 7,      
    FSIZE * 4);    

  gl.enableVertexAttribArray(a_Color);  
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return nn;
}


function makeSphere(){

  var slices = 13;    
  var sliceVerts  = 27; 
  var topColr = new Float32Array([0.7, 0.7, 0.7]);  // North Pole
  var equColr = new Float32Array([0.3, 0.7, 0.3]);  // Equator
  var botColr = new Float32Array([0.9, 0.9, 0.9]);  // South Pole
  var sliceAngle = Math.PI/slices;  
  sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);

  var cos0 = 0.0;       
  var sin0 = 0.0;
  var cos1 = 0.0;
  var sin1 = 0.0; 
  var j = 0;              
  var isLast = 0;
  var isFirst = 1;
  for(s=0; s<slices; s++) { 
    if(s==0) {
      isFirst = 1;  
      cos0 = 1.0;   
      sin0 = 0.0;
    }
    else {         
      isFirst = 0;  
      cos0 = cos1;
      sin0 = sin1;
    }              
    cos1 = Math.cos((s+1)*sliceAngle);
    sin1 = Math.sin((s+1)*sliceAngle);
  
    if(s==slices-1) isLast=1; 
    for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) { 
      if(v%2==0)
      {      
        sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts);  
        sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);  
        sphVerts[j+2] = cos0;   
        sphVerts[j+3] = 1.0;      
      }
      else { 
        sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);    // x
        sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);    // y
        sphVerts[j+2] = cos1;                                         // z
        sphVerts[j+3] = 1.0;                                          // w.   
      }
      if(s==0) { 
        sphVerts[j+4]=topColr[0]; 
        sphVerts[j+5]=topColr[1]; 
        sphVerts[j+6]=topColr[2]; 
        }
      else if(s==slices-1) {
        sphVerts[j+4]=botColr[0]; 
        sphVerts[j+5]=botColr[1]; 
        sphVerts[j+6]=botColr[2]; 
      }
      else {
          sphVerts[j+4]=0.99; 
          sphVerts[j+5]=0.76; 
          sphVerts[j+6]=0.8;         
      }
    }
  }
}

function makeSpongeEye(){

  var slices = 13;
  var sliceVerts  = 27; 
  var topColr = new Float32Array([0.13, 0.67, 0.8]);  // North Pole: sky blue
  var equColr = new Float32Array([0.3, 0.7, 0.3]);  // Equator: bright green
  var botColr = new Float32Array([0.13, 0.67, 0.8]);  // South Pole: sky blue
  var sliceAngle = Math.PI/slices; 

  sph2Verts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);

  var cos0 = 0.0;        
  var sin0 = 0.0;
  var cos1 = 0.0;
  var sin1 = 0.0; 
  var j = 0;             
  var isLast = 0;
  var isFirst = 1;
  for(s=0; s<slices; s++) { 
    if(s==0) {
      isFirst = 1;  // skip 1st vertex of 1st slice.
      cos0 = 1.0;   // initialize: start at north pole.
      sin0 = 0.0;
    }
    else {        
      cos0 = cos1;
      sin0 = sin1;
    }             
    cos1 = Math.cos((s+1)*sliceAngle);
    sin1 = Math.sin((s+1)*sliceAngle);
    if(s==slices-1) isLast=1; // skip last vertex of last slice.
    for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) { 
      if(v%2==0)
      {     
        sph2Verts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts);  
        sph2Verts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);  
        sph2Verts[j+2] = cos0;   
        sph2Verts[j+3] = 1.0;      
      }
      else {  
        sph2Verts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);    // x
        sph2Verts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);    // y
        sph2Verts[j+2] = cos1;                                         // z
        sph2Verts[j+3] = 1.0;                                          // w.   
      }
      if(s==0) {  
        sph2Verts[j+4]=topColr[0]; 
        sph2Verts[j+5]=topColr[1]; 
        sph2Verts[j+6]=topColr[2]; 
        }
      else if(s==slices-1) {
        sph2Verts[j+4]=botColr[0]; 
        sph2Verts[j+5]=botColr[1]; 
        sph2Verts[j+6]=botColr[2]; 
      }
      else {
          sph2Verts[j+4]=1.0;
          sph2Verts[j+5]=1.0;
          sph2Verts[j+6]=1.0;        
      }
    }
  }
}


function makePatrickHead() {

 var ctrColr = new Float32Array([0.99, 0.76, 0.8]); // light pink
 var topColr = new Float32Array([0.99, 0.76, 0.8]); // light pink
 var botColr = new Float32Array([0.98, 0.38, 0.5]); // dark pink
 var capVerts = 16; 
 var botRadius = 2.4;  
 
 cylVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);

  for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {  
    if(v%2==0)
    {      
      cylVerts[j  ] = 0.0;      // x,y,z,w == 0,0,1,1
      cylVerts[j+1] = 0.0;  
      cylVerts[j+2] = 4.0; 
      cylVerts[j+3] = 1.0;      // r,g,b = topColr[]
      cylVerts[j+4]=ctrColr[0]; 
      cylVerts[j+5]=ctrColr[1]; 
      cylVerts[j+6]=ctrColr[2];
    }
    else { 
      cylVerts[j  ] = 0.0;      // x,y,z,w == 0,0,1,1
      cylVerts[j+1] = 0.0;  
      cylVerts[j+1] = 0.0;  
      cylVerts[j+2] = 4.0;  // z
      cylVerts[j+3] = 1.0;  // w.
      cylVerts[j+4]=topColr[0]; 
      cylVerts[j+5]=topColr[1]; 
      cylVerts[j+6]=topColr[2];     
    }
  }
  // Create the cylinder side walls, made of 2*capVerts vertices.
  // v counts vertices within the wall; j continues to count array elements
  for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
    if(v%2==0)  // position all even# vertices along top cap:
    {   
      cylVerts[j  ] = 0.0;      // x,y,z,w == 0,0,1,1
      cylVerts[j+1] = 0.0;  
      cylVerts[j+2] = 4.0;  // z
      cylVerts[j+3] = 1.0;  // w.
      cylVerts[j+4]=topColr[0]; 
      cylVerts[j+5]=topColr[1]; 
      cylVerts[j+6]=topColr[2];     
    }
    else    
    {
        cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);   // x
        cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);   // y
        cylVerts[j+2] =-4.0;  // z
        cylVerts[j+3] = 1.0;  // w.
        cylVerts[j+4]=botColr[0]; 
        cylVerts[j+5]=botColr[1]; 
        cylVerts[j+6]=botColr[2];     
    }
  }
  // Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
  // v counts the vertices in the cap; j continues to count array elements
  for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
    if(v%2==0) {  
      cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);   // x
      cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);   // y
      cylVerts[j+2] =-4.0;  // z
      cylVerts[j+3] = 1.0;  // w.
      cylVerts[j+4]=botColr[0]; 
      cylVerts[j+5]=botColr[1]; 
      cylVerts[j+6]=botColr[2];   
    }
    else {       
      cylVerts[j  ] = 0.0;      // x,y,z,w == 0,0,-1,1
      cylVerts[j+1] = 0.0;  
      cylVerts[j+2] =-4.0; 
      cylVerts[j+3] = 1.0;      // r,g,b = botColr[]
      cylVerts[j+4]=botColr[0]; 
      cylVerts[j+5]=botColr[1]; 
      cylVerts[j+6]=botColr[2];
    }
  }
}


function makePatrickBody() {

 var ctrColr = new Float32Array([0.2, 0.2, 0.2]); // dark gray
 var topColr = new Float32Array([0.53, 0.15, 0.34]); // light green
 var botColr = new Float32Array([0.84, 0.04, 0.33]); // light blue
 var capVerts = 16; // # of vertices around the topmost 'cap' of the shape
 var botRadius = 1.6;   // radius of bottom of cylinder (top always 1.0)
 
 cyl2Verts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
                    // # of vertices * # of elements needed to store them. 

  // Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
  // v counts vertices: j counts array elements (vertices * elements per vertex)
  for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {  
    // skip the first vertex--not needed.
    if(v%2==0)
    {       // put even# vertices at center of cylinder's top cap:
      cyl2Verts[j  ] = 0.0;      // x,y,z,w == 0,0,1,1
      cyl2Verts[j+1] = 0.0;  
      cyl2Verts[j+2] = 1.0; 
      cyl2Verts[j+3] = 1.0;      // r,g,b = topColr[]
      cyl2Verts[j+4]=ctrColr[0]; 
      cyl2Verts[j+5]=ctrColr[1]; 
      cyl2Verts[j+6]=ctrColr[2];
    }
    else { 
      cyl2Verts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);     // x
      cyl2Verts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);     // y
      cyl2Verts[j+2] = 1.0;  // z
      cyl2Verts[j+3] = 1.0;  // w.
      cyl2Verts[j+4]=topColr[0]; 
      cyl2Verts[j+5]=topColr[1]; 
      cyl2Verts[j+6]=topColr[2];     
    }
  }
  // Create the cylinder side walls, made of 2*capVerts vertices.
  // v counts vertices within the wall; j continues to count array elements
  for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
    if(v%2==0)  // position all even# vertices along top cap:
    {   
        cyl2Verts[j  ] = Math.cos(Math.PI*(v)/capVerts);   // x
        cyl2Verts[j+1] = Math.sin(Math.PI*(v)/capVerts);   // y
        cyl2Verts[j+2] = 1.0;  // z
        cyl2Verts[j+3] = 1.0;  // w.
        // r,g,b = topColr[]
        cyl2Verts[j+4]=topColr[0]; 
        cyl2Verts[j+5]=topColr[1]; 
        cyl2Verts[j+6]=topColr[2];     
    }
    else    // position all odd# vertices along the bottom cap:
    {
        cyl2Verts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);   // x
        cyl2Verts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);   // y
        cyl2Verts[j+2] =-1.0;  // z
        cyl2Verts[j+3] = 1.0;  // w.
        // r,g,b = topColr[]
        cyl2Verts[j+4]=botColr[0]; 
        cyl2Verts[j+5]=botColr[1]; 
        cyl2Verts[j+6]=botColr[2];     
    }
  }
  // Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
  // v counts the vertices in the cap; j continues to count array elements
  for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
    if(v%2==0) {  // position even #'d vertices around bot cap's outer edge
      cyl2Verts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);   // x
      cyl2Verts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);   // y
      cyl2Verts[j+2] =-1.0;  // z
      cyl2Verts[j+3] = 1.0;  // w.
      // r,g,b = topColr[]
      cyl2Verts[j+4]=botColr[0]; 
      cyl2Verts[j+5]=botColr[1]; 
      cyl2Verts[j+6]=botColr[2];   
    }
    else {        // position odd#'d vertices at center of the bottom cap:
      cyl2Verts[j  ] = 0.0;      // x,y,z,w == 0,0,-1,1
      cyl2Verts[j+1] = 0.0;  
      cyl2Verts[j+2] =-1.0; 
      cyl2Verts[j+3] = 1.0;      // r,g,b = botColr[]
      cyl2Verts[j+4]=botColr[0]; 
      cyl2Verts[j+5]=botColr[1]; 
      cyl2Verts[j+6]=botColr[2];
    }
  }
}

function makeTorus() {

var rbend = 1.0;                    // Radius of circle formed by torus' bent bar
var rbar = 0.5;                     // radius of the bar we bent to form torus
var barSlices = 23;                 // # of bar-segments in the torus: >=3 req'd;
var barSides = 13;                    // # of sides of the bar (and thus the 

torVerts = new Float32Array(floatsPerVertex*(2*barSides*barSlices +2));
changable_color = (currentAngle+45)/90;

var phi=0, theta=0;                   // begin torus at angles 0,0
var thetaStep = 2*Math.PI/barSlices;  // theta angle between each bar segment
var phiHalfStep = Math.PI/barSides;  
for(s=0,j=0; s<barSlices; s++) {    // for each 'slice' or 'ring' of the torus:
    for(v=0; v< 2*barSides; v++, j+=7) {    // for each vertex in this slice:
      if(v%2==0)  { // even #'d vertices at bottom of slice,
        torVerts[j  ] = (rbend + rbar*Math.cos((v)*phiHalfStep)) * 
                                             Math.cos((s)*thetaStep);
        torVerts[j+1] = (rbend + rbar*Math.cos((v)*phiHalfStep)) *
                                             Math.sin((s)*thetaStep);
        torVerts[j+2] = -rbar*Math.sin((v)*phiHalfStep);
        torVerts[j+3] = 1.0;    // w
      }
      else {        
        torVerts[j  ] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) * 
                                             Math.cos((s+1)*thetaStep);
        torVerts[j+1] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) *
                                             Math.sin((s+1)*thetaStep);
        torVerts[j+2] = -rbar*Math.sin((v-1)*phiHalfStep);
        torVerts[j+3] = 1.0;    // w
      }
      torVerts[j+4] = changable_color; 
      torVerts[j+5] = 0.3;    
      torVerts[j+6] = changable_color/3;    
    }
  }
      torVerts[j  ] = rbend + rbar; // copy vertex zero;
      torVerts[j+1] = 0.0;
      torVerts[j+2] = 0.0;
      torVerts[j+3] = 1.0;    // w
      torVerts[j+4] = changable_color; 
      torVerts[j+5] = 0.3;    
      torVerts[j+6] = changable_color/3;   
      j+=7; // go to next vertex:
      torVerts[j  ] = (rbend + rbar) * Math.cos(thetaStep);
      torVerts[j+1] = (rbend + rbar) * Math.sin(thetaStep);
      torVerts[j+2] = 0.0;
      torVerts[j+3] = 1.0;    // w
      torVerts[j+4] = changable_color; 
      torVerts[j+5] = 0.0;    
      torVerts[j+6] = changable_color/3;   

}


function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix, pos_x, pos_y, pos_z) {
  // Clear <canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  //DRAW SPONGEBOB'S HEAD
  modelMatrix.setTranslate(pos_x, pos_y, pos_z);  
  pushMatrix(modelMatrix);
  modelMatrix.rotate(90,0,1,0);
  modelMatrix.scale(1,1,-1);             
  modelMatrix.scale(0.1, 0.3, 0.26);
  modelMatrix.rotate(currentAngle/1.5, 0, 1, 0);  

  var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
  modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex,36);

  
  //DRAW SPONGEBOB'S BODY
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.0,-0.405, 0.0);
  modelMatrix.scale(1,1,-1);
  modelMatrix.scale(0.85, 0.1, 0.05);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex+36,36);


  //DRAW SPONGEBOB'S BUTTON
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(-0.01, -0.35, 0.0);
  modelMatrix.scale(1,1,-1);
  modelMatrix.scale(0.03, 0.05, 1);
  modelMatrix.rotate(135, 1, 1, 1);
  modelMatrix.rotate(83,0,1,0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                torStart/floatsPerVertex, // start at this vertex number, and
                torVerts.length/floatsPerVertex); // draw this 


  //DRAW SPONGEBOB'S LEFT_ARM
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(-0.30, -0.40, 0.0);
  modelMatrix.scale(0.05,0.05,0.1);
  modelMatrix.translate(0.8, 0.3, 0.20);
  modelMatrix.rotate(270-currentAngle,0.5,0,1);
  modelMatrix.translate(0.0,-0.8, 0.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex,36);


  //DRAW SPONGEBOB'S LEFT_HAND
  modelMatrix.translate(-0.8,-1.8,0.0);
  modelMatrix.rotate(-45,0,0,1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex,36);


  //DRAW SPONGEBOB'S RIGHT_ARM
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.3, -0.40, 0.4);
  modelMatrix.scale(0.05,0.05,0.1);
  modelMatrix.translate(-0.8, 0.3, 0.20);
  modelMatrix.rotate(270+currentAngle,0.5,0,1);
  modelMatrix.translate(0.0, 1, 0.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex,36);

  
  //DRAW SPONGEBOB'S RIGHT_HAND
  modelMatrix.translate(-0.8, 1.8, 0.0);
  modelMatrix.rotate(45,0,0,1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex,36);


  //DRAW SPONGEBOB'S LEFT_LEG
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(-0.1, -0.58, 0.0);
  modelMatrix.scale(1,1,-1); 
  modelMatrix.scale(0.015, 0.15, 0.05);
  modelMatrix.rotate(90, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex,36);


  //DRAW SPONGEBOB'S RIGHT_LEG
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.10, -0.58, 0.0);
  modelMatrix.scale(1,1,-1);
  modelMatrix.scale(0.015, 0.15, 0.05);
  modelMatrix.rotate(90, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex,36);


  //DRAW SPONGEBOB'S LEFT_LEG
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(-0.1, -0.58, 0.0);
  modelMatrix.scale(1,1,-1); 
  modelMatrix.scale(0.015, 0.15, 0.05);
  modelMatrix.rotate(90, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex,36);


  //DRAW SPONGEBOB'S RIGHT_LEG
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.10, -0.58, 0.0);
  modelMatrix.scale(1,1,-1);
  modelMatrix.scale(0.015, 0.15, 0.05);
  modelMatrix.rotate(90, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex,36);

  
  //DRAW SPONGEBOB'S LEFT FOOT
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(-0.1, -0.7, 0.0);
  modelMatrix.scale(1,1,-1);
  modelMatrix.scale(0.03, 0.05, 1);
  modelMatrix.rotate(currentAngle, 0, 1, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                torStart/floatsPerVertex, // start at this vertex number, and
                torVerts.length/floatsPerVertex); // draw this 


  //DRAW SPONGEBOB'S RIGHT FOOT
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.1, -0.7, 0.0); 
  modelMatrix.scale(1,1,-1); 
  modelMatrix.scale(0.03, 0.05, 1);
  modelMatrix.rotate(currentAngle, 0, 1, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                torStart/floatsPerVertex, // start at this vertex number, and
                torVerts.length/floatsPerVertex); // draw this 


  //DRAW SPONGEBOB'S EYES
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate( -0.05, 0.0, 0.0);
  modelMatrix.scale(0.08, 0.08, 0.3);
  modelMatrix.rotate(-currentAngle/2, 0, 1, 0); 
  modelMatrix.translate(-0.75,0.4,0); 
  var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
  modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                sph2Start/floatsPerVertex, // start at this vertex number, and 
                sph2Verts.length/floatsPerVertex); // draw this many vertices.

  modelMatrix = popMatrix();
  modelMatrix.translate( 0.05, 0.0, 0.0);
  modelMatrix.scale(0.08, 0.08, 0.3);
  modelMatrix.rotate(-currentAngle/2, 0, 1, 0); 
  modelMatrix.translate(0.75,0.4,0); 
  var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
  modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                sph2Start/floatsPerVertex, // start at this vertex number, and 
                sph2Verts.length/floatsPerVertex);


  //DRAW PATRICK'S HEAD
  modelMatrix.setTranslate(numX+0.5, numY+0.0, 0.3);
  pushMatrix(modelMatrix);
  modelMatrix.rotate(-90,1,0,0);
  modelMatrix.scale(0.1, 0.1, 0.1);
  modelMatrix.rotate(currentAngle/8, 1, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                cylStart/floatsPerVertex, // start at this vertex number, and
                cylVerts.length/floatsPerVertex); // draw this many vertices.


  //DRAW PATRICK'S BODY
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.0, -0.75, 0.4);
  modelMatrix.rotate(90,1,0,0);
  modelMatrix.scale(0.12, 0.1, 0.1);
  modelMatrix.translate(0,0,-3);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                cyl2Start/floatsPerVertex, // start at this vertex number, and
                cyl2Verts.length/floatsPerVertex); // draw this many vertices.


  //DRAW PATRICK'S EYES
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate( -0.02, -0.13, 0.0);
  modelMatrix.scale(0.05+(currentAngle+45)/2000, 0.09+(currentAngle+45)/2000, 0.3);
  modelMatrix.rotate(-currentAngle/2, 0, 0, 1); 
  modelMatrix.translate(-0.75,0.4,0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                sphStart/floatsPerVertex, // start at this vertex number, and 
                sphVerts.length/floatsPerVertex); // draw this many vertices.

  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate( 0.02, -0.13, 0.0);
  modelMatrix.scale(0.05+(currentAngle+45)/2000, 0.09+(currentAngle+45)/2000, 0.3);
  modelMatrix.rotate(-currentAngle/2, 0, 0, 1); 
  modelMatrix.translate(0.75,0.4,0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                sphStart/floatsPerVertex, // start at this vertex number, and 
                sphVerts.length/floatsPerVertex);


  //DRAW PATRICK'S LEFT HAND
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(-0.18, -0.48, 0.6);
  modelMatrix.scale(0.05,0.05,0.1);
  modelMatrix.translate(0.8, 0.3, 0.20);
  modelMatrix.rotate(270-currentAngle,0.1,0,1);
  modelMatrix.translate(0.0,-0.8, 0.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex+72,36);

  modelMatrix.translate(0.55,-1.0,0.0);
  modelMatrix.rotate(40,0,0,1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex+72,36);


  //DRAW PATRICK'S RIGHT HAND
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.095, -0.48, 0.6);
  modelMatrix.scale(0.05,0.05,0.1);
  modelMatrix.translate(0.8, 0.3, 0.20);
  modelMatrix.rotate(270+currentAngle,0.1,0,1);
  modelMatrix.translate(0.0,0.8, 0.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex+72,36);

  modelMatrix.translate(0.5,0.9,0.0);
  modelMatrix.rotate(-40,0,0,1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, pointsStart/floatsPerVertex+72,36);


  //DRAW PATRICK'S LEGS
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate( -0.02, -0.58, 0.8);
  modelMatrix.scale(0.05, 0.1, 0.3);
  modelMatrix.rotate(90,1,0,0);
  modelMatrix.rotate(currentAngle/2, 1, 1, 1); 
  modelMatrix.translate(-0.75,0.4,0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                sphStart/floatsPerVertex, // start at this vertex number, and 
                sphVerts.length/floatsPerVertex); // draw this many vertices.

  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate( 0.02, -0.58, 0.8);
  modelMatrix.scale(0.05, 0.1, 0.3);
  modelMatrix.rotate(90,1,0,0);
  modelMatrix.rotate(currentAngle/2, 1, 1, 1); 
  modelMatrix.translate(0.75,0.4,0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                sphStart/floatsPerVertex, // start at this vertex number, and 
                sphVerts.length/floatsPerVertex);
}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();
 changable_angle = 1000;
function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  
  if(angle >  45.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  if(angle < -45.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
  var newAngle = angle + (ANGLE_STEP * elapsed) / changable_angle;
  return newAngle %= 360;
}

function clearDrag() {
// Called when user presses 'Clear' button in our webpage
  xMdragTot = 0.0;
  yMdragTot = 0.0;
  tempX1 = -0.3;
  tempY1 = 0.0;

}

//==================HTML Button Callbacks
function spinUp() {
  //ANGLE_STEP += 25; 
  changable_angle -=100;
}

function spinDown() {
 //ANGLE_STEP -= 25; 
   changable_angle +=100;
}

function runStop() {
  if(ANGLE_STEP*ANGLE_STEP > 1) {
    myTmp = ANGLE_STEP;
    ANGLE_STEP = 0;
  }
  else {
    ANGLE_STEP = myTmp;
  }
}


function myMouseDown(ev, gl, canvas) {
//==============================================================================
// Called when user PRESSES down any mouse button;
//                  (Which button?    console.log('ev.button='+ev.button);   )
//    ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//    pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

  // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
  
  // Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  /    // move origin to center of canvas and
               (canvas.width/2);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
  tempX1 = x;
  tempY1 = y;
  //isDrag = true;                      // set our mouse-dragging flag
  xMclik = x;                         // record where mouse-dragging began
  yMclik = y;
  isDrag = true;
};


function myMouseMove(ev, gl, canvas) {

  if(isDrag==false) return;       // IGNORE all mouse-moves except 'dragging'

  // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
  
  // Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  /    // move origin to center of canvas and
               (canvas.width/2);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);

  // find how far we dragged the mouse:
  xMdragTot += (x - xMclik);          // Accumulate change-in-mouse-position,&
  yMdragTot += (y - yMclik);
  xMclik = x;                         // Make next drag-measurement from here.
  yMclik = y;
};

function myMouseUp(currentAngle,n,modelMatrix,u_ModelMatrix,ev, gl, canvas) {

  // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
  
  // Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  /    // move origin to center of canvas and
               (canvas.width/2);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2); 
  tempX2 = x;
  tempY2 = y;

  if((tempX1 == tempX2) && (tempY1 == tempY2)){
    isDrag = false; 
    isclick = true;
   // myMouseClick (ev,gl,canvas, n, currentAngle, modelMatrix, u_ModelMatrix);  
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix, tempX1, tempY1, 0.0);
    //console.log("move!");    
  }else{
    isclick = false;
    isDrag = true;
  }

  xMdragTot += (x - xMclik);
  yMdragTot += (y - yMclik);
};

/*
function myMouseClick (ev,gl,canvas, n, currentAngle, modelMatrix, u_ModelMatrix) {
 //console.log(tempX1);
 //console.log(tempY1);
  draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix, tempX1, tempY1, 0.0);
    //console.log("move!");
}
*/

function myKeyDown(ev) {
  switch(ev.keyCode) { 
    case 37:    // left-arrow key
      console.log(' left-arrow.');
      numX = numX - 0.1;
      break;
    case 38:    // up-arrow key
      console.log('   up-arrow.');
      numY = numY + 0.1;
      break;
    case 39:    // right-arrow key
      console.log('right-arrow.');
      numX = numX + 0.1;
      break;
    case 40:    // down-arrow key
      console.log(' down-arrow.');
      numY = numY - 0.1;
      break;
    default:
      console.log('myKeyDown()--keycode=', ev.keyCode);
      break;
  }
}

function myKeyUp(ev) {
  console.log('myKeyUp()--keyCode='+ev.keyCode+' released.');
}

function myKeyPress(ev) {
  console.log('myKeyPress():keyCode='+ev.keyCode);
}