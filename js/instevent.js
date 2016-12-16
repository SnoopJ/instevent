var maxPhotos = 12*5;
var photos = [];
var photoqueue = [];
var timer;

function updatePhotos() {
    var photo;
    for (var i=0; i<5; i++) {
        if (photoqueue.length < 1 || $("#pbOverlay").hasClass("show")) {
            return;
        }
        photo = photoqueue.shift();
        photos.push(photo);
        addPhoto(photo);
    }
    reinitializePhotobox();
}

function reinitializePhotobox() {
    // sometimes the plugin just...dies.  fuck it, let's rebuild occasionally
    if (!$("#pbOverlay").hasClass("show")) {
        $("#gallery").photobox('destroy');
        $("#gallery").photobox('li > a');
    }
}

function fetchFromCache(callback) {
    $.ajax({ 
        url: 'imgs.json', 
        success: function (res) { 
            res.forEach(function(e,i,a) { 
                if (!photos.includes(e) && !photoqueue.includes(e)) {
                    photoqueue.push(e);
                }
                if (callback instanceof Function) {
                    callback();
                }
            }) 
        } 
    })
    clearInterval(timer); // stop any existing timer, don't stack.
    timer = setInterval( fetchFromCache, 10*1000 );
}

function fetchFromInstagram() {
    // retrieving photos from instagram
    var images; 
    $.ajax({
        url: 'https://api.instagram.com/v1/users/self/media/recent?access_token=',
        data: { access_token: $("#accesstoken").val() },
        dataType: 'jsonp',
        type: 'GET',
        success: function(res){
            var imgsrcs = []; 
            res.data.forEach(function(e,i,a) {
                addPhoto(e.images.standard_resolution.url) 
            })
        } 
    })
} 

function printImage(url) {
    w = window.open(url,"_blank");
    w.document.write("<html><body>\
        <img style='\
        position:absolute;\
        height:98%;\
        margin: 1px;'\
        src=\""+url+"\"\
        onLoad=\"\
        window.print();\
        window.close();\
        \"></body></html>");
    w.onafterprint = function() { 
//         w.close();
        fetchFromCache();
        updatePhotos();
        setInterval(updatePhotos, 7*1000);
    };
}

//adding a photo to photobox:
function addPhoto(url) { 
    var i,l,a,spinner,spinnerParent;
    l = document.createElement("li"); 
    a = document.createElement("a"); 
    a.href = url;
    i = document.createElement("img");
    spinnerParent = document.createElement("div");
    spinner = document.createElement("div");
    spinner.classList = "loading";
    spinnerParent.appendChild(spinner);
    l.appendChild(a);
    l.appendChild(spinnerParent);
    a.appendChild(i);
    prependToGallery(l);
    i.onload = function() { 
        l.removeChild(spinnerParent);
        l.classList += "loaded"; 
    };
    i.src=url;
}

function prependToGallery(node) {
    g = $("#gallery")[0];
    if (g.children.length > 0) {
        g.insertBefore( node, g.firstChild);
    } else {
        g.appendChild(node);
    }
    while ( g.children.length > maxPhotos ) {
        g.removeChild(g.lastChild);
    }
}

function addRandomPhoto() {
    addPhoto('http://lorempixel.com/200/200?random=' + Math.random());
}

function addRandomPhotos() {
    for(var i=0; i<10; i++) {
       addRandomPhoto();
    }
}

$(function (){
//     addRandomPhotos();
    fetchFromCache(updatePhotos); // initial population
    setInterval(updatePhotos, 7*1000);
//     setInterval(reinitializePhotobox, 60*1000);
    $("#gallery").photobox('li > a');
    $(".pbWrapper").on("click", function(evt) { 
        evt.preventDefault();
        printImage($(this).find("img")[0].src) 
    })
})

function startTimer() {
    clearInterval(timer); // stop any existing timer, don't stack.
    timer = setInterval( function() { 
        for(var i=0; i<Math.random()*4 + 1; i++) { 
            addRandomPhoto(); 
        }
    }, 2000 );
}
