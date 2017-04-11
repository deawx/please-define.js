/**
 * @name please-define.js
 * @version 1.1.3
 * @update Apr 11, 2017
 * @website https://github.com/earthchie/please-define.js
 * @author Earthchie http://www.earthchie.com/
 * @license WTFPL v.2 - http://www.wtfpl.net/
 **/

window.PleaseDefine = window.PleaseDefine || function (SELECT, OPTIONS) {

    'use strict';

    OPTIONS = OPTIONS || {};
    OPTIONS.placeholder = OPTIONS.placeholder || 'Other, please define.';
    OPTIONS.required = OPTIONS.required || SELECT.getAttribute('required') === '';
    OPTIONS.label_empty = OPTIONS.label_empty || '- Please Choose -';

    var val = SELECT.value,
        option_list = SELECT.getElementsByTagName('option'),
        mask = document.createElement('div'),
        mask_options = '',
        label = OPTIONS.label_empty,
        i,
        span,
        input,

        /* Utils */
        triggerOnChange = function () {

            if (document.createEvent === undefined) {
                SELECT.fireEvent('onchange');
            } else {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent('change', false, true);
                SELECT.dispatchEvent(evt);
            }
        },

        insertAfter = function (newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        },

        getOffset = function (el) {
            var rect = el.getBoundingClientRect();

            return {
                top: rect.top + document.body.scrollTop,
                left: rect.left + document.body.scrollLeft
            };
        },

        elementInViewport = function (el) {
            var top = el.offsetTop;
            var left = el.offsetLeft;
            var width = el.offsetWidth;
            var height = el.offsetHeight;

            while (el.offsetParent) {
                el = el.offsetParent;
                top += el.offsetTop;
                left += el.offsetLeft;
            }

            return (
                top >= window.pageYOffset &&
                left >= window.pageXOffset &&
                (top + height) <= (window.pageYOffset + window.innerHeight) &&
                (left + width) <= (window.pageXOffset + window.innerWidth)
            );
        },

        setClass = function (mask, className, isActive) {
            var classes = mask.getAttribute('class').split(' ').filter(function(c){
                    return c !== '';
                }), indexOfActive = classes.indexOf(className);

            delete classes[indexOfActive];

            if (isActive === true) {
                classes.push(className);
            }
            mask.setAttribute('class', classes.join(' '));
        },

        setActive = function (mask, isActive) {
            
            setClass(mask, 'active', isActive);
            
            // flip side to top if options are not visible on viewport
            setClass(mask, 'flip', false);
            setTimeout(function () {
                setClass(mask, 'flip', !elementInViewport(input));
            }, 1);

        },

        optionOnClick = function (option) {
            option.onclick = function () {

                SELECT.value = this.getAttribute('data-value');
                span.innerHTML = this.innerHTML;
                input.value = '';

                setActive(mask, false);
                triggerOnChange();

            };
        };
    /* End - Utils */


    // prepare mask option
    for (i = 0; i < option_list.length; i = i + 1) {
        if (option_list[i].innerHTML !== '') {
            mask_options += '<li data-value="' + option_list[i].value + '">' + option_list[i].innerHTML + '</li>';
        }
    }

    // add <input> as last option
    mask_options += '<li><input type="text" placeholder="' + OPTIONS.placeholder + '"></li>';

    // set class
    mask.setAttribute('class', 'please-define');

    // set label to default value
    label = SELECT.querySelector('[value="' + SELECT.value + '"]');
    if (label === null) {
        label = OPTIONS.label_empty;
    } else {
        label = label.innerHTML;
    }

    mask.innerHTML = '<span>' + label + '</span><ul>' + mask_options + '</ul>';

    insertAfter(mask, SELECT);

    SELECT.style.display = 'none';
    SELECT.appendChild(document.createElement('option'));

    span = mask.getElementsByTagName('span')[0];
    mask_options = mask.getElementsByTagName('li');
    input = mask.getElementsByTagName('input')[0];

    SELECT.val = function (val) {
        if (typeof val === 'string') {
            if (val !== '' || OPTIONS.required === false) {
                var options = SELECT.getElementsByTagName('option'),
                    exists = SELECT.querySelector('[value="' + val + '"]');

                if (exists) {
                    exists = exists.innerHTML;
                } else {
                    exists = false;
                }

                options[options.length - 1].value = val;
                SELECT.value = val;
                span.innerHTML = exists || val || OPTIONS.label_empty;
                triggerOnChange();
            } else {
                if (SELECT.value === SELECT.querySelector('option:last-child').value) {
                    input.value = SELECT.value;
                }
            }
        } else {
            return SELECT.value;
        }
    };

    window.onclick = function () {
        var activeMask = document.querySelector('.please-define.active');
        if (activeMask !== null) {
            setActive(activeMask, false);
        }
    };

    mask.onclick = function (e) {
        e.stopPropagation();
        var activeMask = document.querySelectorAll('.please-define.active');
        for (i = 0; i < activeMask.length; i = i + 1) {
            if (activeMask[i] !== mask) {
                setActive(activeMask[i], false);
            }
        }
    };

    span.onclick = function (e) {
        e.stopPropagation();
        if(mask.getAttribute('class').indexOf('active')>-1){
            setActive(mask, false);
        }else{
            setTimeout(function(){
                setActive(mask, true);
            }, 1);
        }
        
        
    };

    for (i = 0; i < mask_options.length - 1; i = i + 1) {
        optionOnClick(mask_options[i]);
    }

    input.onkeyup = function (e) {
        
        var val = this.value,
            options = SELECT.getElementsByTagName('option');

        if (typeof OPTIONS.filter === 'function') {
            val = OPTIONS.filter(val) || val;
        }

        this.value = val;
        
        return false;
    };
    
    input.onkeypress = function(e){
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            
            setActive(mask, false);
            SELECT.val(this.value);
            
            return false;
            
        }
        
    }

    return SELECT;
};
