/// <reference path="jquery-1.8.2.js" />

// version 0.5.1


(function ($, window, document, undefined) {

    function Imp(){

    }

    Imp.frameRate = 30;
    Imp.msPerFrame = Imp.frameRate / 1000;

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

    Color.toRgbaString = function (r, b, g, a) {
        return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
    }

    Color.prototype.toString = function () {
        return Color.toRgbaString(this.r, this.b, this.g, this.a);
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

    Vector2D.zero = new Vector2D(0, 0);

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


    function AlphaFade(draw, initialAlpha, frameCount) {

        var framesRemaining = 0;
        var currentAlpha = initialAlpha;
        var targetAlpha = 0;
        var alphaDiff = 0;

        var self = this;
        Object.defineProperties(this, {
            visible: { get: function () { return currentAlpha > 0; } },
            fading: { get: function () { return framesRemaining > 0; } },
            targetAlpha: {
                get: function() { return targetAlpha; }, 
                set: function(value) {
                    targetAlpha = value;
                    framesRemaining = frameCount;
                    alphaDiff = (targetAlpha - currentAlpha) / frameCount;
                }
            },
            draw: { 
                value: function() {
                    if (framesRemaining > 0) {
                        framesRemaining--;
                        currentAlpha = Math.min(1, Math.max(0, currentAlpha + alphaDiff));
                    }
                    draw(currentAlpha);
                }
            }
        });
    }



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


    function alphaRectDraw(ctx, x, y, w, h, rgb) {
        return function (a) {
            ctx.save();
            ctx.fillStyle = rgb;
            ctx.globalAlpha = a;
            ctx.fillRect(x, y, w, h);
            ctx.restore();
        };
    }


    function LinkedListNode(data, list, prev, next) {
        this.data = data;
        this.list = list;
        this.prev = prev;
        this.next = next;
    }

    function LinkedList() {
        this.first = null;
        this.last = null;
    }

    LinkedList.prototype.append = function (data) {
        var node = new LinkedListNode(data, this);
        if (!this.first) {
            this.first = this.last = node;
            node.next = node.prev = node;
        } else {
            var last = this.last;
            this.last = this.first.prev = node;
            node.next = this.first;
            node.prev = last;
            last.next = node;
        }
        return node;
    };

    function ImageData(img) {
        this.primary = new Image();
        this.primary.src = img.src;
        this.hover = this.primary;
        if (img.hoverSrc) {
            this.hover = new Image();
            this.hover.src = img.hoverSrc;
        }
    }

    ImageData.prototype.getImage = function (isMouseOver) {
        return isMouseOver ? this.hover : this.primary;
    }

    function toImageList(srcArray, width, height) {
        var list = new LinkedList();
        for (var i = 0, len = srcArray.length; i < len; i++) {
            var src = srcArray[i];
            if (typeof src === "string")
                src = { src: src, hoverSrc: null };
            list.append(new ImageData(src));
        }
        return list;
    }

    function ImageScroller(ctx, images) {
        var currentNode = images.first,
            width = ctx.canvas.width,
            height = ctx.canvas.height,
            remainingOffset = 0,
            offsetPercentage = 0,
            isMouseOver = false;

        this.onMouseEnter = function () {
            isMouseOver = true;
        };

        this.onMouseLeave = function () {
            isMouseOver = false;
        };

        this.scroll = function (offset) {
            if (remainingOffset !== 0)
                return;
            remainingOffset = offset;
            offsetPercentage = 0.00;
        };

        this.draw = function () {
            if (remainingOffset === 0) {
                ctx.drawImage(currentNode.data.getImage(isMouseOver), 0, 0, width, height);
                return;
            }
            var dir, sibling, first, second;
            if (remainingOffset < 0) {
                dir = 1;
                sibling = currentNode.prev;
                first = currentNode
                second = sibling;
            } else {
                dir = -1;
                sibling = currentNode.next;
                first = currentNode;
                second = sibling;
            }
            offsetPercentage += 0.01;

            var firstX = dir * width * offsetPercentage;
            ctx.drawImage(first.data.getImage(isMouseOver), firstX, 0, width, height);

            var secondX = firstX - width * dir;
            ctx.drawImage(second.data.getImage(isMouseOver), secondX, 0, width, height);

            if (offsetPercentage >= 1) {
                remainingOffset = remainingOffset + dir;
                offsetPercentage = 0.00;
                currentNode = sibling;
            }
        };
    }

    $.fn.imp = function (options) {
        
        if (!options.border)
            options.border = '4px inset #9b9b9b';
        if (!options.backgroundColor)
            options.backgroundColor = '#494949';

        this.css('border', options.border);
        this.css('background-color', options.backgroundColor);


        var self = this;
        /// <var type='HTMLCanvasElement' />
        var canvas = this.get(0);
        var ctx = canvas.getContext('2d');

        var leftXBounded = false,
            rightXBounded = false,
            yBounded = false,
            mouseX = 0,
            mouseY = 0,
            offset = self.offset(),
            height = canvas.height,
            width = canvas.width,
            clickableWidth = width / 10,
            images = toImageList(options.images, width, height),
            invisibleAlpha = 0,
            goalAlpha = 0.3;

        function createClickables(ctx, w, h, rgb, initialAlpha, frameCount) {
            var left = new AlphaFade(alphaRectDraw(ctx, 0, 0, w, h, rgb), initialAlpha, frameCount),
                right = new AlphaFade(alphaRectDraw(ctx, width - clickableWidth, 0, w, h, rgb), initialAlpha, frameCount);
            return {
                left: left,
                right: right,
                draw: function () {
                    left.draw();
                    right.draw();
                }
            };
        }

        var clickables = createClickables(ctx, clickableWidth, height, "#999999", 0, 25),
            imageScroller = new ImageScroller(ctx, images);

        function checkBounds() {
            leftXBounded = mouseX > offset.left && mouseX < offset.left + clickableWidth;
            if (leftXBounded) {
                if (!clickables.left.visible && !clickables.left.fading) {
                    clickables.left.targetAlpha = goalAlpha;
                }
            }
            else {
                if (clickables.left.visible && !clickables.left.fading) {
                    clickables.left.targetAlpha = invisibleAlpha;
                }
            }
            rightXBounded = mouseX > offset.left + width - clickableWidth && mouseX < offset.left + width;
            if (rightXBounded) {
                if (!clickables.right.visible && !clickables.right.fading) {
                    clickables.right.targetAlpha = goalAlpha;
                }
            }
            else {
                if (clickables.right.visible && !clickables.right.fading) {
                    clickables.right.targetAlpha = invisibleAlpha;
                }
            }
            yBounded = mouseY >= offset.top && mouseY <= offset.top + height;
        }

        function draw() {
            offset = self.offset();
            height = canvas.height;
            width = canvas.width;
            clickableWidth = width / 10;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            self.css('cursor', 'auto');
            imageScroller.draw();
            checkBounds();
            clickables.draw();
            if (yBounded) {
                if (leftXBounded || rightXBounded) {
                    self.css('cursor', 'pointer');
                }
            }
        }

        this.mouseenter(imageScroller.onMouseEnter);
        this.mouseleave(imageScroller.onMouseLeave);

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
                    imageScroller.scroll(-1);
                }
                if (rightXBounded) {
                    imageScroller.scroll(1);
                }
            }
        });

        setInterval(draw, Imp.msPerFrame);
        
        return this;
    };
}(jQuery, window, document));