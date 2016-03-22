window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame   ||
  window.mozRequestAnimationFrame      ||
  window.oRequestAnimationFrame        ||
  window.msRequestAnimationFrame       ||
  function(/* function */ callback, /* DOMElement */ element){
    window.setTimeout(callback, 1000 / 60);
  };
})();

(function() {
  var Game = function(canvasId) {
    var self = this;
    var canvas = document.getElementById(canvasId);
    canvas.setAttribute('height', 720);
    canvas.setAttribute('width', 720);
    canvas.oncontextmenu = function (e) {
		  e.preventDefault();
		};
    canvas.addEventListener('mousedown', function(e) {
      //console.log(e);
    }, false);
    canvas.addEventListener('mouseup', function(e) {
      var arr = [];
      for (var i = 0; i < 8; i++) {
        for (var j = 0; j< 8; j++) {
          var x1 = i * 80 + 75;
          var y1 = j * 80 + 75;
          arr.push({x: x1, y: y1});
        }
      }
      //console.log(e.clientX, e.clientY);
      var goodClick = arr.filter(function(elem){
        return (((elem.x - e.clientX > -25 ) && (elem.x - e.clientX < -5)) &&
                ((elem.y - e.clientY > -25) && (elem.y - e.clientY < -5)));
      }).length === 1;
      
      var field = {
        x: Math.floor(e.clientX / 80),
        y: Math.floor(e.clientY / 80)
      };
      self.debugDiv.children[0].innerHTML = "Click Position: " + field.x + ":" + field.y;
      if (e.which === 1 && goodClick) {
        white.placeWall("horizontal",field)
      } else if (e.which === 3 && goodClick) {
        white.placeWall("vertical",field)
      }
     }, false);
    this.debugDiv = document.getElementById("debug");
    var screen = canvas.getContext('2d');
    var gameSize = { x: canvas.width, y: canvas.height };
    this.walls = [];
    this.bodies = [
      new Board(this),
      new Player(this, "black", {x:4,y:0}),
      new Player(this, "white", {x:4,y:8})
    ];
    this.walls = this.bodies.filter(this.isWall);

    //OMG global vars ! run away!
    black = this.bodies[1]; //player 1
    white = this.bodies[2]; //player 2
    
    black.move("forward")
    black.move("forward")
    black.move("forward")
    white.move("forward")
    white.move("forward")
    white.move("forward")
    white.move("forward")
    
    //main game loop
    var loop = function() {
      self.update();
      self.draw(screen,gameSize);
      window.requestAnimFrame(loop);
    };

    loop();
  };

  Game.prototype = {
    update: function() {
      this.bodies.map(function (i) { i.update(); });
      this.debugDiv.children[2].innerHTML = "white walls: " + this.bodies[2].numWalls;
      this.debugDiv.children[4].innerHTML = "black walls: " + this.bodies[1].numWalls;
    },
    draw: function(screen, gameSize) {
      //clear screen
      screen.clearRect(0,0,gameSize.x, gameSize.y);
      //draw all bodies
      for (var i = 0; i < this.bodies.length; i++) {
        this.bodies[i].draw(screen);
      }
    },
    addBody: function(body) {
      return this.bodies.push(body);
    },
    removeBody: function(body) {
      return this.bodies.splice(this.bodies.indexOf(body), 1);
    },
    isWall: function(item){
        return item.type === "horizontal" || item.type === "vertical";
    },
    noWallsOnPath: function(player, dir){
      if (player.team === "white") {
        switch(dir) {
          case "forward":
            return player.game.getWalls().filter(function(wall) {
              return wall.type === "horizontal" &&
                (wall.pos.x === player.getPlayer().pos.x || wall.pos.x === player.getPlayer().pos.x - 1) &&
                 wall.pos.y === player.getPlayer().pos.y - 1;
            }).length === 0;
          case "back":
            return player.game.getWalls().filter(function(wall) {
              return wall.type === "horizontal" &&
                (wall.pos.x === player.getPlayer().pos.x || wall.pos.x === player.getPlayer().pos.x - 1) &&
                wall.pos.y === player.getPlayer().pos.y;
            }).length === 0;
          case "left":
            return player.game.getWalls().filter(function(wall) {
              return wall.type === "vertical"   &&
                (wall.pos.y === player.getPlayer().pos.y || wall.pos.y === player.getPlayer().pos.y - 1) &&
                 wall.pos.x === player.getPlayer().pos.x - 1;
            }).length === 0;
          case "right":
            return player.game.getWalls().filter(function(wall) {
              return wall.type === "vertical"   &&
                (wall.pos.y === player.getPlayer().pos.y || wall.pos.y === player.getPlayer().pos.y - 1) &&
                wall.pos.x === player.getPlayer().pos.x;
            }).length === 0;
          default:
            break;
        }
      } else if (player.team === "black") {
        switch(dir) {
          case "forward":
            return player.game.getWalls().filter(function(wall) {
              return wall.type === "horizontal" &&
                (wall.pos.x === player.getPlayer().pos.x || wall.pos.x === player.getPlayer().pos.x - 1) &&
                 wall.pos.y === player.getPlayer().pos.y;
            }).length === 0;
          case "back":
            return player.game.getWalls().filter(function(wall) {
              return wall.type === "horizontal" &&
                (wall.pos.x === player.getPlayer().pos.x || wall.pos.x === player.getPlayer().pos.x - 1) &&
                 wall.pos.y === player.getPlayer().pos.y -1;
            }).length === 0;
          case "left":
            return player.game.getWalls().filter(function(wall) {
              return wall.type === "vertical"   &&
               (wall.pos.y === player.getPlayer().pos.y || wall.pos.y === player.getPlayer().pos.y - 1) &&
                wall.pos.x === player.getPlayer().pos.x - 1;
            }).length === 0;
          case "right":
            return player.game.getWalls().filter(function(wall) {
              return wall.type === "vertical"   &&
               (wall.pos.y === player.getPlayer().pos.y || wall.pos.y === player.getPlayer().pos.y - 1) &&
                wall.pos.x === player.getPlayer().pos.x;
             }).length === 0;
          default:
            break;
        }
      }
    },
    noWallAtPos: function(walls,type,pos){
      var positions = walls.map(function(wall){return wall.getWall();});
      return positions.filter(function(i){
          if (type === "horizontal" && i.type === "vertical") {
            return (i.pos.y === pos.y &&
                   (i.pos.x - pos.x === 0));
          } else if (type === "vertical" && i.type === "horizontal") {
             return (i.pos.x === pos.x &&
                    (i.pos.y - pos.y === 0));
          } else if (type === i.type && type === "horizontal") {
             return ((i.pos.y === pos.y && i.pos.x === pos.x) ||
                    (i.pos.y === pos.y && i.pos.x - pos.x === 1) ||
                    (i.pos.y === pos.y && i.pos.x - pos.x === -1));
          } else if (type === i.type && type === "vertical") {
             return ((i.pos.x === pos.x && i.pos.y === pos.y) ||
                    (i.pos.x === pos.x && i.pos.y - pos.y === 1) ||
                    (i.pos.x === pos.x && i.pos.y - pos.y === -1));
          }
        }).length === 0;
    },
    willBeOnBoard: function(player,dir) {
      if (player.team === "white"){
        switch (dir) {
          case 'forward':
            return player.pos.y - 1 !== -1;
          case 'back':
            return player.pos.y + 1 !== 9;
          case 'left':
            return player.pos.x - 1 !== -1;
          case 'right':
            return player.pos.x + 1 !== 9;
        }
      } else if (player.team === "black") {
        switch (dir) {
          case 'forward':
            return player.pos.y + 1 !== 9;
          case 'back':
            return player.pos.y - 1 !== -1;
          case 'left':
            return player.pos.x - 1 !== -1;
          case 'right':
            return player.pos.x + 1 !== 9;
        }
      }
    },
    getWalls: function() {
      return this.walls.map(
        function(i){
          return {
            pos: {
              x: i.getWall().pos.x,
              y: i.getWall().pos.y
            },
            type: i.type
          };
        }
      );
    },
    getPlayers: function() {
      return {
        black: this.bodies[1],
        white: this.bodies[2]
      };
    }
  };

  var Board = function(game) {
    this.game = game;
    this.size = {x:9,y:9};

  };

  Board.prototype = {
    update: function () {
      //nothing atm...
    },
    draw: function(screen) {
      for (var i = 0; i < this.size.x; i++) {
        for (var j = 0; j< this.size.y; j++) {
          var x = i * 80 + 5;
          var y = j * 80 + 5;
          var dispX = i + 1;
          var dispY = j + 1;
          screen.fillStyle = "#aaa";
          screen.fillRect(x, y, 70, 70);
          screen.fillStyle = "#000";
          screen.font = "14px serif";
          screen.fillText(dispX + "," + dispY, x+50, y+68);
        }
      }
      
      for (var i = 0; i < this.size.x -1; i++) {
        for (var j = 0; j< this.size.y -1; j++) {
          var x1 = i * 80 + 72.5;
          var y1 = j * 80 + 72.5;
          screen.fillStyle = "rgba(125,180,125,0.85)";
          screen.fillRect(x1,y1,15,15);
          
        }
      }
    }
  };

  var Player = function(game,team,pos) {
    this.team = team;
    this.pos = pos;
    this.game = game;
    this.numWalls = 8;
  };

  Player.prototype = {
    update: function() {
      //nothing atm...
    },
    draw: function(screen){
      var offset = 20;
      var width = 80;
      if(this.team === "white"){
        screen.fillStyle = "#fff";
        screen.fillRect(this.pos.x * width + offset, this.pos.y  * width + offset, 40, 40);
      }
      if(this.team === "black"){
        screen.fillStyle = "#000";
        screen.fillRect(this.pos.x * width + offset, this.pos.y   * width + offset, 40, 40);
      }
    },
    move: function(dir) {
      if (this.game.noWallsOnPath(this,dir) && this.game.willBeOnBoard(this,dir)){
        if (this.team === "black") {
          var oponent = this.game.bodies[2];
          if(dir === "forward") {
            if(this.pos.y + 1 === oponent.pos.y && this.pos.x === oponent.pos.x ){
              this.pos.y = this.pos.y + 2;
            } else {
              this.pos.y = this.pos.y + 1;
            }
          } else if (dir === "back") {
            if(this.pos.y - 1 === oponent.pos.y && this.pos.x === oponent.pos.x ) {
              this.pos.y = this.pos.y - 2;
            } else {
              this.pos.y = this.pos.y - 1;
            }
          } else if (dir === "left") {
            if (this.pos.x -1 === oponent.pos.x  && this.pos.y === oponent.pos.y){
              this.pos.x = this.pos.x - 2;  
            } else {
              this.pos.x = this.pos.x - 1;
            }
          } else if (dir === "right") {
            if(this.pos.x + 1 === oponent.pos.x && this.pos.y === oponent.pos.y) {
              this.pos.x = this.pos.x + 2;
            } else {
              this.pos.x = this.pos.x + 1;
            }
          }
        } else if (this.team === "white"){
          var oponent = this.game.bodies[1];
          
           if(dir === "forward") {
            if(this.pos.y - 1 === oponent.pos.y && this.pos.x === oponent.pos.x ){
              this.pos.y = this.pos.y - 2;
            } else {
              this.pos.y = this.pos.y - 1;
            }
           } else if (dir === "back") {
             if(this.pos.y + 1 === oponent.pos.y && this.pos.x === oponent.pos.x ) {
              this.pos.y = this.pos.y + 2;
            } else {
              this.pos.y = this.pos.y + 1;
            }
           } else if (dir === "left") {
              if (this.pos.x - 1 === oponent.pos.x  && this.pos.y === oponent.pos.y){
                this.pos.x = this.pos.x - 2;  
              } else {
                this.pos.x = this.pos.x - 1;
              }
           } else if (dir === "right") {
              if(this.pos.x + 1 === oponent.pos.x && this.pos.y === oponent.pos.y) {
                this.pos.x = this.pos.x + 2;
              } else {
                this.pos.x = this.pos.x + 1;
              }
           }
         }
         return true;
       } else {
         console.log("Hey! "+ this.team + " You can't go there!");
         return false;
       }
    },

    placeWall: function(type,pos) {
      if (this.game.noWallAtPos(this.game.walls,type,pos) && this.numWalls > 0){
        if (type === "vertical"){
          pos.y = pos.y - 1;
          if ((pos.y < 8 && pos.y >= 0) && pos.x < 9){
            this.game.addBody(new Wall(type,pos));
            this.game.walls = this.game.bodies.filter(this.game.isWall);
            this.numWalls -= 1;
          }
        } else if (type === "horizontal") {
          pos.x = pos.x - 1;
          if ((pos.x < 8 && pos.x >= 0) && pos.y < 9){
            this.game.addBody(new Wall(type,pos));
            this.game.walls = this.game.bodies.filter(this.game.isWall);
            this.numWalls -= 1;
          }          
        }
        
        //console.log('walls positions',this.game.walls.map(function(i){return i.getWall();}));
        
        return true;
      } else {
        if(this.numWalls === 0){
          console.log("you used all your walls!");
        } else {
          console.log('there is already a wall there');
        }

        return false;
      }
    },
    getPlayer: function(){
      return {
        pos: {x: this.pos.x + 1, y: this.pos.y + 1},
        team: this.team
      };
    }
  };

  var Wall = function(type,pos) {
    this.type = type;
    this.pos = pos;
  };

  Wall.prototype = {
    update: function(){
      //nothing atm...
    },
    draw: function(screen) {
      var offset = 5; // half of the space between squares
      var width = 80;
      if(this.type === "horizontal") {
        screen.fillStyle = "#641";
        screen.fillRect(this.pos.x*width+offset,this.pos.y*width-offset,150,10);
      }
      if(this.type === "vertical") {
        screen.fillStyle = "#641";
        screen.fillRect(this.pos.x*width-offset,this.pos.y*width+offset,10,150);
      }
    },
    getWall: function() {
      if(this.type === "vertical"){
        return {
          pos: {x: this.pos.x, y: this.pos.y + 1},
          type: this.type
        };
      } else if (this.type === "horizontal") {
        return {
          pos: {x: this.pos.x + 1, y: this.pos.y},
          type: this.type
        };
      } else {
        return false;
      }
    }
  };

  window.onload = function() {
    new Game('screen');
  };
}());