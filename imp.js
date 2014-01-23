/// <reference path="jquery-1.8.2.js" />
/// <reference path="kinetic-v5.0.1.min.js" />

// version 0.7


(function ($, window, document, undefined) {

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

    function ImageData(img, width, height, layer) {
        var primary = new Image();
        primary.src = img.src;
        primary.width = width;
        primary.height = height;
        this.primary = new Kinetic.Image({ image: primary });
        this.primary.visible(false);
        layer.add(this.primary);
        this.hover = this.primary;
        if (img.hoverSrc) {
            var hover = new Image();
            hover.src = img.hoverSrc;
            hover.width = width;
            hover.height = height;
            this.hover = new Kinetic.Image({ image: hover });
            layer.add(this.hover);
        }
    }

    ImageData.prototype.getImage = function (isMouseOver) {
        return isMouseOver ? this.hover : this.primary;
    }

    function toImageList(srcArray, width, height, layer) {
        var list = new LinkedList();
        for (var i = 0, len = srcArray.length; i < len; i++) {
            var src = srcArray[i];
            if (typeof src === "string")
                src = { src: src, hoverSrc: null };
            var x = new ImageData(src, width, height, layer);
            list.append(x);
        }
        return list;
    }

    function ImageScroller(layer, images, speed) {

        var self = this;
        var animation = null;
        var currentNode = images.first;
        var remainingOffset = 0;
        var offsetPercentage = 0;
        var firstImageStartX = 0;
        var secondImageStartX = 0;

        var currentNode = images.first,
            remainingOffset = 0,
            offsetPercentage = 0,
            isMouseOver = false;

        Object.defineProperty(this, 'isMouseOver', { get: function () { return isMouseOver; }, set: function (value) { isMouseOver = value; } })

        this.drawImage = function () {
            var img = currentNode.data.getImage(isMouseOver);
            img.visible(true);
            img.draw();
        }

        function reset() {

            var n = images.first;
            do {
                
                n.data.primary.x(0);
                n.data.primary.y(0);
                n.data.primary.visible(false);
                n.data.hover.x(0);
                n.data.hover.y(0);
                n.data.hover.visible(false);
                n = n.next;
            } while (n !== images.first);

            var img = currentNode.data.getImage(isMouseOver);
            img.visible(true);
            firstImageStartX = 0;

        }

        reset();

        this.scroll = function (offset) {
            if (remainingOffset !== 0)
                return;
            remainingOffset = offset;
            offsetPercentage = 0.00;



            animation = new Kinetic.Animation(function (frame) {

                if (offsetPercentage === 0) {
                    reset();
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



                var firstImage = first.data.getImage(isMouseOver);
                var secondImage = second.data.getImage(isMouseOver);

                if (offsetPercentage === 0) {
                    secondImageStartX = layer.width() * dir * -1;
                    secondImage.x(secondImageStartX);
                    secondImage.visible(true);
                }


                var percent = Math.max(0.01, Math.min(1, frame.time / speed));
                var offset = dir * layer.width() * percent;

                firstImage.x(firstImageStartX + offset);
                secondImage.x(secondImageStartX + offset);
                offsetPercentage = percent;
                if (offsetPercentage >= 1) {
                    remainingOffset = remainingOffset + dir;
                    offsetPercentage = 0.00;
                    currentNode = sibling;
                    reset();
                }

                if (remainingOffset === 0) {
                    animation.stop();
                    animation = null;
                    return;
                }

            }, layer);
            animation.start();
        };
    }

    function LayerFadeAnimation(layer, speed) {
        /// <param name='layer' type='Kinetic.Layer' />

        var startOpacity = layer.opacity();
        var target = 0;
        var difference = 0;
        var animation = null;

        function createAnimation() {
            return new Kinetic.Animation(function (frame) {
                if (frame.time >= speed) {
                    layer.opacity(target);
                    animation.stop();
                    animation = null;
                    return;
                }
                var percent = Math.max(0.01, frame.time / speed);
                var offset = difference * percent;


                //console.log('Frame=============');
                //console.log('percent=' + percent);
                //console.log('offset=' + offset);
                //console.log('=============');

                layer.opacity(Math.min(1, Math.max(0, startOpacity + offset)));
            }, layer);
        }

        function stop() {
            if (animation !== null && animation.isRunning()) {
                animation.stop();
                layer.opacity(target);
                animation = null;
            }
        }

        var self = this;
        Object.defineProperties(this, {
            visible: { get: function () { return layer.opacity() > 0; } },
            fading: { get: function () { return animation.isRunning(); } },
            start: {
                value: function (targetOpacity) {
                    target = targetOpacity;
                    startOpacity = layer.opacity();
                    difference = target - layer.opacity();
                    if (animation !== null && animation.isRunning()) {
                        animation.stop();
                        layer.opacity(target);
                    }
                    animation = createAnimation();
                    animation.start();
                }
            }
        });
    }

    $.fn.imp = function (options) {
        
        if (!options.height)
            options.height = 100;
        if (!options.width)
            options.width = 100;
        if (!options.buttonFadeSpeed)
            options.buttonFadeSpeed = 500;
        if (!options.scrollSpeed)
            options.scrollSpeed = 1000;
        
        var self = this;
        var buttonWidth = 75,
            buttonOpacity = 0.3,
            buttonCornerRadius = 30,
            buttonFill = "blue";

        var stage = new Kinetic.Stage({
            container: 'container',
            height: options.height,
            width: options.width
        });

        var imageLayer = new Kinetic.Layer({
            height: options.height,
            width: options.width
        });
        var images = toImageList(options.images, options.width, options.height, imageLayer);
        var buttonLayer = new Kinetic.Layer({opacity: 0});
        var fadeAnim = new LayerFadeAnimation(buttonLayer, options.buttonFadeSpeed);

        var imageLayerBack = new Kinetic.Rect({ height: stage.height(), width: stage.width(), opacity: 0 });
        imageLayer.add(imageLayerBack);

        function createButton(x, scrollOffset) {
            var btn = new Kinetic.Rect({
                x: x,
                y: 0,
                height: stage.height(),
                width: buttonWidth,
                fill: buttonFill,
                cornerRadius: buttonCornerRadius
            });
            btn.on('mouseenter', function (e) {
                self.css('cursor', 'pointer');
            });
            btn.on('mouseleave', function (e) {
                self.css('cursor', 'auto');
            });
            btn.on('click', function (e) {
                imageScroller.scroll(scrollOffset);
            });
            return btn;
        }


        var imageScroller = new ImageScroller(imageLayer, images, options.scrollSpeed);
        var buttonLayerBack = new Kinetic.Rect({ height: stage.height(), width: stage.width(), opacity: 0 });
        var leftButton = createButton(0, -1);
        var rightButton = createButton(stage.width() - buttonWidth, 1);
        
        buttonLayer.add(buttonLayerBack);
        buttonLayer.add(leftButton);
        buttonLayer.add(rightButton);


        stage.add(imageLayer);
        stage.add(buttonLayer);

        stage.on('mouseenter', function (e) {
            fadeAnim.start(buttonOpacity);
            imageScroller.isMouseOver = true;
            imageScroller.drawImage();
        });
        stage.on('mouseleave', function (e) {
            fadeAnim.start(0);
            imageScroller.isMouseOver = false;
            imageScroller.drawImage();
        });


        stage.draw();
        
        return this;
    };

}(jQuery, window, document));