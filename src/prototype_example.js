window.onload = function() {
    
    // the Plant constructor
    function Plant() {
        this.country = "mexico";
        this.isOrganic =  true;
    }
    
    // set the Plant prototype property
    Plant.prototype = {
        showNameAndColor: function () {
            console.log('I am a ' + this.name + ' and my color is ' + this.color);
        },
        amIOrganic:  function() {
            if(this.isOrganic) {
                console.log('I am organic, baby!');
            }
        }
    }
    
    function Fruit(fruitName, fruitColor) {
        this.name = fruitName;
        this.color = fruitColor;
    }
    
    // set the fruit prototype to plant constructor
    Fruit.prototype = new Plant();
    
    // create new object with the fruit constructor
    var banana = new Fruit('pisang', 'yellow');
    
    console.log(banana.name);
    console.log(banana.color);
    banana.showNameAndColor();
    banana.amIOrganic();
    
    
    
    
}