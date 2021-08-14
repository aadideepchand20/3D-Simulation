let canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

ctx.translate((canvas.width/2),(canvas.height/2));

let interval = setInterval(refresh, 100);
let sliderFOV = document.getElementById("fov");
let file = document.getElementById("inputFile");
let output = document.getElementById("output")

let shadeMode = 0;

let pause = false;

let angleX = toRadians(90);
let angleY = toRadians(30);
let angleZ = 0;

let fNear = 0.1;
let fFar = 1000;
let fov = 90;
let aspectratio = (canvas.height)/(canvas.width);
let fovRad = 1/Math.tan(toRadians(fov/2));

function refresh () {
  if(pause != true) {
    ctx.clearRect(-(canvas.width/2), -(canvas.height/2), canvas.width, canvas.height);
    //angleX += toRadians(4);
    angleY += toRadians(5);
    //angleZ += toRadians(6);
    draw3DPolygon(triangles);
  }
}

sliderFOV.oninput = function() {
  fov = this.value;
  fovRad = 1 / Math.tan(toRadians(fov/2));
}

file.onchange = function() {
  pause = true;
  var reader = new FileReader();
  reader.readAsText(file.files[0]);
  reader.onload = function() {
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
                alert("The engine only supports models with tris");
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
    ctx.clearRect(-(canvas.width/2), -(canvas.height/2), canvas.width, canvas.height);
    pause = false;
    draw3DPolygon(triangles);
  }
}

let triangles = [];

const cameraPos = {x:0 ,y: 0, z:0};

let cubeTris = [[{x:0 ,y:0 ,z:0}, {x:0 ,y:1 ,z:0}, {x:1 ,y:1 ,z:0}, {r:255, g:0, b:0}],
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

function draw3DPolygon (points) {
  var i;
  var trianglesToDraw = [];
  for(i=0; i<points.length; i++) {
      if(typeof points[i][0] === 'undefined' || typeof points[i][1] === 'undefined' || typeof points[i][2] === 'undefined' || typeof points[i][3] === 'undefined') {
        continue;
      }
    var triPoints = [];
    for (j=0; j<points[i].length - 1; j++) {
      //Applies all rotation matrices to the point
      var translatedTri = rotationYMatrix(rotationXMatrix(rotationZMatrix(points[i][j], angleZ), angleX), angleY);
      //Translates the points into view
      translatedTri = translatePoint(translatedTri, "z", 10);
      translatedTri = translatePoint(translatedTri, "y", 8);
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

      /*DEBUG STUFF
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
    if(shadeMode == 0) {
      drawTriangle(trianglesToDrawPoints, 0, colour, canvas, ctx);
    } else {
      drawTriangle(trianglesToDrawPoints, 1, colour, canvas, ctx);
    }
  }
}
