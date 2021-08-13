let canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext('2d');

ctx.translate((canvas.width/2),(canvas.height/2));

let interval = setInterval(refresh, 100);

let sliderFOV = document.getElementById("fov");


let mode = 0;
let shadeMode = 1;

let angleX = 0;
let angleY = toRadians(30);
let angleZ = 0;

let fNear = 0.1;
let fFar = 1000;
let fov = 90;
let aspectratio = (canvas.width)/(canvas.height);
let fovRad = 1 / Math.tan(toRadians(fov/2));

sliderFOV.oninput = function() {
  fov = this.value;
  fovRad = 1 / Math.tan(toRadians(fov/2));
}

function refresh () {
  ctx.clearRect(-(canvas.width/2), -(canvas.height/2), canvas.width, canvas.height);
  angleX += toRadians(1);
  angleY += toRadians(3);
  angleZ += toRadians(5);
  draw3DPolygon(cubeTris);
}

let cameraPos = {x:0 ,y: 0, z:0};

const cubeTris = [[{x:0 ,y:0 ,z:0}, {x:0 ,y:1 ,z:0}, {x:1 ,y:1 ,z:0}],
                  [{x:0 ,y:0 ,z:0}, {x:1 ,y:1 ,z:0}, {x:1 ,y:0 ,z:0}],

                  [{x:1 ,y:0 ,z:0}, {x:1 ,y:1 ,z:0}, {x:1 ,y:1 ,z:1}],
                  [{x:1 ,y:0 ,z:0}, {x:1 ,y:1 ,z:1}, {x:1 ,y:0 ,z:1}],

                  [{x:1 ,y:0 ,z:1}, {x:1 ,y:1 ,z:1}, {x:0 ,y:1 ,z:1}],
                  [{x:1 ,y:0 ,z:1}, {x:0 ,y:1 ,z:1}, {x:0 ,y:0 ,z:1}],

                  [{x:0 ,y:0 ,z:1}, {x:0 ,y:1 ,z:1}, {x:0 ,y:1 ,z:0}],
                  [{x:0 ,y:0 ,z:1}, {x:0 ,y:1 ,z:0}, {x:0 ,y:0 ,z:0}],

                  [{x:0 ,y:1 ,z:0}, {x:0 ,y:1 ,z:1}, {x:1 ,y:1 ,z:1}],
                  [{x:0 ,y:1 ,z:0}, {x:1 ,y:1 ,z:1}, {x:1 ,y:1 ,z:0}],

                  [{x:1 ,y:0 ,z:1}, {x:0 ,y:0 ,z:1}, {x:0 ,y:0 ,z:0}],
                  [{x:1 ,y:0 ,z:1}, {x:0 ,y:0 ,z:0}, {x:1 ,y:0 ,z:0}]]

function drawTriangle (points, fill) {
  if (canvas.getContext) {
    ctx.beginPath();
    ctx.moveTo(points[0].x * (canvas.width/2), points[0].y * (canvas.height/2));
    ctx.lineTo(points[1].x * (canvas.width/2), points[1].y * (canvas.height/2));
    ctx.lineTo(points[2].x * (canvas.width/2), points[2].y * (canvas.height/2));
    ctx.closePath();
    if(fill == 0) {
      ctx.fillStyle = "black";
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }
}

function draw3DPolygon (points) {
  var i;
  for(i=0; i<points.length; i++) {
    var triPoints = [];

    for (j=0; j<points[i].length; j++) {
      //Render faces that we can't see - Not Efficient
      if(mode == 0) {
        var translatedTri = rotationXMatrix(rotationYMatrix(rotationZMatrix(points[i][j])))
        translatedTri = translatePoint(translatedTri, "z", 5)
        triPoints.push(perspectiveprojectionMatrix(translatedTri));
      } 
      //Only render faces we can see - Efficient
      else if (mode == 1) {
        var translatedTri = rotationXMatrix(rotationYMatrix(rotationZMatrix(points[i][j])));
        translatedTri = translatePoint(translatedTri, "z", 5);
        triPoints.push(perspectiveprojectionMatrix(translatedTri));
      }
    }

    if(mode == 1) {
      var normal = {x:0 ,y:0 ,z:0 };
      var line1 = {x:0 ,y:0 ,z:0 }; 
      var line2 = {x:0 ,y:0 ,z:0 };

      line1.x = triPoints[1].x - triPoints[0].x;
      line1.y = triPoints[1].y - triPoints[0].y;
      line1.z = triPoints[1].z - triPoints[0].z;

      line2.x = triPoints[2].x - triPoints[0].x;
      line2.y = triPoints[2].y - triPoints[0].y;
      line2.z = triPoints[2].z - triPoints[0].z;

      normal.x = (line1.y * line2.z) - (line1.z * line2.y);
      normal.y = (line1.z * line2.x) - (line1.x * line2.z);
      normal.z = (line1.x * line2.y) - (line1.y * line2.x);

      var l = Math.sqrt((normal.x * normal.x) + (normal.y * normal.y) + (normal.z * normal.z));
      normal.x /= l;
      normal.y /= l;
      normal.z /= l;

      if((normal.x * (triPoints[0].x - cameraPos.x)) + 
         (normal.y * (triPoints[0].y - cameraPos.y)) + 
         (normal.z * (triPoints[0].z - cameraPos.z)) < 0){
        for(k=0; k<triPoints.length; k++) {
          ctx.fillRect((triPoints[k].x - 2.5) * (canvas.width/2),(triPoints[k].y - 2.5) * (canvas.height/2),5,5);
        } 
        if(shadeMode == 0) {
          drawTriangle(triPoints, 0);
        } else {
          drawTriangle(triPoints, 1);
        }
      }
    } else {
      for(k=0; k<triPoints.length; k++) {
        ctx.fillRect((triPoints[k].x - 2.5) * (canvas.width/2),(triPoints[k].y - 2.5) * (canvas.height/2),5,5);
      } 
      if(shadeMode == 0) {
        drawTriangle(triPoints, 0);
      } else {
        drawTriangle(triPoints, 1);
      }
    }
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

function perspectiveprojectionMatrix (point) {
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

function orthographicprojectionMatrix (point) {
  var matrix = [[fovRad,0,0],
                [0,fovRad * aspectratio,0],
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
