let canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext('2d');
ctx.translate((canvas.width/2),(canvas.height/2));

let interval = setInterval(refresh, 100);

let angleX = 0;
let angleY = 0;
let angleZ = 0;

let fNear = 0.1;
let fFar = 1000;
let fov = 90;
let aspectratio = (canvas.width)/(canvas.height);
let fovRad = 1 / Math.tan(toRadians(fov/2));


function refresh () {
  ctx.clearRect(-(canvas.width/2), -(canvas.width/2), canvas.width, canvas.height);
  angleX += toRadians(1);
  angleY += toRadians(3);
  angleZ += toRadians(5);
  draw3DPolygon(cubeTris);
}

const cubeTris = [[{x:0 ,y:1 ,z:0}, {x:1 ,y:1 ,z:0}, {x:0 ,y:0 ,z:0}],
                [{x:0 ,y:0 ,z:0}, {x:1 ,y:1 ,z:0}, {x:1 ,y:0 ,z:0}],
                [{x:1 ,y:1 ,z:0}, {x:1 ,y:1 ,z:1}, {x:1 ,y:0 ,z:0}],
                [{x:1 ,y:0 ,z:0}, {x:1 ,y:1 ,z:1}, {x:1 ,y:0 ,z:1}],
                [{x:1 ,y:1 ,z:1}, {x:1 ,y:0 ,z:1}, {x:0 ,y:1 ,z:1}],
                [{x:0 ,y:1 ,z:1}, {x:1 ,y:0 ,z:1}, {x:0 ,y:0 ,z:1}],
                [{x:0 ,y:1 ,z:1}, {x:0 ,y:0 ,z:1}, {x:0 ,y:1 ,z:0}],
                [{x:0 ,y:1 ,z:0}, {x:0 ,y:0 ,z:1}, {x:0 ,y:0 ,z:0}],
                [{x:0 ,y:1 ,z:1}, {x:0 ,y:1 ,z:0}, {x:1 ,y:1 ,z:0}],
                [{x:0 ,y:1 ,z:1}, {x:1 ,y:1 ,z:0}, {x:1 ,y:1 ,z:1}],
                [{x:0 ,y:0 ,z:1}, {x:1 ,y:0 ,z:1}, {x:0 ,y:0 ,z:0}],
                [{x:0 ,y:0 ,z:0}, {x:1 ,y:0 ,z:1}, {x:1 ,y:0 ,z:0}]]

function drawTriangle (points) {
  if (canvas.getContext) {
    ctx.beginPath();
    ctx.moveTo(points[0].x * (canvas.width/2), points[0].y * (canvas.height/2));
    ctx.lineTo(points[1].x * (canvas.width/2), points[1].y * (canvas.height/2));
    ctx.lineTo(points[2].x * (canvas.width/2), points[2].y * (canvas.height/2));
    ctx.closePath();
    ctx.stroke();
  }
}

function draw3DPolygon (points) {
  console.log(points.length);
  var i;
  for(i=0; i<points.length; i++) {
    triPoints = [];
    for (j=0; j<points[i].length; j++) {
      var translatedTri = rotationXMatrix(rotationYMatrix(rotationZMatrix(points[i][j])))
      translatedTri = translatePoint(translatedTri, "z", 5)
      triPoints.push(projectionMatrix(translatedTri));
    }
    for(k=0; k<triPoints.length; k++) {
      ctx.fillRect((triPoints[k].x - 2.5) * (canvas.width/2),(triPoints[k].y - 2.5) * (canvas.height/2),5,5);
    } 
    drawTriangle(triPoints);
    console.log(triPoints);
  }
}

function translatePoint (point, axis, amount) {
  if(axis == "x") {
    return {x: point.x + amount, y: point.y, z: point.z};
  } else if (axis == "y") {
    return {x: point.x, y: point.y + amount, z: point.z};
  } else if (axis == "z") {
    return {x: point.x, y: point.y, z: point.z + amount};
  } else {
    return point;
  }
}

function projectionMatrix (point) {
  point = {x: point.x, y: point.y, z: point.z, m: 1};
  var matrix = [[fovRad,0,0,0],
                [0,aspectratio * fovRad,0,0],
                [0,0,fFar / (fFar - fNear),1],
                [0,0,(-(fFar) * fNear) / (fFar - fNear),0]]
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]) + (point.m * matrix[3][0]);
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]) + (point.m * matrix[3][1]);
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]) + (point.m * matrix[3][2]);
  var w = (point.x * matrix[0][3]) + (point.y * matrix[1][3]) + (point.z * matrix[2][3]) + (point.m * matrix[3][3]);

  if(w != 0) {
    return {x: x/w, y: y/w, z: z/w}; 
  } else {
    return {x: x, y: y, z: z};
  }
}

function orthoprojectionMatrix (point) {
  var matrix = [[1,0,0],
                [0,1,0],
                [0,0,0]]
  var x = (point.x * matrix[0][0]) + (point.y * matrix[0][1]) + (point.z * matrix[0][2]);
  var y = (point.x * matrix[1][0]) + (point.y * matrix[1][1]) + (point.z * matrix[1][2]);
  return {x: x, y: y};
}

function rotationXMatrix (point) {
  var matrix = [[1,0,0],
                [0, Math.cos(angleX), -(Math.sin(angleX))],
                [0, Math.sin(angleX), Math.cos(angleX)]]
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]);
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]);
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]);
  return {x: x, y: y, z: z};
}

function rotationYMatrix (point) {
  var matrix = [[Math.cos(angleY),0,Math.sin(angleY)],
                [0,1,0],
                [-(Math.sin(angleY)),0,Math.cos(angleY)]]
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]);
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]);
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]);
  return {x: x, y: y, z: z};
}

function rotationZMatrix (point) {
  var matrix = [[Math.cos(angleZ),-(Math.sin(angleZ)), 0],
                [Math.sin(angleZ), Math.cos(angleZ), 0],
                [0,0,1]]
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]);
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]);
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]);
  return {x: x, y: y, z: z};
}

draw3DPolygon(cubeTris);

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}
