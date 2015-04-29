window.onload = function() {	
	var game = new Phaser.Game(640, 480, Phaser.CANVAS);
	var hero;
	var heroGravity = 800;
	var heroJumpPower;    
	var score=0;
	var scoreText;
    var topScore;
    var powerBar;
    var powerTween;
    var Pole;
    var placedPoles;
	var poleGroup; 
     var minPoleGap = 100;
     var maxPoleGap = 300; 
     var heroJumping;
     var heroFallingDown;     
     var play = function(game){}     
     play.prototype = {
		preload:function(){
			game.load.image("hero", "assets/ninja.png"); 
			game.load.image("pole", "assets/pole.png");
               game.load.image("powerbar", "assets/powerbar.png");
		},
		create:function(){
			heroJumping = false;
			heroFallingDown = false;
			score = 0;
			placedPoles = 0;
			poleGroup = game.add.group();
			topScore = localStorage.getItem("topFlappyScore")==null?0:localStorage.getItem("topFlappyScore");
			scoreText = game.add.text(10,10,"-",{
				font:"bold 16px Arial"
			});
			updateScore();
			game.stage.backgroundColor = "#87CEEB";
			game.physics.startSystem(Phaser.Physics.ARCADE);
			hero = game.add.sprite(80,0,"hero");
			hero.anchor.set(0.5);
			hero.lastPole = 1;
			game.physics.arcade.enable(hero);              
			hero.body.gravity.y = heroGravity;
			
			// create an input for the game
			// on mouse down, call the prepare to jump function on this object
			game.input.onDown.add(prepareToJump, this);
			// tambahkan pole (tempat hero landing)
			addPole(80);
		},
		update:function(){
			game.physics.arcade.collide(hero, poleGroup, checkLanding);
			if(hero.y>game.height){
				// die();
			}
		}
	}    
	
    game.state.add("Play",play);
    game.state.start("Play");
	function updateScore(){
		scoreText.text = "Score: "+score+"\nBest: "+topScore;
	}
	
	
    
	// Pole object prototype 
	Pole = function (game, x, y) {
		Phaser.Sprite.call(this, game, x, y, "pole");                           // buat pole sprite untuk object ini
		game.physics.enable(this, Phaser.Physics.ARCADE);                       // apply hukum fisika utk pole object
          this.body.immovable = true;                                           //  pole tidak bisa bergerak
          this.poleNumber = placedPoles;                                        // jumlah pole tergantung variable placedPole
	};
	
	Pole.prototype = Object.create(Phaser.Sprite.prototype);                    // buat Phaser.Sprite.prototype
	Pole.prototype.constructor = Pole;                                          // buat pole constructor
	Pole.prototype.update = function() {                                        // update prototype
          if(heroJumping && !heroFallingDown){                                  // jika hero jumping = true dan heroFallingDown = false
              this.body.velocity.x = heroJumpPower;
          }
          else{
              this.body.velocity.x = 0
          }
		if(this.x < -this.width){
			this.destroy();
			addNewPoles();
		}
	}
	
	// tambahkan Pole
	function addPole(poleX){
		if(poleX < game.width * 2 ){                                                    // jika nilai parameter poleX < lebar canvas * 2
			placedPoles++;                                                              // placedPole + 1
			var pole = new Pole(game, poleX, game.rnd.between(250,380));                // buat object Pole baru (lihat inisiasi pole pada line 100)
			game.add.existing(pole);                                                    // tambahkan new pole pada screen
	        pole.anchor.set(0.5,0);                                                   // 
			poleGroup.add(pole);
			var nextPolePosition = poleX + game.rnd.between(minPoleGap,maxPoleGap);     // set pole next position 
			addPole(nextPolePosition);                                                  // tambahkan pole baru (recursive)
		}
	}
	
	// prepare the hero to jump
	// sebelum loncat hero harus collect energi dulu
	// energi ini menentukan seberapa jauh loncatnya
	function prepareToJump(){
		if(hero.body.velocity.y == 0){                                  // check apakah hero gak lagi di awang-awang
	          powerBar = game.add.sprite(hero.x,hero.y-50,"powerbar");  // tampilkan powerbar diatas kepala hero
	          powerBar.width = 0;                                       // lebar powerbar awal = 0
	          powerTween = game.add.tween(powerBar).to({                // tambah lebar powerbar selama user memencet tombol
			   width:100                                                // maximal lebar powerbar = 100
			}, 1000, "Linear",true);                                    // maksimal power dapat dicapai dalam 1 detik / 1000 milisecond
	          game.input.onDown.remove(prepareToJump, this);            // remove prepareToJump event listener
	          game.input.onUp.add(jump, this);                          // jika mouse click dilepas, hero langsung loncat (panggil jump function)
          }        	
	}   
	
	// Jump!
    function jump(){                        
        heroJumpPower= -powerBar.width*3-100;                           // rumus kekuatan loncatan hero -> lebarPowerBar * 3 - 100
        powerBar.destroy();                                             // hilangkan powerbar
        game.tweens.removeAll();                                        // hilangkan semua tween
        hero.body.velocity.y = heroJumpPower*2;							// rumus jarak horizontal loncatan hero -> heroJumpPower*2
        heroJumping = true;                                             // set heroJumping state to true
        powerTween.stop();                                              // hentikan penambahan powerbar
        game.input.onUp.remove(jump, this);                             // remove event listener in this context
    } 

     function addNewPoles(){
     	var maxPoleX = 0;
		poleGroup.forEach(function(item) {
			maxPoleX = Math.max(item.x, maxPoleX)			
		});
		var nextPolePosition = maxPoleX + game.rnd.between(minPoleGap,maxPoleGap);
		addPole(nextPolePosition);			
	}
	
	function die(){
		localStorage.setItem("topFlappyScore",Math.max(score,topScore));	
		game.state.start("Play");
	}
	
	function checkLanding(n,p){
		if(p.y >= n.y+n.height/2){
			var border = n.x-p.x
			if(Math.abs(border)>20){
				n.body.velocity.x=border*2;
				n.body.velocity.y=-200;	
			}
			var poleDiff = p.poleNumber-n.lastPole;
			if(poleDiff>0){
				score+= Math.pow(2,poleDiff);
				updateScore();	
				n.lastPole= p.poleNumber;
			}
			if(heroJumping){
              	heroJumping = false;              
              	game.input.onDown.add(prepareToJump, this);
          	}
		}
		else{
			heroFallingDown = true;
			poleGroup.forEach(function(item) {
				item.body.velocity.x = 0;			
			});
		}			
	}
	
		
}