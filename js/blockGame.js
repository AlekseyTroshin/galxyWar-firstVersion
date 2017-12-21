
function BlockGame(pos, size, color, yourStranger, direction) {
    this.pos = pos;
    this.size = size;
    this.color = color;
    this.yourStranger = yourStranger;
    this.direction = direction;
};

BlockGame.prototype = {

    render: function(ctx) {

        let x = this.pos[0];
        let y = this.pos[1];

        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, this.size[0], this.size[1]);
    }
};
