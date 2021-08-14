let canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext('2d');

ctx.translate((canvas.width/2),(canvas.height/2));

let interval = setInterval(refresh, 100);
let sliderFOV = document.getElementById("fov");

let shadeMode = 0;

let angleX = 0;
let angleY = 0;
let angleZ = 0;

let fNear = 0.1;
let fFar = 1000;
let fov = 90;
let aspectratio = (canvas.height)/(canvas.width);
let fovRad = 1/Math.tan(toRadians(fov/2));

sliderFOV.oninput = function() {
  fov = this.value;
  fovRad = 1 / Math.tan(toRadians(fov/2));
}

function refresh () {
  ctx.clearRect(-(canvas.width/2), -(canvas.height/2), canvas.width, canvas.height);
  angleX += toRadians(4);
  angleY += toRadians(5);
  angleZ += toRadians(6);
  draw3DPolygon(cubeTris);
}

const cameraPos = {x:0 ,y: 0, z:0};

const cubeTris = [[{x:0 ,y:0 ,z:0}, {x:0 ,y:1 ,z:0}, {x:1 ,y:1 ,z:0}, {r:255, g:0, b:0}],
                  [{x:0 ,y:0 ,z:0}, {x:1 ,y:1 ,z:0}, {x:1 ,y:0 ,z:0}, {r:255, g:0, b:0}],

                  [{x:1 ,y:0 ,z:0}, {x:1 ,y:1 ,z:0}, {x:1 ,y:1 ,z:1}, {r:255, g:255, b:0}],
                  [{x:1 ,y:0 ,z:0}, {x:1 ,y:1 ,z:1}, {x:1 ,y:0 ,z:1}, {r:255, g:255, b:0}],

                  [{x:1 ,y:0 ,z:1}, {x:1 ,y:1 ,z:1}, {x:0 ,y:1 ,z:1}, {r:255, g:0, b:255}],
                  [{x:1 ,y:0 ,z:1}, {x:0 ,y:1 ,z:1}, {x:0 ,y:0 ,z:1}, {r:255, g:0, b:255}],

                  [{x:0 ,y:0 ,z:1}, {x:0 ,y:1 ,z:1}, {x:0 ,y:1 ,z:0}, {r:0, g:255, b:0}],
                  [{x:0 ,y:0 ,z:1}, {x:0 ,y:1 ,z:0}, {x:0 ,y:0 ,z:0}, {r:0, g:255, b:0}],

                  [{x:0 ,y:1 ,z:0}, {x:0 ,y:1 ,z:1}, {x:1 ,y:1 ,z:1}, {r:0, g:0, b:255}],
                  [{x:0 ,y:1 ,z:0}, {x:1 ,y:1 ,z:1}, {x:1 ,y:1 ,z:0}, {r:0, g:0, b:255}],

                  [{x:1 ,y:0 ,z:1}, {x:0 ,y:0 ,z:1}, {x:0 ,y:0 ,z:0}, {r:0, g:255, b:255}],
                  [{x:1 ,y:0 ,z:1}, {x:0 ,y:0 ,z:0}, {x:1 ,y:0 ,z:0}, {r:0, g:255, b:255}]]

function drawTriangle (points, fill, colour) {
  if (canvas.getContext) {

    //Draws triangle on canvas
    ctx.beginPath();
    ctx.moveTo(points[0].x * (canvas.width/2), points[0].y * (canvas.height/2));
    ctx.lineTo(points[1].x * (canvas.width/2), points[1].y * (canvas.height/2));
    ctx.lineTo(points[2].x * (canvas.width/2), points[2].y * (canvas.height/2));
    ctx.closePath();

    /*DEBUG STUFF 
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();
    */

    if(fill == 0) {
      //Fills the triangle with the appropriate shade
      var fillColour = String("rgb(" + colour.r + "," + colour.g + "," + colour.b + ")");
      console.log(fillColour);
      ctx.fillStyle = fillColour
      ctx.fill();
    } else {
      //Draws the triangle edge instead of filling it
      ctx.stroke();
    }
  }
}

function draw3DPolygon (points) {
  var i;
  for(i=0; i<points.length; i++) {
    var triPoints = [];
    for (j=0; j<points[i].length - 1; j++) {
      //Applies all rotation matrices to the point
      var translatedTri = rotationYMatrix(rotationXMatrix(rotationZMatrix(points[i][j])));
      //Translates the points into view
      translatedTri = translatePoint(translatedTri, "z", 5);
      //Adds the points to an array
      triPoints.push(translatedTri);
    }
    var normal = {x:0 ,y:0 ,z:0 };
    var line1 = {x:0 ,y:0 ,z:0 }; 
    var line2 = {x:0 ,y:0 ,z:0 };

    //Calculates line 1 vector
    line1.x = triPoints[1].x - triPoints[0].x;
    line1.y = triPoints[1].y - triPoints[0].y;
    line1.z = triPoints[1].z - triPoints[0].z;

    //Calculates line 2 vector
    line2.x = triPoints[2].x - triPoints[0].x;
    line2.y = triPoints[2].y - triPoints[0].y;
    line2.z = triPoints[2].z - triPoints[0].z;

    //Calculates normal
    normal.x = (line1.y * line2.z) - (line1.z * line2.y);
    normal.y = (line1.z * line2.x) - (line1.x * line2.z);
    normal.z = (line1.x * line2.y) - (line1.y * line2.x);

    //Normalises the normal
    var normaliser = Math.sqrt((normal.x * normal.x) + (normal.y * normal.y) + (normal.z * normal.z));
    normal.x /= normaliser;
    normal.y /= normaliser;
    normal.z /= normaliser;

    //Checks if triangle is in view
    if((normal.x * (triPoints[0].x - cameraPos.x)) + 
        (normal.y * (triPoints[0].y - cameraPos.y)) + 
        (normal.z * (triPoints[0].z - cameraPos.z)) < 0){

      var directionalLight = {x: 0, y: 0, z: -1};
      
      //Normalises directional light
      var lightNormaliser = Math.sqrt((directionalLight.x * directionalLight.x) + (directionalLight.y * directionalLight.y) + (directionalLight.z * directionalLight.z));
      directionalLight.x /= lightNormaliser;
      directionalLight.y /= lightNormaliser;
      directionalLight.z /= lightNormaliser;


      /* DEBUG STUFF
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(perspectiveprojectionMatrix(translatePoint(directionalLight, "z", 5)).x * (canvas.width/2),perspectiveprojectionMatrix(translatePoint(directionalLight, "z", 5)).y * (canvas.height/2));
      ctx.lineTo(perspectiveprojectionMatrix(normal).x * (canvas.width/2),perspectiveprojectionMatrix(normal).y * (canvas.height/2));
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = "yellow";
      ctx.beginPath()
      ctx.rect((perspectiveprojectionMatrix(translatePoint(directionalLight, "z", 0)).x - 5),(perspectiveprojectionMatrix(translatePoint(directionalLight, "z", 0)).y - 5),10,10);
      ctx.closePath()
      ctx.fill();
      */

      //Checks similarity of the normal and light direction vectors by calculating dot product
      var dotProduct = (normal.x * directionalLight.x) + (normal.y * directionalLight.y) + (normal.z * directionalLight.z);

      //Adjusts colour according to dot product
      var colour = {r: getColour(dotProduct) * points[i][3].r, g: getColour(dotProduct) * points[i][3].g, b: getColour(dotProduct) * points[i][3].b};

      //Applies perspective projection matrix to the points
      for(k=0; k<triPoints.length; k++) {
        triPoints[k] = perspectiveprojectionMatrix(triPoints[k]);
      } 

      //Draws the triangle to the screen
      if(shadeMode == 0) {
        drawTriangle(triPoints, 0, colour);
      } else {
        drawTriangle(triPoints, 1, colour);
      }
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

function orthographicprojectionMatrix (point) {
  var matrix = [[fovRad,0,0],
                [0,fovRad * aspectratio,0],
                [0,0,0]]
  var x = (point.x * matrix[0][0]) + (point.y * matrix[0][1]) + (point.z * matrix[0][2]);
  var y = (point.x * matrix[1][0]) + (point.y * matrix[1][1]) + (point.z * matrix[1][2]);
  return {x: x, y: y};
}

function rotationXMatrix (point) {
  //Rotation X Matrix
  var matrix = [[1,0,0],
                [0, Math.cos(angleX), Math.sin(angleX)],
                [0, -(Math.sin(angleX)), Math.cos(angleX)]]
  //Calculates new x value
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]);
  //Calculates new y value
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]);
  //Calculates new z value
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]);
  return {x: x, y: y, z: z};
}

function rotationYMatrix (point) {
  //Rotation Y Matrix
  var matrix = [[Math.cos(angleY),0,Math.sin(angleY)],
                [0,1,0],
                [-(Math.sin(angleY)),0,Math.cos(angleY)]]
  //Calculates new x value
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]);
  //Calculates new y value
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]);
  //Calculates new z value
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]);
  return {x: x, y: y, z: z};
}

function rotationZMatrix (point) {
  //Rotation Z Matrix
  var matrix = [[Math.cos(angleZ),Math.sin(angleZ), 0],
                [-(Math.sin(angleZ)), Math.cos(angleZ), 0],
                [0,0,1]]
  //Calculates new x value
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]);
  //Calculates new y value
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]);
  //Calculates new z value
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]);
  return {x: x, y: y, z: z};
}

draw3DPolygon(cubeTris);





//Utilities
function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}
