(function() {
    let pressedKeys = {};

    function getKey(event, status) {
        let key;

        switch(event) {
            case 32:
                key = 'SPACE'; break;
            case 37:
                key = 'LEFT'; break;
            case 39:
                key = 'RIGHT'; break;
        }

        pressedKeys[key] = status;
        
    }

    document.addEventListener('keydown', function(e) {
        e = testKey(e);
        if(!e) return;

        getKey(e, true);
    });

    document.addEventListener('keyup', function(e) {
        e = testKey(e);
        if(!e) return;
        
        getKey(e, false);
    });

    let testKey = event => {
        event = event.keyCode;
        if(event !== 32 && event !== 37 && event !== 39) return; 
        return event;
    }

    window.input = {
        isDown: function(key) {
            return pressedKeys[key.toUpperCase()];
        }
    };
})();