var uuid = window.uuid
var socket;
socket = io.connect('http://localhost:3000/')
console.log('client connected')

const buttonColours = ["#f14e4e","#f1bb4e","#84f14e","#4ef18f","#4e9af1","#9a4ef1","#f14ebd"]
var currentColour = 0

window.onload = function () {
    socket = io.connect('http://localhost:3000/')

    socket.on('build', function(fridge){
        
        // if dropped magnets
        if(Object.keys(fridge).length === 0){
            document.querySelectorAll('.draggable').forEach(e => e.remove());
        }

        // add other client's magnets
        for (const [id, data] of Object.entries(fridge)) {
            
            var magnet = document.createElement("img");
            magnet.src = `magnets/${data.char}.png`;
            magnet.className = "draggable"
            magnet.id = id
            magnet.style.left = data.x
            magnet.style.top = data.y

            document.body.appendChild(magnet);
          }

    })

    // someones moving something
    socket.on('move', function (data) {
        var magnet = document.getElementById(data.id);

        magnet.style.left = data.x;
        magnet.style.top = data.y
    })

    // someone added a magnet
    socket.on('new', function (data) {
        console.log(data)
        var magnet = document.createElement("img");

        magnet.src = `magnets/${data.char}.png`;
        magnet.className = "draggable"
        magnet.style.left = data.x
        magnet.style.top = data.y

        magnet.id = data.id
        document.body.appendChild(magnet);
    })

    document.onmousedown = startDrag;
    document.onmouseup = stopDrag;
    
}

function startDrag(e) {

    targ = e.target || e.srcElement;

    if (targ.className != 'draggable') { return };
    // calculate event X, Y coordinates
    offsetX = e.clientX;
    offsetY = e.clientY;

    // assign default values for top and left properties
    if (!targ.style.left) { targ.style.left = '0px' };
    if (!targ.style.top) { targ.style.top = '0px' };

    // calculate integer values for top and left properties
    coordX = parseInt(targ.style.left);
    coordY = parseInt(targ.style.top);
    drag = true;
    document.onmousemove = dragLetter;
    return false;
}

function dragLetter(e) {

    if (!drag) { return };


    // move div element
    targ.style.left = coordX + e.clientX - offsetX + 'px';
    targ.style.top = coordY + e.clientY - offsetY + 'px';

    // package magnet
    var data = {
        id: targ.id,
        x: targ.style.left,
        y: targ.style.top
    }
    if(data.id){
        socket.emit('move', data);
    }

    return false;
}

function stopDrag() {
    drag = false;
}

function addMagnet() {
    // change button colour
    currentColour++;
    document.getElementById('new-magnet-button').style.backgroundColor = buttonColours[currentColour % buttonColours.length]
    
    // new magnet element
    var magnet = document.createElement("img");

     // get a random letter
    const char = String.fromCharCode(97 + Math.floor(Math.random() * 26))

    // load that letter
    magnet.src = `magnets/${char}.png`; 
    magnet.className = "draggable";
    
    // give it an id
    const id = uuid.v4();
    magnet.id = id

    // put it somewhere
    const x = Math.floor(Math.random() * 1000) + 1;
    const y = Math.floor(Math.random() * 1000) + 1;
    magnet.style.left = x + 'px';
    magnet.style.top = y + 'px';

    document.body.appendChild(magnet);

    // package magnet
    var data = {
        id: magnet.id,
        char: char,
        x: magnet.style.left,
        y: magnet.style.top
    }


    socket.emit('new', data);
}

function dropMagnets() {
    socket.emit('drop')
}

