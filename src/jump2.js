/**
 *  Title       Jumper prototype 
 *  Author      Alfin Akhret alfin.akhret@gmail.com
 *  version     0.0.1  
 *  Year        2015
 *  License     MIT
 */
 
    var game = new Phaser.Game('75', '100', Phaser.AUTO, 'game');   // define game preset. W:75% H:100% Renderer:Auto parent element:#game
    var platforms; // this will contains group of poles
    var score;
    var hiScore;
    var heroGravity = 800; // set the hero gravity value
    var placedPoles;
    var minPoleGap = 100;
    var maxPoleGap = 300;
    var hero;
    var pole;
    var powerBar;
    var powerTween;
    var jumpPower;
    var jumping;
    
    // PROTOTYPING
    // 1. Play constructor
    var Play = function(game){}   // i have no idea what the purpose of this 'game' parameter yet. lets find out 
    
    // set the Play prototype properties
    Play.prototype = {                                                  
        // we need 3 state at minimum: preload, create, and update
        
        // load all assets required for the game
        preload: function() {
            game.load.image('sky', 'assets/sky.png');
            game.load.image('hero', 'assets/ninja.png');            // load the hero character
            game.load.image('pole', 'assets/pole2.png');             // load the pole object
            game.load.image('powerbar', 'assets/powerbar.png');     // load the powerbar
        },
        
        // set the initial game state here, like initial score
        // we also can place our preloaded object here
        create: function() {
            // initial score
            score = 0;
            hiScore = 0;
            
            // world creation
            game.physics.startSystem(Phaser.Physics.ARCADE);        // enabling ARCADE physics system
            platforms = game.add.group();                           // create a platform group. it will contains all the pole
            platforms.enableBody = true;                            // enable pyshics to any object created in this group
            game.stage.backgroundColor = "#36ebd9";                 // set the background color to blue
            
            hero = new Hero(game, 80, game.world.height - 120);
            hero.add();                                      
            pole = new Pole(game, 80, game.world.height - 64);
            pole.add();
            
            
            // hero action
            game.input.onDown.add(prepareToJump, this);             // set prepareToJump function to listen on pointer onDown event in this Play context
            
        },
        update: function() {
            game.physics.arcade.collide(hero, platforms);
        }
    }
    
    // 2. Hero Constructor 
	var Hero = function (game, x, y) {
	    this.xPos = x;
	    this.yPos = y;
	};
	Hero.prototype = Object.create(Phaser.Sprite.prototype);                    
    Hero.prototype.add = function() {
        Phaser.Sprite.call(this, game, this.xPos, this.yPos, "hero");
		game.physics.enable(this, Phaser.Physics.ARCADE);
		this.body.gravity.y = heroGravity;
		game.add.existing(this);                                                 
    }
    
    // 3. Pole constructor
    var Pole = function(game, x, y){
        this.xPos = x;
        this.yPos = y;
    };
    Pole.prototype = Object.create(Phaser.Sprite.prototype);
    Pole.prototype.add = function(){
        if(this.xPos < game.width * 2) {
            
            Phaser.Sprite.call(this, game, this.xPos, this.yPos, "pole");
            game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.immovable = true;
    		game.add.existing(this);
    		platforms.add(this);
    		var nextPolePosition = this.xPos + game.rnd.between(minPoleGap, maxPoleGap);
    		this.add(nextPolePosition);
    
        }
    }
    
    
    // set the game state to Play constructor
    game.state.add('Play', Play);
    // run the Play constructor
    // this will call the 3 function above: preload, create, and update
    game.state.start("Play");
    
    function prepareToJump(){
        // if hero is not in the air
        if(hero.body.velocity.y == 0){
            powerBar = game.add.sprite(hero.x, hero.y-20, "powerbar");
            powerBar.width = 0;
            powerTween = game.add.tween(powerBar).to({
                width:100
            }, 1000, "Linear", true);
            game.input.onDown.remove(prepareToJump, this);
            game.input.onUp.add(jump, this);
        }
    }

    function jump(){
        jumpPower = -powerBar.width * 3 - 100;
        powerBar.destroy();
        game.tweens.removeAll();
        hero.body.velocity.y = jumpPower * 2;
        jumping = true;
        powerTween.stop();
        game.input.onUp.remove(jump, this);
    }
    
