/**
 * hud.js
 *
 * Copyright (c) 2013 Petar Petrov
 *
 * This work is licensed under the Creative Commons Attribution-NoDerivs 3.0 Unported License. 
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/3.0/.
 */

game.HUD = game.HUD || {};

game.HUD.Container = me.ObjectContainer.extend({

    init: function(eventHandler) {
        // call the constructor
        this.parent();
        
        // persistent across level change
        this.isPersistent = true;
        
        // non collidable
        this.collidable = false;
        
        // make sure our object is always draw first
        this.z = _Globals.gfx.zHUD;

        // give a name
        this.name = "HUD";

        // (default) event handler 
        this.eventHandler = eventHandler;

        // background
        this.width = 505;
        this.height = 150;
        this.cx = _Globals.canvas.width / 2 - this.width / 2;
        this.cy = _Globals.canvas.height / 2 - this.height / 2;
        this.endx = this.cx + this.width;
        this.endy = this.cy + this.height;
        this.xcenter = this.cx +  this.width / 2;
        this.ycenter = this.cy +  this.height / 2;

        this.imageBackground = new me.SpriteObject(this.cx, this.cy, me.loader.getImage('dialog'));
        this.addChild(this.imageBackground);

        // wizard face
        var slot = "slot_empty";
        switch(game.session.wizard) {
            case _Globals.wizards.Earth:
            slot = 'slot_earth';
            break;
            case _Globals.wizards.Water:
            slot = 'slot_water';
            break;
            case _Globals.wizards.Fire:
            slot = 'slot_fire';
            break;
            case _Globals.wizards.Air:
            slot = 'slot_air';
            break;
        }
        this.imageFaceSlot = new me.SpriteObject(this.cx - 50, this.cy - 50, me.loader.getImage(slot));
        this.imageFaceSlot.z =  _Globals.gfx.zHUD + 1;
        this.addChild(this.imageFaceSlot);

        this.iconWidth = 64;
        this.iconHeight = 64;
    },

    // Propagate UI event to handler
    onEvent: function(name) {
        if (this.eventHandler) {
            console.log(name);
            this.eventHandler[name].call(this.eventHandler, Array.prototype.slice.call(arguments, 1));
        }
    }
});
/**
 * Clickable UI element
 */
game.HUD.Clickable = me.GUI_Object.extend({   
    init: function(x, y, settings) {
        settings = settings || {};
        settings.image = settings.image || "button_empty";
        settings.spritewidth = 64;
        settings.spriteheight = 64;
        this.parent(x, y, settings);
        this.z = _Globals.gfx.zHUD + 1;
        this.handler = settings.onClick;
    },
    onClick: function(event) {
        this.handler && this.handler(event);
        // don't propagate the event
        return false;
    }
});
/**
 * Clickable Animation UI element
 */
game.HUD.ClickableAnimation = me.AnimationSheet.extend({
    init: function(x, y, settings, container) {
        this.parent(x, y, me.loader.getImage(settings.image), 64);
        
        this.handler = settings.onClick;
        this.animationspeed = settings.speed || 2412;
        this.z = _Globals.gfx.zHUD + 5;

        this.fadeout = settings.fadeout || false;
        this.fadeoutspeed = settings.fadeoutspeed || 0.035;
        this.blend = false;

        var parent = this;
        /**
         * We got a lil' hack here due to the fact that clickable animations are not available
         * in MelonJS, yet. So, simply draw a clickable GUI_Object behind the animation. :)
         */
        var dummyClickable = new game.HUD.Clickable(x, y, {
            image: 'button_ok',
            onClick: function(event) {
                container.removeChild(this);
                if (parent.fadeout === true) {
                    parent.blend = true;
                    parent.animationpause = true;
                } else {
                   parent.handler && parent.handler(event); 
                }
            }
        });
        /**
         * Important: This will not be visible to the caller!
         * We rely on the dummyClickable.onClick() to clean it up from the container.
         */
        container.addChild(dummyClickable);
    },
    update: function() {
        this.parent();
        /**
         * Notify caller that animation has been clicked only
         * after the fadeout post animation completes.
         */
        if (this.blend) {
            this.alpha -= this.fadeoutspeed;
            if (this.alpha <= 0) {
                this.alpha = 0;
                this.visible = false;
                this.blend = false;
                this.handler && this.handler(); // XXX: no handler
            }
        }
        return true;
    }
});
/**
 * Dialog: Select Chance or Spell dialog
 */
game.HUD.SelectMove = game.HUD.Container.extend({
    init: function(eventHandler) {
        this.parent(eventHandler);

        var parent = this;

        this.addChild(
            new game.HUD.Clickable(this.cx + this.iconWidth * 2, this.cy + this.iconHeight / 2, {
                image: 'icon_chance',
                onClick: function(event) {
                    parent.onEvent('onSelectDice');
                }
            }));
        this.addChild(
            new game.HUD.Clickable(this.endx - this.iconWidth * 3, this.cy + this.iconHeight / 2, {
                image: 'icon_spell',
                onClick: function(event) {
                    parent.onEvent('onSelectSpell');
                }
            }));

        // this.visible = false;
    }
});
/**
 * Dialog: Throw dice 
 */
game.HUD.ThrowDice = game.HUD.Container.extend({
    init: function(eventHandler) {
        this.parent(eventHandler);

        var parent = this;
        var dx = this.xcenter - this.iconWidth / 2;
        var dy = this.ycenter - this.iconHeight / 2;

        this.diceAnim = new game.HUD.ClickableAnimation(dx, dy, {
            image: 'dice',
            fadeout: true,
            onClick: function(event) {
                parent.diceAnim.animationpause = true;
                console.log('clicked!');
            }
        }, parent);

        this.addChild(this.diceAnim);
    }
});
/**
 * Dialog: Select spell
 */
game.HUD.SelectSpell = game.HUD.Container.extend({
    init: function(eventHandler) {
        this.parent(eventHandler);

        var parent = this;
        var spells = [
            {
                image: 'icon_spell_abyss', 
                notify: function() {parent.onEvent('onCastSpell', _Globals.spells.Abyss); }
            },
            {
                image: 'icon_spell_change', 
                notify: function() {parent.onEvent('onCastSpell', _Globals.spells.Change); }
            },
            {
                image: 'icon_spell_clay', 
                notify: function() {parent.onEvent('onCastSpell', _Globals.spells.Clay); }
            },
        ];

        var special;
        switch(game.session.wizard) {
            case _Globals.wizards.Earth:
            special = {
                image: 'icon_spell_path',
                notify: function() {parent.onEvent('onCastSpell', _Globals.spells.Path); }
            };
            break;
            case _Globals.wizards.Water:
            special = {
                image: 'icon_spell_blind',
                notify: function() {parent.onEvent('onCastSpell', _Globals.spells.Blind); }
            };
            break;
            case _Globals.wizards.Fire:
            special = {
                image: 'icon_spell_freeze',
                notify: function() {parent.onEvent('onCastSpell', _Globals.spells.Freeze); }
            };
            break;
            case _Globals.wizards.Air:
            special = {
                image: 'icon_spell_teleport',
                notify: function() {parent.onEvent('onCastSpell', _Globals.spells.Teleport); }
            };       
            break;
        }
        spells.push(special);                

        var startx = this.cx + this.iconWidth;

        for(var i = 0; i < spells.length; i++) {
            this.addChild(
                new game.HUD.Clickable(startx, this.cy + this.iconHeight / 2, {
                    image: spells[i].image,
                    onClick: spells[i].notify
                }));
            startx += this.iconWidth + 4;
        }
    }
});