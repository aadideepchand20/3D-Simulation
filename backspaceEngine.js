//BACKSPACE ENGINE
//Give a 'div' an id of 'backspaceEngineHolder' and it will run within it
//Functions to compute dot products, cross products, matrix multiplication and more

//ENGINE VARIABLES
let engineHolder = document.createElement("div");
engineHolder.id = "backspaceEngineHolder"
document.body.appendChild(engineHolder);
let activeCanvas;
let activeCtx;
let rendering = false;
let canvases = [];
let queue = [];

let refreshRate = 100;
let fNear = 0.1;
let fFar = 1000;
let fov = 90;
let aspectratio;
let fovRad = 1/Math.tan(toRadians(fov/2));
let updateInterval;
let textureData, tw, th;
const cameraPos = {x:0 ,y: 0, z:0};

//ENGINE INITIALISATION ORDER
let loadingScreen = document.createElement("div");
loadingScreen.style = "display: block; position: absolute; top: 0; left: 0; z-index: 100; width: 100vw; height: 100vh; background-image: url('https://3D-Engine.aadideepchand.repl.co/BackspaceEngine.png'); background-repeat: no-repeat; background-position: center;"
engineHolder.appendChild(loadingScreen);
document.addEventListener("DOMContentLoaded", function(event) {
  setTimeout(function() {
    fadeOutAndCallback(loadingScreen, function(){
      loadingScreen.remove();
      var img = document.getElementById('myImage');
      var mcanvas = document.createElement('canvas');
      var mcontext = mcanvas.getContext('2d');
      mcontext.drawImage(img,0,0)
      textureData = mcontext.getImageData(0,0,img.width,img.height)
      tw = img.width; th = img.height;
      onStart();
      updateInterval = setInterval(callUpdate, refreshRate);
      callUpdate();
    })
  }, 2000)
});


//MISCELLANEOUS
function fadeOutAndCallback(image, callback){
	var opacity = 1;
	var timer = setInterval(function(){
		if(opacity < 0.1){
			clearInterval(timer);
			callback(); //this executes the callback function!
		}
		image.style.opacity = opacity;
		opacity -=  0.1;
	}, 50);
}

//ENGINE UTILITIES
function callUpdate () {
  onUpdate();
}
function createCanvas (width, height, canvasName) {
  if(rendering == true) {
    queue.push(function() {
      createCanvas(width, height, canvasName);
    })
    return;
  }
  myCanvas = document.createElement("canvas")
  myCanvas.width = width;
  myCanvas.height = height;
  myCtx = myCanvas.getContext("2d");
  myCtx.translate((width/2),(height/2));
  canvases.push({canvas: myCanvas, context: myCtx, name: canvasName});
}
function removeCanvas (canvasName) {
  if(rendering == true) {
    queue.push(function() {
      removeCanvas(canvasName);
    })
    return;
  }
  for(i=0; i<canvases.length; i++) {
    if(canvases[i].name == canvasName) {
      if(activeCanvas.name == canvasName) {
        activeCanvas = null;
        activeCtx = null;
      }
      canvases[i].canvas.remove();
      canvases.splice(i, 1);
    }
  }
}
async function getActiveCanvas () {
  return activeCanvas;
}
async function getActiveCanvasInfo() {
  if(activeCanvas != null) {
    for(j=0; j<canvases.length; j++) {
      if(canvases[j].canvas == activeCanvas) {
        return canvases[j];
      }
    }
  }
}
function removeActiveCanvas (canvasName) {
  
}
function setActiveCanvas (canvasName) {
  if(rendering == true) {
    queue.push(function() {
      setActiveCanvas(canvasName);
    })
    return;
  }
  for(i=0; i<canvases.length; i++) {
    if(canvases[i].name == canvasName) {
      if(activeCanvas != null) {
        activeCtx.save();
        getActiveCanvasInfo.context = activeCtx;
        activeCanvas.remove();
      }
      activeCanvas = canvases[i].canvas;
      activeCtx = canvases[i].context;
      activeCtx.restore();
      aspectratio = activeCanvas.height/activeCanvas.width;
      engineHolder.appendChild(activeCanvas);
    }
  }
}



//ANGLE UTILITIES
function toDegrees (angle) {
  return angle * (180 / Math.PI);
}
function toRadians (angle) {
  return angle * (Math.PI / 180);
}



//VECTOR UTILITIES
function addVector(vec1, vec2) {
  return {x: vec1.x+vec2.x, y: vec1.y+vec2.y, z: vec1.z+vec2.z}
}
function subtractVector(vec1, vec2) {
  return {x: vec1.x-vec2.x, y: vec1.y-vec2.y, z: vec1.z-vec2.z}
}
function multiplyVector(vec1, val) {
  return {x: vec1.x*val, y: vec1.y*val, z: vec1.z*val}
}
function divideVector(vec1, val) {
  return {x: vec1.x/val, y: vec1.y/val, z: vec1.z/val}
}
function dotProduct(vec1, vec2) {
  return (vec1.x*vec2.x)+(vec1.y*vec2.y)+(vec1.z*vec2.z);
}
function vectorLength(vec1) {
  return Math.sqrt(dotProduct(vec1,vec1));
}
function vectorNormalise(vec1) {
  var normaliser = vectorLength(vec1);
  return {x: vec1.x/normaliser, y: vec1.y/normaliser, z: vec1.z/normaliser};
}



//RENDERING UTILITIES
function clearScreen () {
  rendering = true;
  if(activeCtx) {
    activeCtx.clearRect(-(activeCanvas.width/2), -(activeCanvas.height/2), activeCanvas.width, activeCanvas.height);
  }
  rendering = false;
  if(queue.length > 0) {
    for(k=0;k<queue.length;k++) {
      queue[k]();
      queue.splice(k,1);
    }
  }
}
function lerp(a, b, num, total) {
  var p1 = (((total-1)-num)/(total-1)) * a
  var p2 = (num/(total-1)) * b
  return p1 + p2
}
//const lerp = (x, y, a) => Math.round(x * (1 - a) + y * a);
function drawTriangle (points, fill, lightMultiplier) {
  if(fill == 0) {
    var side1 = draw_line(points[0].x * (activeCanvas.width/2),points[0].y * (activeCanvas.height/2), points[1].x * (activeCanvas.width/2), points[1].y * (activeCanvas.height/2))
    var side2 = draw_line(points[1].x * (activeCanvas.width/2),points[1].y * (activeCanvas.height/2), points[2].x * (activeCanvas.width/2), points[2].y * (activeCanvas.height/2))
    var side3 = draw_line(points[2].x * (activeCanvas.width/2),points[2].y * (activeCanvas.height/2), points[0].x * (activeCanvas.width/2), points[0].y * (activeCanvas.height/2))
    var sides = [];
    for(i=0; i<side1.length; i++) {
      var r = lerp(points[0].r, points[1].r, i, side1.length) * lightMultiplier
      var g = lerp(points[0].g, points[1].g, i, side1.length) * lightMultiplier
      var b = lerp(points[0].b, points[1].b, i, side1.length) * lightMultiplier
      activeCtx.fillStyle = 'rgb('+r+','+g+','+b+')'
      activeCtx.fillRect(side1[i].x, side1[i].y, 1, 1)
      sides.push({x: side1[i].x, y: side1[i].y, r: r, g: g, b: b})
    }
    for(i=0; i<side2.length; i++) {
      var r = lerp(points[1].r, points[2].r, i, side2.length) * lightMultiplier
      var g = lerp(points[1].g, points[2].g, i, side2.length) * lightMultiplier
      var b = lerp(points[1].b, points[2].b, i, side2.length) * lightMultiplier
      activeCtx.fillStyle = 'rgb('+r+','+g+','+b+')'
      activeCtx.fillRect(side2[i].x, side2[i].y, 1, 1)
      sides.push({x: side2[i].x, y: side2[i].y, r: r, g: g, b: b})
    }
    for(i=0; i<side3.length; i++) {
      var r = lerp(points[2].r, points[0].r, i, side3.length) * lightMultiplier
      var g = lerp(points[2].g, points[0].g, i, side3.length) * lightMultiplier
      var b = lerp(points[2].b, points[0].b, i, side3.length) * lightMultiplier
      activeCtx.fillStyle = 'rgb('+r+','+g+','+b+')'
      activeCtx.fillRect(side3[i].x, side3[i].y, 1, 1)
      sides.push({x: side3[i].x, y: side3[i].y, r: r, g: g, b: b})
    }
    var maxh = Math.round(Math.max(points[0].y * (activeCanvas.height/2),points[1].y * (activeCanvas.height/2),points[2].y * (activeCanvas.height/2)));
    var minh = Math.round(Math.min(points[0].y * (activeCanvas.height/2),points[1].y * (activeCanvas.height/2),points[2].y * (activeCanvas.height/2)));
    var maxw = Math.round(Math.max(points[0].x * (activeCanvas.height/2),points[1].x * (activeCanvas.height/2),points[2].x * (activeCanvas.height/2)));
    var minw = Math.round(Math.min(points[0].x * (activeCanvas.height/2),points[1].x * (activeCanvas.height/2),points[2].x * (activeCanvas.height/2)));
    var r1, g1, b1;
    for(i=minh; i<maxh+1; i++) {
      var spoints = sides.filter(function( obj ) {
        return obj.y === i;
      }).map(function( obj ) {
        return {x: obj.x, y: obj.y, r: obj.r, g: obj.g, b: obj.b};
      }).sort(function(a , b) {
        return a.x - b.x;
      });
      var min = spoints[0];
      var max = spoints[spoints.length-1];
      for(k=min.x; k<max.x+1; k++) {
        r1 = lerp(min.r, max.r, k, min.x-max.x)
        g1 = lerp(min.g, max.g, k, min.x-max.x)
        b1 = lerp(min.b, max.b, k, min.x-max.x)
        var spoints2 = sides.filter(function( obj ) {
          return obj.x === k;
        }).map(function( obj ) {
          return {x: obj.x, y: obj.y, r: obj.r, g: obj.g, b: obj.b};
        }).sort(function(a , b) {
          return a.y - b.y;
        });
        var min1 = spoints2[0];
        var max1 = spoints2[spoints2.length-1];
        var r = ((lerp(min1.r, max1.r, k, min1.y-max1.y) + r1)/2) * lightMultiplier
        var g = ((lerp(min1.g, max1.g, k, min1.y-max1.y) + g1)/2) * lightMultiplier
        var b = ((lerp(min1.b, max1.b, k, min1.y-max1.y) + b1)/2) * lightMultiplier
        activeCtx.fillStyle = 'rgb('+r+','+g+','+b+')'
        activeCtx.fillRect(k, i, 1, 1)
      }
    }
    for(i=minw; i<maxw+1; i++) {
      var min = spoints[0];
      var max = spoints[spoints.length-1];
      for(k=min.x; k<max.x+1; k++) {
        r2 = lerp(min.r, max.r, k, min.x-max.x) * lightMultiplier
        g2 = lerp(min.g, max.g, k, min.x-max.x) * lightMultiplier
        b2 = lerp(min.b, max.b, k, min.x-max.x) * lightMultiplier
        activeCtx.fillStyle = 'rgb('+r+','+g+','+b+')'
        activeCtx.fillRect(k, i, 1, 1)
      }
    }
  } else if(fill == 1) {
    activeCtx.beginPath();
    activeCtx.moveTo(points[0].x * (activeCanvas.width/2), points[0].y * (activeCanvas.height/2));
    activeCtx.lineTo(points[1].x * (activeCanvas.width/2), points[1].y * (activeCanvas.height/2));
    activeCtx.lineTo(points[2].x * (activeCanvas.width/2), points[2].y * (activeCanvas.height/2));
    activeCtx.closePath();
    //Fills the triangle with the appropriate shade
    var fillColour = String("rgb(" + colour.r + "," + colour.g + "," + colour.b + ")");
    activeCtx.fillStyle = fillColour
    activeCtx.fill();
  }
}

function draw_line(x1, y1, x2, y2) {
  let linecoordinates = []
  // Iterators, counters required by algorithm
  let x, y, dx, dy, dx1, dy1, px, py, xe, ye, i;
  // Calculate line deltas
  dx = x2 - x1;
  dy = y2 - y1;
  // Create a positive copy of deltas (makes iterating easier)
  dx1 = Math.abs(dx);
  dy1 = Math.abs(dy);
  // Calculate error intervals for both axis
  px = 2 * dy1 - dx1;
  py = 2 * dx1 - dy1;
  // The line is X-axis dominant
  if (dy1 <= dx1) {
      // Line is drawn left to right
      if (dx >= 0) {
          x = x1; y = y1; xe = x2;
      } else { // Line is drawn right to left (swap ends)
          x = x2; y = y2; xe = x1;
      }
      linecoordinates.push({x: Math.round(x), y: Math.round(y)}); // Draw first pixel
      // Rasterize the line
      for (i = 0; x < xe; i++) {
          x = x + 1;
          // Deal with octants...
          if (px < 0) {
              px = px + 2 * dy1;
          } else {
              if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
                  y = y + 1;
              } else {
                  y = y - 1;
              }
              px = px + 2 * (dy1 - dx1);
          }
          // Draw pixel from line span at
          // currently rasterized position
          linecoordinates.push({x: Math.round(x), y: Math.round(y)});
      }
  } else { // The line is Y-axis dominant
      // Line is drawn bottom to top
      if (dy >= 0) {
          x = x1; y = y1; ye = y2;
      } else { // Line is drawn top to bottom
          x = x2; y = y2; ye = y1;
      }
      linecoordinates.push({x: Math.round(x), y: Math.round(y)}); // Draw first pixel
      // Rasterize the line
      for (i = 0; y < ye; i++) {
          y = y + 1;
          // Deal with octants...
          if (py <= 0) {
              py = py + 2 * dx1;
          } else {
              if ((dx < 0 && dy<0) || (dx > 0 && dy > 0)) {
                  x = x + 1;
              } else {
                  x = x - 1;
              }
              py = py + 2 * (dx1 - dy1);
          }
          // Draw pixel from line span at
          // currently rasterized position
          linecoordinates.push({x: Math.round(x), y: Math.round(y)});
      }
  }
  return linecoordinates;
}

function draw3DPolygon (points, angleVector, transformVector) {
  rendering = true;
  var i;
  var trianglesToDraw = [];
  if(typeof points === 'undefined') {
    return;
  }
  for(i=0; i<points.length; i++) {
    if(typeof points[i][0] === 'undefined' || typeof points[i][1] === 'undefined' || typeof points[i][2] === 'undefined') {
      continue;
    }
    var triPoints = [];
    for (j=0; j<points[i].length; j++) {
      //Applies all rotation matrices to the point
      var translatedTri = rotationYMatrix(rotationXMatrix(rotationZMatrix(points[i][j], angleVector.z), angleVector.x), angleVector.y);
      //Translates the points into view
      translatedTri = translatePoint(translatedTri, "x", transformVector.x);
      translatedTri = translatePoint(translatedTri, "y", transformVector.y);
      translatedTri = translatePoint(translatedTri, "z", transformVector.z);
      translatedTri = {x: translatedTri.x, y: translatedTri.y, z:translatedTri.z, r: points[i][j].r, g: points[i][j].g, b: points[i][j].b}
      //Adds the points to an array
      triPoints.push(translatedTri);
    }
    var normal = {x:0 ,y:0 ,z:0 };
    var line1 = {x:0 ,y:0 ,z:0 }; 
    var line2 = {x:0 ,y:0 ,z:0 };

    //Calculates line 1 vector
    line1 = subtractVector(triPoints[1], triPoints[0]);

    //Calculates line 2 vector
    line2 = subtractVector(triPoints[2], triPoints[0]);

    //Calculates normal
    normal.x = (line1.y * line2.z) - (line1.z * line2.y);
    normal.y = (line1.z * line2.x) - (line1.x * line2.z);
    normal.z = (line1.x * line2.y) - (line1.y * line2.x);

    //Normalises the normal
    normal = vectorNormalise(normal);

    //Checks if triangle is in view
    if((normal.x * (triPoints[0].x - cameraPos.x)) + 
        (normal.y * (triPoints[0].y - cameraPos.y)) + 
        (normal.z * (triPoints[0].z - cameraPos.z)) < 0){

      var directionalLight = {x: 0, y: 0, z: -1};
      
      //Normalises directional light
      directionalLight = vectorNormalise(directionalLight);

      //Checks similarity of the normal and light direction vectors by calculating dot product
      var dotproduct = dotProduct(normal, directionalLight);

      //Adjusts colour according to dot product
      var colour = getColour(dotproduct)

      //Applies perspective projection matrix to the points
      for(k=0; k<triPoints.length; k++) {
        var temp1 = triPoints[k].r;
        var temp2 = triPoints[k].g;
        var temp3 = triPoints[k].b
        var p = perspectiveprojectionMatrix(triPoints[k]);
        triPoints[k] = {x: p.x,y: p.y,z: p.z,r: temp1,g: temp2, b: temp3};
      } 
  
      triPoints.push(colour)
      trianglesToDraw.push(triPoints);
    }
  }

  //Painters Algorithm 
  trianglesToDraw.sort(function(a, b) {
    var aAvg = (a[0].z + a[1].z + a[2].z)/3;
    var bAvg = (b[0].z + b[1].z + b[2].z)/3
    return bAvg - aAvg;
  });
  for(j=0; j<trianglesToDraw.length; j++) {
    var trianglesToDrawPoints = [];
    trianglesToDrawPoints.push(trianglesToDraw[j][0]);
    trianglesToDrawPoints.push(trianglesToDraw[j][1]);
    trianglesToDrawPoints.push(trianglesToDraw[j][2]);
    var colour = trianglesToDraw[j][3];
    drawTriangle(trianglesToDrawPoints, 0, colour);
  }
  rendering = false
  if(queue.length > 0) {
    for(k=0;k<queue.length;k++) {
      queue[k]();
      queue.splice(k,1);
    }
  }
}
function getColour (dotProduct) {
  //Adjusts dot product
  dotProduct = Math.round(10 * dotProduct);
  //Checks which value to return
  switch(10 - dotProduct) {
    case 0: 
      return 1;
      break;
    case 1: 
      return 0.9;
      break;
    case 2: 
      return 0.8;
      break;
    case 3: 
      return 0.7;
      break;
    case 4: 
      return 0.6;
      break;
    case 5: 
      return 0.5;
      break;
    case 6: 
      return 0.4;
      break;
    case 7: 
      return 0.3;
      break;
    case 8: 
      return 0.2;
      break;
    case 9: 
      return 0.1;
      break;
  }
}

function translatePoint (point, axis, amount) {
  //Checks what axis to translate the point on
  if(axis == "x") {
    //Translates point relative to its previous position
    return {x: point.x + amount, y: point.y, z: point.z};
  } else if (axis == "y") {
    //Translates point relative to its previous position
    return {x: point.x, y: point.y + amount, z: point.z};
  } else if (axis == "z") {
    //Translates point relative to its previous position
    return {x: point.x, y: point.y, z: point.z + amount};
  } else {
    //Translates point relative to its previous position
    return point;
  }
}
function changeFov(num) {
  fov = num;
  fovRad = 1/Math.tan(toRadians(fov/2));
}



//MATRIX UTILITIES
//Applies perspective projection matrix to turn the 3D points --> 2D points 
function perspectiveprojectionMatrix (point) {
  //Adds extra value to allow for matrix multiplication by 4x4
  point = {x: point.x, y: point.y, z: point.z, m: 1};
  //Perspective Matrix
  var matrix = [[aspectratio * fovRad,0,0,0],
                [0,fovRad,0,0],
                [0,0,fFar / (fFar - fNear),1],
                [0,0,(-(fFar) * fNear) / (fFar - fNear),0]]
  //Calculates new x value
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]) + (point.m * matrix[3][0]);
  //Calculates new y value
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]) + (point.m * matrix[3][1]);
  //Calculates new z value
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]) + (point.m * matrix[3][2]);
  //Calculates 'w' value
  var w = (point.x * matrix[0][3]) + (point.y * matrix[1][3]) + (point.z * matrix[2][3]) + (point.m * matrix[3][3]);

  //Checks whethe to normalise new points
  if(w != 0) {
    //Normalises the new points
    return {x: x/w, y: y/w, z: z/w}; 
  } else {
    return {x: x, y: y, z: z};
  }
}
function rotationXMatrix (point, angle) {
  //Rotation X Matrix
  var matrix = [[1,0,0],
                [0, Math.cos(angle), Math.sin(angle)],
                [0, -(Math.sin(angle)), Math.cos(angle)]]
  //Calculates new x value
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]);
  //Calculates new y value
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]);
  //Calculates new z value
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]);
  return {x: x, y: y, z: z};
}
function rotationYMatrix (point, angle) {
  //Rotation Y Matrix
  var matrix = [[Math.cos(angle),0,Math.sin(angle)],
                [0,1,0],
                [-(Math.sin(angle)),0,Math.cos(angle)]]
  //Calculates new x value
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]);
  //Calculates new y value
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]);
  //Calculates new z value
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]);
  return {x: x, y: y, z: z};
}
function rotationZMatrix (point, angle) {
  //Rotation Z Matrix
  var matrix = [[Math.cos(angle),Math.sin(angle), 0],
                [-(Math.sin(angle)), Math.cos(angle), 0],
                [0,0,1]]
  //Calculates new x value
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]);
  //Calculates new y value
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]);
  //Calculates new z value
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]);
  return {x: x, y: y, z: z};
}



//FILE HANDLING
function getOBJData(objFile) {
  var reader = new FileReader();
  reader.readAsText(objFile);
  reader.onload = function() {
    var triangles = [];
    var data = reader.result;
    var verticeData = [];
    var faceData = [];
    data = data.split(/([A-Za-z])/);
    for(i=0; i<data.length; i++) {
      if(data[i].length <= 1) {
        if(data[i] == "v" || data[i] == "f") {
          if(data[i + 1].length > 1) {
            vertex = data[i + 1];
            while(vertex[0] == " ") {
              vertex = vertex.substring(1);
            }
            while(vertex[vertex.length - 1] == " ") {
              vertex = vertex.slice(0,-1);
            }
            vertex = vertex.replaceAll(".", "dot");
            vertex = vertex.replaceAll("-", "minus");
            vertex = vertex.replaceAll(/[^a-zA-Z0-9 ]/g, "");
            vertex = vertex.replaceAll("dot", ".");
            vertex = vertex.replaceAll("minus", "-")
            if(data[i] == "v") {
              vertex = vertex.split(" ");
              var values = [];
              for(j=0; j<vertex.length; j++) {
                if(/\d/.test(vertex[j])) {
                  values.push(Number(vertex[j]));
                }
              }
              verticeData.push({x:values[0], y:values[1], z:values[2]});
            } else if(data[i] == "f") {
              vertex = vertex.split(" ");
              var values = [];
              for(j=0; j<vertex.length; j++) {
                if(/\d/.test(vertex[j])) {
                  values.push(Number(vertex[j]));
                }
              }
              if(values.length > 3) {
                alert("The engine currently only supports models with tris");
                return;
              }
              faceData.push(values);
            }
          }
        }
      }
    }
    for(k=0; k<faceData.length; k++) {
      var thisTriangle = [];
      thisTriangle.push(verticeData[faceData[k][0] - 1]);
      thisTriangle.push(verticeData[faceData[k][1] - 1]);
      thisTriangle.push(verticeData[faceData[k][2] - 1]);
      thisTriangle.push({r: 255, g:0, b:0});
      triangles.push(thisTriangle);
    }
    myObject = triangles
  }
}
