/**
 * tiles.js
 *
 * Copyright (c) 2013 Petar Petrov
 *
 * This work is licensed under the Creative Commons Attribution-NoDerivs 3.0 Unported License. 
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/3.0/.
 */

game.TileEntity = me.ObjectEntity.extend({
    
    init: function(x, y, settings) {
        settings.image = 'boardtileset';
        settings.spritewidth = 64;
        settings.spriteheight = 64;
        x *= 64;
        y *= 64;
        this.parent(x, y, settings);
        
        // setup animations
        this.renderable.animationspeed = 450; // + Math.random() * 200;
        this.renderable.addAnimation('earth', [0, 1, 2, 3, 4, 5, 6, 7]);
        this.renderable.addAnimation('water', [8, 9, 10, 11, 12, 13, 14, 15]);
        this.renderable.addAnimation('fire', [16, 17, 18, 19, 20, 21, 22, 23]);
        this.renderable.addAnimation('air', [24, 25, 26, 27, 28, 29, 30, 31]);
        this.renderable.setCurrentAnimation(settings.name);

    },

    update: function() {
        this.parent();
        return true;
    }

});