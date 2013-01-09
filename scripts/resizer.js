console.log("resizer started!");

//*************************************************************************************************************************************************
//**************************************************************** ASSET MANAGER ******************************************************************
//*************************************************************************************************************************************************
function AssetManager() {
	//console.log("test2");
	this.successCount = 0;
	this.errorCount = 0;
	this.cache = {};
	this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function(path) {
	this.downloadQueue.push(path);
}

AssetManager.prototype.downloadAll = function(callback) {
	if (this.downloadQueue.length === 0) {
		callback();
	}
	
	for (var i = 0; i < this.downloadQueue.length; i++) {
		var path = this.downloadQueue[i];
		var img = new Image();
		var that = this;
		img.addEventListener("load", function() {
			console.log(this.src + ' is loaded');
			that.successCount += 1;
			if (that.isDone()) {
				callback();
			}
		}, false);
		img.addEventListener("error", function() {
			that.errorCount += 1;
			if (that.isDone()) {
				callback();
			}
		}, false);
		img.src = path;
		this.cache[path] = img;
	}
}

AssetManager.prototype.getAsset = function(path) {
	return this.cache[path];
}

AssetManager.prototype.isDone = function() {
	return (this.downloadQueue.length == this.successCount + this.errorCount);
}


//*************************************************************************************************************************************************
//********************************************************************** ELEMENT ******************************************************************
//*************************************************************************************************************************************************
function Element(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	this.click = false;
	this.hover = false;
}

Element.prototype.setXAndY = function(x, y) {
	this.x = x;
	this.y = y;
}

Element.prototype.addXAndY = function(x, y) {
	this.x += x;
	this.y += y;
}

Element.prototype.draw = function(ctx) {
}

Element.prototype.checkIfClicked = function() {
	if(this.hover) {
		this.click = true;
	}
}

Element.prototype.clearClicks = function() {
	this.click = false;
}

//*************************************************************************************************************************************************
//*********************************************************************** SQUARE ******************************************************************
//*************************************************************************************************************************************************
function Square(x, y, w, h) {
	Element.call(this, x, y, w, h);

	this.lines = [];
	this.lines.push(new Line(this, x, y, w, 0));
	this.lines.push(new Line(this, x+w, y, 0, h));
	this.lines.push(new Line(this, x, y+h, w, 0));
	this.lines.push(new Line(this, x, y, 0, w));

	this.movable = false;
	this.fillStyle = "rgba(255, 255, 255, 0.5)";
}

Square.prototype = new Element();
Square.prototype.constructor = Square;

Square.prototype.addXAndY = function(x, y) {
	Element.prototype.addXAndY.call(this, x, y);
	for(var i = 0; i < this.lines.length; i++) {
		this.lines[i].addXAndY(x, y);
	}

}

Square.prototype.isMouseOverThis = function(x, y) {
	for (var i = this.lines.length - 1; i >= 0; i--) {
		this.lines[i].isMouseOverThis(x, y);
	};

	if(x >= this.x && x < this.x + this.w && y >= this.y && y < this.y + this.h) {
		this.hover = true;
		return true;
	}
	this.hover = false;
	return false;
}

Square.prototype.update = function() {
	var cursorCode = "";
	if(this.lines[0].hover) {
		cursorCode += "n";
	}
	if(this.lines[2].hover) {
		cursorCode += "s";
	}
	if(this.lines[1].hover) {
		cursorCode += "e";
	}
	if(this.lines[3].hover) {
		cursorCode += "w";
	}

	if(cursorCode.length > 0) {
		canvas.style.cursor = cursorCode+"-resize";
		this.movable = false;
	} else if(this.hover) {
		canvas.style.cursor = "move";
		this.movable = true;
	} else {
		canvas.style.cursor = "default";
	}

	for (var i = this.lines.length - 1; i >= 0; i--) {
		this.lines[i].update();
	};
}

Square.prototype.draw = function(ctx) {
	ctx.fillStyle = this.fillStyle;
	ctx.fillRect(this.x, this.y, this.w, this.h);

	for(var i = 0; i < this.lines.length; i++) {
		this.lines[i].draw(ctx);
	}
}

Square.prototype.checkIfClicked = function() {
	if(this.hover && this.movable) {
		this.click = true;
	}
}


//*************************************************************************************************************************************************
//*********************************************************************** LINES *******************************************************************
//*************************************************************************************************************************************************
function Line(parent, x, y, w, h) {
	Element.call(this, x, y, w, h);

	this.parent = parent;
	this.fillStyle = "black";
}

Line.prototype = new Element();
Line.prototype.constructor = Line;

Line.prototype.isMouseOverThis = function(x, y) {
	var margin = 4;
	if(x >= this.x-margin && x < this.x + this.w+margin && y >= this.y-margin && y < this.y + this.h+margin) {
		this.hover = true;
		return true;
	}
	this.hover = false;
	return false;
}

Line.prototype.update = function() {
}

Line.prototype.draw = function(ctx) {
	ctx.strokeStyle = this.fillStyle;
	ctx.strokeRect(this.x, this.y, this.w, this.h);
}

//*************************************************************************************************************************************************
//*********************************************************************** ENGINE ******************************************************************
//*************************************************************************************************************************************************
function Engine(ctx) {
	this.click = null;
	this.ctx = ctx;
	this.w = 0;
	this.h = 0;
	this.cropBox = null;

	this.click = null;
	this.mouse = null;
	this.mouseOld = null;
	this.mouseDown = false;
	this.mouseUp = false;
	this.mouseUpEvent = false;
	this.mouseDownEvent = false;
}

Engine.prototype.start = function() {
	this.w = this.ctx.canvas.width;
	this.h = this.ctx.canvas.height;
	this.startInput();

	this.cropBox = new Square(10, 10, 50, 50);

	console.log("Engine started");
	//start the engine loop that does not stop until the app is terminated
	var that = this;
	(function gameLoop() {
		that.loop();
		requestAnimFrame(gameLoop, that.ctx.canvas);
	})();
}

//All the custom input that is used by html to interact with the canvas
Engine.prototype.startInput = function() {
	var getXandY = function(e) {
		var x =  e.clientX - that.ctx.canvas.getBoundingClientRect().left;
		var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
		return {x: x, y: y};
	}
	
	var that = this;
	
	this.ctx.canvas.addEventListener("click", function(e) {
		that.click = getXandY(e);
		e.stopPropagation();
		e.preventDefault();
	}, false);

	this.ctx.canvas.addEventListener("mousemove", function(e) {
		that.mouse = getXandY(e);
	}, false);
	
	this.ctx.canvas.addEventListener("mousedown", function(e) {
		that.mouseDownEvent = true;
		that.mouseDown = true;
		that.mouseOld = that.mouse;
	}, false);	
	
	this.ctx.canvas.addEventListener("mouseup", function(e) {
		that.mouseDown = false;
		that.mouseUpEvent = true;
		that.mouseOld = null;
	}, false);
}

Engine.prototype.draw = function() {
	this.ctx.clearRect(0, 0, this.w, this.h);

	this.ctx.drawImage(ASSET_MANAGER.getAsset('img/image1.jpg'), 20, 20);

	this.cropBox.draw(this.ctx);
}

Engine.prototype.update = function() {

	if(this.mouseDownEvent) {
		this.cropBox.checkIfClicked();
	}

	if(this.mouseUpEvent) {
		this.cropBox.clearClicks();
	}

	if(this.mouse) {
		this.cropBox.isMouseOverThis(this.mouse.x, this.mouse.y);
	}

	//if the mouse has been clicked and has moved
	if(this.mouseOld && this.mouse != this.mouseOld) {
		var mouseMovedByX = this.mouseOld.x - this.mouse.x;
		var mouseMovedByY = this.mouseOld.y - this.mouse.y;

		if(this.cropBox.click) {
			this.cropBox.addXAndY(-mouseMovedByX, -mouseMovedByY);
		}

		this.mouseOld = this.mouse;
	}

	this.cropBox.update();
}

Engine.prototype.loop = function() {
	this.update();
	this.draw();

	this.click = null;
	this.mouseDown = false;
	this.mouseUp = false;
	this.mouseUpEvent = false;
	this.mouseDownEvent = false;
}

//***************************************************************************************************

window.requestAnimFrame = (function() {
	  return  window.requestAnimationFrame       ||
			  window.webkitRequestAnimationFrame ||
			  window.mozRequestAnimationFrame    ||
			  window.oRequestAnimationFrame      ||
			  window.msRequestAnimationFrame     ||
			  function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			  };
})();

var canvas, ctx, engine, ASSET_MANAGER;

function start() {
	canvas = document.getElementById('surface');
	ctx = canvas.getContext('2d');
	engine = new Engine(ctx);

	ASSET_MANAGER = new AssetManager();

	ASSET_MANAGER.queueDownload('img/image1.jpg');

	ASSET_MANAGER.downloadAll(function() {
		engine.start();
	});
}