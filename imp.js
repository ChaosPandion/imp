/// <reference path="jquery-1.8.2.intellisense.js" />

// version 1.0

(function ($, undefined) {
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
            canvas.height = img.height;
            canvas.width = img.width;
            offset = self.offset();
            height = canvas.height;
            width = canvas.width;
            clickableWidth = width / 10;
        }


        function clear() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            self.css('cursor', 'auto');
        }

        function drawSlideArrows() {
            var width = clickableWidth;
            var halfWidth = width / 2;

            ctx.fillStyle = arrowFillStyle;

            var leftX = halfWidth;
            var leftY = canvas.height / 2;
            ctx.beginPath();
            ctx.moveTo(leftX - 10, leftY);
            ctx.lineTo(leftX + 10, leftY + 20);
            ctx.lineTo(leftX + 10, leftY - 20);
            ctx.lineTo(leftX - 10, leftY);
            ctx.fill();
            ctx.closePath();

            var rightX = canvas.width - halfWidth;
            var rightY = leftY;
            ctx.beginPath();
            ctx.moveTo(rightX + 10, rightY);
            ctx.lineTo(rightX - 10, rightY + 20);
            ctx.lineTo(rightX - 10, rightY - 20);
            ctx.lineTo(rightX + 10, rightY);
            ctx.fill();
            ctx.closePath();

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
                    ctx.fillStyle = fillStyle;
                    ctx.fillRect(0, 0, clickableWidth, height);
                    self.css('cursor', 'pointer');
                }
                if (rightXBounded) {
                    ctx.fillStyle = fillStyle;
                    ctx.fillRect(width - clickableWidth, 0, clickableWidth, height);
                    self.css('cursor', 'pointer');
                }
            }
            drawSlideArrows();
        }

        self.bind('mousemove', function (e) {
            mouseX = e.pageX;
            mouseY = e.pageY;
            draw();
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
                    draw();
                }
                if (rightXBounded) {
                    index++;
                    if (index >= images.length)
                        index = images.length - 1;
                    draw();
                }
            }
        });

        self.bind("mouseleave", function (e) {
            mouseX = e.pageX;
            mouseY = e.pageY;
            draw();
        });

        for (var i = 0, len = images.length; i < len; i++) {
            var img = document.createElement("img");
            img.src = images[i];
            images[i] = img;
        }
        draw();
        
        return this;
    };
}(jQuery));