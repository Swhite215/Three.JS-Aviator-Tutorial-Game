//Declare the colors you will be using with color code
var Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xF5986E,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
}

window.addEventListener('load', init, false);

//All main functions will be placed inside here.
function init(event) {
  //add a lsitener to the document for the mouse.
  document.addEventListener('mousemove', handleMouseMove, false);

  //set up the scene, the camera, and the renderer
  createScene();

  //add the lights
  createLights();

  //add the objects
  createPlane();
  createSea();
  createSky();

  //start a loop that will update the objects' positions
  // and render the scene from each frame
  loop();

}

//The scene, the camera, and the renderer are created in the createScene function

//declare createScene variables
var scene, camera, fieldOfView, asepctRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container;

function createScene() {
  //Get the width and height of the screen,
  //Use them to set up the aspect ratio of the camera,
  //and the size of the renderer
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  // Create the scene
  scene = new THREE.Scene();

  //Create the camera
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;

  //Add a fog effect to the scene; same color as the
  //background color used in the style sheet.
  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

  camera = new THREE.PerspectiveCamera(
    fieldOfView, aspectRatio, nearPlane, farPlane
  );

  //Set the position of the camera
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

  // Create the renderer
  renderer = new THREE.WebGLRenderer({
    //Allow transparency to show the gradient background
    //we defined in the CSS
    alpha: true,

    //Activate the anti-aliasing, this is less performant, but as our project is low-poly based, it should be fine.
    antialias: true
  });

  //Defiine the size of the renderer; in this case it
  //will fill the entire scene
  renderer.setSize(WIDTH, HEIGHT);

  //Enable shadow rendering
  renderer.shadowMap.enabled = true;

  //Add the DOM element of the renderer to the
  //container we created in the HTML
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  //Listen to the screen, if the user resizes it
  //we have to updatethe camera and the renderer size
  window.addEventListener('resize', handleWindowResize, false);

  function handleWindowResize() {
    //update the height and width of the renderer and of the camera.
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  }
}

//declare createLights variables
var hemisphereLight, shadowLight;

function createLights() {
  //A hemisphere light is a gradient colored light.
  //THREE.HemisphereLight(sky color, ground color. intensity)
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);

  //A directional light shines from a specific direction
  //It acts like the sun, that means all the rays produced are parallel
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);

  //set the direction of the light
  shadowLight.position.set(150, 350, 350);

  //Allow shadow casting
  shadowLight.castShadow = true;

  //define the visible area of the projected shadow
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  //define the resolution of the shadow; the higher the better
  //but also the more expensive and less performant
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  //to activate the lights, add them to the scene
  scene.add(hemisphereLight);
  scene.add(shadowLight);
}


//First let's define a Sea object
Sea = function() {
  //create the geometry or shape of the cylinder
  //the parameters are radius top, radius bottom, height, number of segments on the radius, number of segments vertically
  var geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);

  //rotate the geometry on the x-axis
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

  //create the material
  var mat = new THREE.MeshPhongMaterial({
    color: Colors.blue,
    transparent: true,
    opacity: .6,
    shading: THREE.FlatShading
  });

  //To create an object in Three.JS, we have to cerate a mesh which comines geometry and some material
  this.mesh = new THREE.Mesh(geom, mat);

  //Allow the sea to receive the shadows
  this.mesh.receiveShadow = true;
}

//Create an instnace of the sea and add it to the scene
var sea;

function createSea() {
  sea = new Sea();

  //push it to bottom of the screen
  sea.mesh.position.y = -600;

  //add the mesh of the sea to the scene.
  scene.add(sea.mesh);
}

Cloud = function() {
  //Create an empty container that will hold the different parts of the Cloud
  this.mesh = new THREE.Object3D();

  //create a cube geometry that will be duplicated.
  //THREE.BoxGeometry(width, height, depth);
  var geom = new THREE.BoxGeometry(20,20,20);

  //create a material, a simple white material
  var mat = new THREE.MeshPhongMaterial({
    color: Colors.white
  });

  //duplicate the geometry a random number of times
  var nBlocs = 3+Math.floor(Math.random()*3);

  for (var i = 0; i < nBlocs; i++) {

    //create the mesh by cloning the geometry
    var m = new THREE.Mesh(geom, mat);

    //set the position and the rotation of each cube randomly
    m.position.x = i*15;
    m.position.y = Math.random()*10;
    m.position.z = Math.random()*10;
    m.rotation.z = Math.random()*Math.PI*2;
    m.rotation.y = Math.random()*Math.PI*2;

    //set the size of the cube randomly
    var s = .1 + Math.random()*.9;
    m.scale.set(s,s,s);

    //allow each cube to casse and to receive shadows
    m.castShadow = true;
    m.receiveShadow = true;

    //add the cube to the container we first created
    this.mesh.add(m);
  }
}

//Define a sky object
Sky = function() {
  //Create an empty container
  this.mesh = new THREE.Object3D();

  //choose a number of clouds to be scattered in the sky.
  this.nClouds = 20;

  //distribute consistently based on a uniform angle.
  var stepAngle = Math.PI*2 / this.nClouds;

  //create the clouds
  for (var i = 0; i < this.nClouds; i++) {
    var c = new Cloud();

    //set the rotation and position of each cloud.
    //Using trigonometry
    var a = stepAngle*i;
    var h = 750 + Math.random()*200; //distance from center of axis and cloud itself.

    //convert polar coodrinates (angle, distance) to Cartesian.
    c.mesh.position.y = Math.sin(a)*h;
    c.mesh.position.x = Math.cos(a)*h;

    //rotate the cloud according to its position
    c.mesh.rotation.z = a + Math.PI/2;

    //set random scale for each cloud
    var s = 1+Math.random()*2;
    c.mesh.scale.set(s,s,s);

    //do not forget to add the mesh of each cloud in the scene
    this.mesh.add(c.mesh);
  }
}

var sky;

function createSky() {
  sky = new Sky();
  sky.mesh.position.y = -600;
  scene.add(sky.mesh);
}

var AirPlane = function() {
  //create a container
  this.mesh = new THREE.Object3D();

  //Create the cabin
  var geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1,1,1);
  var matCockpit = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading});

  geomCockpit.vertices[4].y -= 10;
  geomCockpit.vertices[4].z += 10;
  geomCockpit.vertices[5].y -= 10;
  geomCockpit.vertices[5].z -= 20;
  geomCockpit.vertices[6].y += 30;
  geomCockpit.vertices[6].z += 20;
  geomCockpit.vertices[7].y += 30;
  geomCockpit.vertices[7].z -= 20;

  var cockpit = new THREE.Mesh(geomCockpit, matCockpit);

  cockpit.castShadow = true;
  cockpit.receiveShadow = true;
  this.mesh.add(cockpit);

  //Create the engine
  var geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
  var matEngine = new THREE.MeshPhongMaterial({color: Colors.white, shading: THREE.FlatShading});
  var engine = new THREE.Mesh(geomEngine, matEngine);
  engine.position.x = 40;
  engine.castShadow = true;
  engine.receiveShadow = true;
  this.mesh.add(engine);

  //Create the tail
  var geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1,1,1);
  var matTailPlane = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading});
  var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
  tailPlane.position.set(-35, 25, 0);
  tailPlane.castShadow = true;
  tailPlane.receiveShadow = true;
  this.mesh.add(tailPlane);

  //Create the Wing
  var geomSideWing = new THREE.BoxGeometry(40,8,150,1,1,1);
  var matSideWing = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading});

  console.log(geomSideWing.vertices);
  geomSideWing.vertices[0].z += 10;
  geomSideWing.vertices[0].y -= 5;
  geomSideWing.vertices[5].z += 20;
  geomSideWing.vertices[5].y -= 5;
  geomSideWing.vertices[2].z += 20;
  geomSideWing.vertices[2].y += 5;
  geomSideWing.vertices[7].z += 20;
  geomSideWing.vertices[7].y += 5;


  var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
  sideWing.castShadow = true;
  sideWing.receiveShadow = true;
  this.mesh.add(sideWing);

  //propeller
  var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
  var matPropeller = new THREE.MeshPhongMaterial({color: Colors.brown, shading: THREE.FlatShading});
  this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
  this.propeller.castShadow = true;
  this.propeller.receiveShadow = true;

  //blades
  var geomBlade = new THREE.BoxGeometry(1,100,20,1,1,1);
  var matBlade = new THREE.MeshPhongMaterial({color: Colors.brownDark, shading: THREE.FlatShading});

  var blade = new THREE.Mesh(geomBlade, matBlade);
  blade.position.set(8, 0, 0);
  blade.castShadow = true;
  blade.receiveShadow = true;
  this.propeller.add(blade);
  this.propeller.position.set(50,0,0);
  this.mesh.add(this.propeller);
}

var airplane;

function createPlane() {
  airplane = new AirPlane();
  airplane.mesh.scale.set(.25, .25, .25);
  airplane.mesh.position.y = 100;
  scene.add(airplane.mesh);
}

function loop() {
  //rotate propeller, sea and sky
  airplane.propeller.rotation.x += 0.3;
  sea.mesh.rotation.z += .005;
  sky.mesh.rotation.z += .01;

  //update the plane on each frame
  updatePlane();

  //render the scene
  renderer.render(scene, camera);

  //call the loop function again.
  requestAnimationFrame(loop);
}

var mousePos = {x:0, y:0};

//handling the mousemove event

function handleMouseMove(event) {
  //here we are converting the mouse position value received
  //to a normalized value varying between -1 and 1;
  //this is the formula for the horizontal axis;

  var tx = -1 + (event.clientX / WIDTH)*2;

  //for the vertical axis, we need to inverse the formula
  //because the 2D y-axis goes the opposite direction of the 3D y-axis.

  var ty = 1 - (event.clientY / HEIGHT)*2;
  mousePos = {x:tx, y:ty};

}

function updatePlane() {
  //Lets move the airplane between -100 and 100 on the horizontal axis
  //and between 25 and 175 on the vertical axis
  //depending on the mouse position which ranges from between -1 and 1 on both axes
  //to achieve that we use a normalize function

  var targetX = normalize(mousePos.x, -.75, .75, -100, 100);
  var targetY = normalize(mousePos.y, -.75, .75, 25, 175);

  //update the airplane's position
  airplane.mesh.position.y = targetY;
  airplane.mesh.position.x = targetX;
  airplane.propeller.rotation.x += 0.3;
}

function normalize(v, vmin, vmax, tmin, tmax) {

  var nv = Math.max(Math.min(v, vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);

  return tv;
}

//To actually view a scene this must always be included.
// renderer.render(scene, camera);
