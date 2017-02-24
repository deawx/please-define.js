/**
 * @name please-define.js
 * @version 1.0.1
 * @update Feb 24, 2017
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

        setClass = function (mask, className, isActive) {
            var classes = mask.getAttribute('class').split(' '),
                indexOfActive = classes.indexOf(className);

            delete classes[indexOfActive];

            if (isActive === 'toggle') {
                if (indexOfActive > -1) {
                    setClass(mask, className, false);
                } else {
                    setClass(mask, className, true);
                }
            } else {
                if (isActive === true) {
                    classes.push(className);
                }
                mask.setAttribute('class', classes.join(' '));
            }
        },

        setActive = function (mask, isActive) {

            var belowSpace = document.body.offsetHeight - getOffset(mask).top - mask.offsetHeight;

            setClass(mask, 'active', isActive);
            setTimeout(function () {
                var mask_height = mask.getElementsByTagName('ul')[0].offsetHeight;
                setClass(mask, 'flip', belowSpace < mask_height);
            }, 10);

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
        if (option_list[i].value) {
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
                    this.value = SELECT.value;
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
        setActive(mask, 'toggle');
    };

    for (i = 0; i < mask_options.length - 1; i = i + 1) {
        optionOnClick(mask_options[i]);
    }
    
    input.onkeyup = function (e) {
        var val = this.value,
            keyCode = e.keyCode || e.which,
            options = SELECT.getElementsByTagName('option');

        if (typeof OPTIONS.filter === 'function') {
            val = OPTIONS.filter(val) || val;
        }

        this.value = val;

        if (keyCode === 13) { // if Enter, set value

            setActive(mask, false);
            SELECT.val(val);

            return false;

        }
    };
    
    return SELECT;
};