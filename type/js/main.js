(function()  {
    function getRandomPalett() {
        $.getJSON("http://www.colourlovers.com/api/palettes/random?format=json&jsonCallback=?", function(data) {
            $.each(data[0].colors, function(index, color) {
                data[0].colors[index] = '#' + color;
            })

            $(document).trigger("paletteLoaded", data[0]);
        })
    }

    getRandomPalett();

    $(document).on("paletteLoaded", function(event, randomPalette) {
        var defaults = {
            palette     : randomPalette.colors,
            lineHeight  : 200,
            min         : 40,
            usePalette  : true,
            drawFrame   : false,
            fonts       : ["monospace", "serif", "sans-serif", "Arial", "Arial Black", "Arial Narrow", "Arial Rounded MT Bold", "Bookman Old Style", "Bradley Hand ITC", "Century", "Century Gothic", "Courier", "Courier New", "Georgia", "Gentium", "Impact", "King", "Lucida Console", "Lalit", "Modena", "Monotype Corsiva"]
        };
        var queryParams = getQueryParams();
        var settings = {
            palette     : getArrayParameter(queryParams.palette),
            lineHeight  : getNumberParameter(queryParams.max),
            min         : getNumberParameter(queryParams.min),
            drawFrame   : getBooleanParameter(queryParams.drawFrame),
            usePalette  : getBooleanParameter(queryParams.usePalette),
            fonts       : getArrayParameter(queryParams.fonts)
        };

        settings = $.extend({}, defaults, settings);

        var availableFonts = detectFonts(settings.fonts);

        //init canvas
        var canvas = document.getElementById("canvas");
        var $canvas = $(canvas);

        canvas.width = $(window).width();
        canvas.height = $(window).height();

        var ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;

        var backgroundColor = getRandomColor();
        ctx.fillStyle=backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if(settings.drawFrame) {
            backgroundColor = getRandomColor()
            ctx.fillStyle=backgroundColor;
        }

        var borderX = canvas.height/100*5;
        var borderY = canvas.height/100*5;
        var picture = {};
        picture.width = canvas.width - 2 * borderX;
        picture.height = canvas.height- 2 * borderY;
        picture.x = borderX;
        picture.y = borderY;
        ctx.fillRect(picture.x, picture.y, picture.width, picture.height);
        removeColor(backgroundColor);

        ctx.textBaseline = "bottom";
        var lineStart = picture.x;
        var currentX = lineStart;
        var currentY = picture.y + settings.lineHeight;

        var text = queryParams.text;
        if(typeof text !== "undefined") {
            var chars = text.split("");
            $.each(chars, function(index, ch) {
                draw(ch);
            });
        }
        document.onkeypress = function(e) {
            e = e || window.event;
            var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
            if (charCode) {
                draw(String.fromCharCode(charCode));
            }
        };

        function removeColor(color) {
            var index = settings.palette.indexOf(color);
            if (index > -1) {
                settings.palette.splice(index, 1);
            }
        }

        function getArrayParameter(param) {
            if(typeof param !== "undefined") {
               return param.split(",");
            }
            return param;
        }

        function getBooleanParameter(param) {
            if(typeof param !== "undefined")
                return param === "true"
            return param;
        }

        function getNumberParameter(param) {
            if(typeof param !== "undefined")
                return Number(param);
            return param;
        }



        function draw(key) {
            if(currentY <= picture.y + picture.height) {
                var font = randomArrayItem(availableFonts);
                ctx.font = randomHeight() + "px " + font;
                
                ctx.fillStyle = getRandomColor();
                ctx.strokeStyle = getRandomColor();
                var messure = ctx.measureText(key, currentX, currentY);
                ctx.fillText(key, currentX, currentY);
                console.log(font);
                currentX += messure.width;
                if (currentX >= picture.width) {
                    currentY += settings.lineHeight;
                    currentX = lineStart;
                }
            }
            
        }


        function getQueryParams() {
            var qs = document.location.search.split("+").join(" ");

            var params = {}, tokens,
                re = /[?&]?([^=]+)=([^&]*)/g;

            while (tokens = re.exec(qs)) {
                params[decodeURIComponent(tokens[1])]
                    = decodeURIComponent(tokens[2]);
            }

            return params;
        }

        function randomArrayItem(array) {
            return array[Math.floor(Math.random() * array.length)];
        }

        function detectFonts(fonts) {
            var available = [];
            $.each(fonts, function(index, font) {
                if (isFontPresent(font)) {
                    available.push(font);
                }
            })

            return available;
        }

        function getRandomColor() {
            if(settings.usePalette) {
                var color = randomArrayItem(settings.palette);
                return color;
            }

            var letters = "0123456789ABCDEF".split("");
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += randomArrayItem(letters);
            }
            return color;
            
        }

        function randomHeight() {
            return Math.random() * (settings.lineHeight - settings.min) + settings.min;
        }


        function isFontPresent(font) {
            var detective = new Detector();
            return detective.detect(font);
        }

    });

})();
