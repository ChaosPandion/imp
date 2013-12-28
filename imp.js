/// <reference path="jquery-1.8.2.js" />

// version 1.1



(function ($, window, document, undefined) {

    function Color(r, g, b, a) {
        /// <summary>Represents and RGBA color.</summary>
        /// <param name='r' type='Number'>The red component of this color.</param>
        /// <param name='g' type='Number'>The green component of this color.</param>
        /// <param name='b' type='Number'>The blue component of this color.</param>
        /// <param name='a' type='Number'>The alpha transparency component of this color.</param>
        /// <field name='a' type='Number'>The red component of this color.</field>
        /// <field name='g' type='Number'>The green component of this color.</field>
        /// <field name='b' type='Number'>The blue component of this color.</field>
        /// <field name='a' type='Number'>The alpha transparency component of this color.</field>

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    Color.prototype.toString = function () {
        return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
    };

    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    function Vector2D(x, y) {
        /// <summary>Represents a 2D vector.</summary>
        /// <param name='x' type='Number'>The x component of this vector.</param>
        /// <param name='y' type='Number'>The y component of this vector.</param>
        /// <field name='x' type='Number'>The x component of this vector.</field>
        /// <field name='y' type='Number'>The y component of this vector.</field>
        this.x = x;
        this.y = y;
    }

    Vector2D.prototype.plus = function (other) {
        /// <signature>
        ///   <param name='other' type='Vector2D' />
        /// </signature>
        return new Vector2D(this.x + other.x, this.y + other.y);
    };

    Vector2D.prototype.minus = function (other) {
        /// <signature>
        ///   <param name='other' type='Vector2D' />
        /// </signature>
        return new Vector2D(this.x - other.x, this.y - other.y);
    };

    function fillRectangle(ctx, pos, size, fill) {
        /// <signature>
        ///   <param name='ctx' type='CanvasRenderingContext2D' />
        ///   <param name='pos' type='Vector2D' />
        ///   <param name='size' type='Vector2D' />
        ///   <param name='fill' type='Color' />
        /// </signature>
        
        ctx.save();
        ctx.fillStyle = fill.toString();
        ctx.fillRect(pos.x, pos.y, size.x, size.y);
        ctx.restore();
    }

    function fillTriangle(ctx, pos, size, degrees, fill) {
        /// <signature>
        ///   <param name='ctx' type='CanvasRenderingContext2D' />
        ///   <param name='pos' type='Vector2D' />
        ///   <param name='size' type='Vector2D' />
        ///   <param name='degrees' type='Number' />
        ///   <param name='fill' type='Color' />
        /// </signature>

        var halfWidth = new Vector2D(size.x / 2, 0);
        var halfHeight = new Vector2D(0, size.y / 2);
        var pMinus = pos.minus(halfHeight);
        var a = pos.plus(halfHeight);
        var b = pMinus.plus(halfWidth);
        var c = pMinus.minus(halfWidth);

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(-toRadians(degrees));
        ctx.translate(-pos.x, -pos.y);
        ctx.fillStyle = fill.toString();
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(a.x, a.y);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }


    $.fn.imp = function (options) {

        this.css('border', '4px inset #9b9b9b');
        this.css('background-color', '#494949');

        var self = this;

        var images = options.images;

        var index = 0;

        /// <var type='HTMLCanvasElement' />
        var canvas = this.get(0);

        /// <var type='Context2D' />
        var ctx = canvas.getContext('2d');

        var fillStyle = 'rgba(128,128,128,0.3)';
        var arrowFillStyle = 'rgba(0,0,0,1)';

        var leftXBounded = false,
            rightXBounded = false,
            yBounded = false,
            mouseX = 0,
            mouseY = 0;

        var currentImage;
        var offset = self.offset(),
            height = canvas.height,
            width = canvas.width;
        var clickableWidth = width / 10;

        function setImage() {
            currentImage = images[index];
            offset = self.offset();
            height = canvas.height;
            width = canvas.width;
            clickableWidth = width / 10;
        }


        function clear() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            self.css('cursor', 'auto');
        }

        var rectangleSize = new Vector2D(clickableWidth, height),
            rectangleFill = new Color(128, 128, 128, 0.3),
            arrowSize = new Vector2D(40, 20),
            arrowFill = new Color(0, 0, 0, 1);
        function drawLeft() {
            fillRectangle(ctx, new Vector2D(0, 0), rectangleSize, rectangleFill);
            fillTriangle(ctx, new Vector2D(clickableWidth / 2, canvas.height / 2), arrowSize, 270, arrowFill);
            self.css('cursor', 'pointer');
        }
        function drawRight() {
            fillRectangle(ctx, new Vector2D(width - clickableWidth, 0), rectangleSize, rectangleFill);
            fillTriangle(ctx, new Vector2D(canvas.width - clickableWidth / 2, canvas.height / 2), arrowSize, 90, arrowFill);
            self.css('cursor', 'pointer');
        }

        function checkBounds() {
            leftXBounded = mouseX > offset.left && mouseX < offset.left + clickableWidth;
            rightXBounded = mouseX > offset.left + width - clickableWidth && mouseX < offset.left + width;
            yBounded = mouseY >= offset.top && mouseY <= offset.top + height;
        }

        function draw() {
            setImage();
            clear();
            ctx.drawImage(images[index], 0, 0, canvas.width, canvas.height);
            checkBounds();
            if (yBounded) {
                if (leftXBounded) {
                    drawLeft();
                }
                if (rightXBounded) {
                    drawRight();
                }
            }
        }

        $(document).bind('mousemove', function (e) {
            mouseX = e.pageX;
            mouseY = e.pageY;
        });

        self.click(function (e) {
            mouseX = e.pageX;
            mouseY = e.pageY;
            checkBounds();
            if (yBounded) {
                if (leftXBounded) {
                    index--;
                    if (index < 0)
                        index = 0;
                }
                if (rightXBounded) {
                    index++;
                    if (index >= images.length)
                        index = images.length - 1;
                }
            }
        });

        for (var i = 0, len = images.length; i < len; i++) {
            var img = document.createElement("img");
            img.src = images[i];
            images[i] = img;
        }

        setInterval(draw, 33.333);
        
        return this;
    };
}(jQuery, window, document));