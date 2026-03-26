var BFGutenbergAPI = (function () {

    var valuesStack = {},
        propsStack = {};
    var catExistsCache = {};
    var activeBlockID = '';

    var activeProps;

    var utils = {

        className: {

            removeAll: function (classes, classes2remove) {

                var remove = this.remove;

                classes2remove.forEach(function (className) {

                    classes = remove(classes, className);
                });


                return classes;
            },
            remove: function (classes, remove) {

                if (!classes) {

                    return '';
                }

                return classes.replace(
                    new RegExp('\\b' + remove + '\\b', 'g'),
                    ''
                ).trim();
            },

            add: function (classes, add) {

                if (!classes) {

                    return add;
                }

                var classesList = classes.split(' ');

                classesList.push(add);

                return _.unique(classesList).join(' ');
            }
        }
    }

    function bfGutenbergBlock(props) {

        this.element = window.wp && window.wp.element;
        this.blocks = window.wp && window.wp.blocks;
        this.prefix = 'better-studio/';
        this.blockFields = {};
        this.shortcode = {};


        Object.defineProperty(this, 'props', {
            get: function() {

                return activeProps || props;
            }
        })

        this.attributes = props && props.attributes || {};

        if (props && props.clientId && props.attributes) {

            valuesStack[props.clientId] = props.attributes
            propsStack[props.clientId] = props

            if (props.isSelected) {

                activeBlockID = props.clientId;
            }
        }
    }

    bfGutenbergBlock.prototype.overrideBlock = function (settings) {

        this.overrideSettings = settings || {};
    };


    bfGutenbergBlock.prototype.registerBlockType = function (shortcode, blockFields) {

        this.shortcode = shortcode;
        this.blockFields = blockFields;

        var blockID = this.shortcode.block_id || this.shortcode.id.replace(/_/g, '-');
        var category = this.shortcode.category || 'betterstudio';

        if (this.bfGutenbergCatExists(category)) {

            this.blocks.registerBlockType(this.prefix + blockID, _.extend(
                {
                    title: this.shortcode.name || this.shortcode.id,
                    icon: this.blockIcon(),
                    category: category,
                    save: this.saveBlock.bind(this),
                    attributes: this.blockAttributes(this.shortcode.id),
                    example: {
                        preview: true
                    }
                },
                this.overrideSettings,
                {
                    edit: this.editBlock.bind(this),
                }
            ));
        }

    };

    bfGutenbergBlock.prototype.saveBlock = function (props) {

        return null;
    };

    bfGutenbergBlock.prototype.bfGutenbergCatExists = function (category) {

        if (typeof catExistsCache[category] === "undefined") {

            catExistsCache[category] = false;

            var cats = this.blocks.getCategories() || [];

            for (var i = 0; i < cats.length; i++) {

                if (cats[i].slug === category) {

                    catExistsCache[category] = true;
                    break;
                }
            }
        }

        return catExistsCache[category];
    };

    bfGutenbergBlock.prototype.blockAttributes = function (blockId) {

        if (!this.blockFields) {
            return [];
        }

        var attributes = {},
            findDeep = function (field) {

                if (field.id && field.attribute) {
                    attributes[field.id] = field.attribute;
                }

                field.children && field.children.forEach(function (field2) {

                    findDeep(field2);
                });
            };

        this.blockFields.forEach(findDeep);

        ///////// TEST /////////////

        if (this.overrideSettings.filterAttributes) {

            attributes = this.overrideSettings.filterAttributes(attributes);
        }

        return attributes;
    };

    bfGutenbergBlock.prototype.editBlock = function (props) {

        var id = props.name.replace(this.prefix, '');

        if (!id || id === props.name) {
            return [];
        }

        if (props.isSelected || typeof this.props == 'undefined') {
            this.props = props;
        }

        var edit = [];

        if (typeof this.overrideSettings.defaultAttributes === 'undefined' || this.overrideSettings.defaultAttributes) {

            edit.push(this.buildBlockFields());
        }

        if (typeof this.overrideSettings.edit === 'function') {

            edit.push(this.overrideSettings.edit(props));

            return edit;
        }

        var isBlockDisabled = !this.shortcode.click_able,
            previewElement = this.element.createElement(
                this.getComponent('ServerSideRender'),
                {
                    block: props.name,
                    attributes: _.extend(props.attributes,{_updated: Date.now()}),
                    key: 'D2'
                }
            );

        if (isBlockDisabled) {

            previewElement = this.element.createElement(
                this.getComponent('Disabled'),
                {
                    key: 'D1'
                },
                previewElement
            )
        }

        edit.push(previewElement);

        return edit;
    };

    bfGutenbergBlock.prototype.buildElement = function (fields, parentField) {

        var children = [], self = this;

        fields.forEach(function (field) {

            if (field.children) {

                children.push(self.buildElement(field.children, field));

            } else if (Array.isArray(field)) {

                children.push(self.buildElement(field, parentField));

            } else {

                children.push(self.createElement(field));
            }
        });

        return self.createElement(parentField, children);
    };

    bfGutenbergBlock.prototype.createElement = function (field, childElements) {

        var inner = [];

        if (childElements && childElements.length) {
            inner = childElements;
        } else if (field.args && field.args.innerText) {
            inner = field.args.innerText;
        }

        var params = [this.getComponent(field.component), this.componentArgs(field)].concat(inner);

        return this.element.createElement.apply(this.element, params);
    };

    bfGutenbergBlock.prototype.componentArgs = function (field) {

        var args = field.args || {};

        if (field.component === 'Fragment' || field.component.match(/tag_(.+)/)) {
            return args;
        }

        var self = this,
            isChangeClass = field.action === 'add_class';

        args.onChange = args.onChange || function (value) {

            var attributes= {
                [field.id]: value
            }, attributeValue = '';

            if (isChangeClass) {

                var currentClasses = self.props.attributes.className;

                if (field.attribute && field.attribute.enum) {

                    attributeValue = utils.className.removeAll(currentClasses, field.attribute.enum);
                    attributeValue = utils.className.add(attributeValue, value);

                } else if (value === 0 || value === 1) { /// add or remove class

                    var className = field.id;

                    attributeValue = utils.className[
                        value === 1 ? 'add' : 'remove'
                        ](currentClasses, className);

                } else {

                    attributeValue = value;
                }

                if(field.fixed_class) {
                    
                    attributeValue = utils.className.add(attributeValue, field.fixed_class);
                }

                attributes.className = attributeValue;
            }

            self.props.setAttributes(attributes);

            var ID = self.props.clientId;

            if (ID) {

                valuesStack[ID] = _.extend(valuesStack[ID] || {}, attributes);
            }

            return false;
        };

        //// Setup initial value

        args.value = this.props && this.props.attributes[field.id] || field.std;

        if (["block_fragment", "inspector", "edit-panel"].indexOf(args.key) === -1 && typeof args.value === "undefined") {

            args.value = '';
        }

        if(field.component === "TreeSelect") {

            args.selectedId = args.value;
        }

        return args;
    };

    bfGutenbergBlock.prototype.buildBlockFields = function () {

        var elements = [
            {
                id: 'inspector',
                component: 'InspectorControls',
                args: {key: 'inspector'},
                children: [
                    {
                        id: 'bf_edit_panel',
                        component: 'BF_Edit_Panel',
                        args: {
                            type: 'edit-panel',
                        },
                        key: 'bf_edit_panel',
                        children: this.blockFields
                    }
                ]
            }
        ];

        return this.buildElement(elements, {
            id: 'block_fragment',
            component: 'Fragment',
            args: {key: 'block_fragment'},
        });
    };

    bfGutenbergBlock.prototype.getComponent = function (component) {

        var match = component.match(/tag_(.+)/);

        if (match) {
            return match[1];
        }

        if (wp.editor[component]) {

            return wp.editor[component];
        }

        if (wp.components[component]) {
            return wp.components[component];
        }

        if (wp.element[component]) {
            return wp.element[component];
        }
    };

    bfGutenbergBlock.prototype.blockIcon = function () {

        if (this.shortcode.icon_url) {

            return this.element.createElement(
                'img', {src: this.shortcode.icon_url}
            )
        }

        var tabs = 'tabs' == this.shortcode.id ? {
            icon: 'admin-page'
        } : 'align-center';

        return this.shortcode.icon || tabs.icon;
    };


    var gutenbergCompatibility = {

        init: function () {

            if (!wp.hooks || !wp.hooks.addFilter) {
                return;
            }

            if (!wp.compose || !wp.compose.createHigherOrderComponent) {
                return;
            }

            this.registerBlocks();

            if (BF_Gutenberg.stickyFields) {

                this.registerSharedFields();
                this.registerSharedAttributes();
            }
        },

        registerBlocks: function () {

            if (!BF_Gutenberg || !BF_Gutenberg.blocks) {
                return;
            }

            var generator;

            for (var id in BF_Gutenberg.blocks) {

                generator = new bfGutenbergBlock();
                generator.overrideBlock(typeof BF_Gutenebrg_Export === 'object' && BF_Gutenebrg_Export[id]);

                generator.registerBlockType(
                    BF_Gutenberg.blocks[id],
                    BF_Gutenberg.blockFields[id]
                );
            }
        },


        extraAttributes: function(blockName) {

            var attributes = BF_Gutenberg.extraAttributes;
            var filtered = {};

            for (var attributeId in attributes) {

                if (!attributes.hasOwnProperty(attributeId)) {
                    continue;
                }

                var attribute = attributes[attributeId];
                var validBlocks = attribute.for_blocks || [];


                if (validBlocks.indexOf(blockName) > -1) {

                    filtered[attributeId] = attribute;
                }
            }

            return filtered;
        },

        registerSharedAttributes: function () {

            var self = this;

            wp.hooks.addFilter(
                'blocks.registerBlockType',
                'betterstudio/shared_settings',
                function (settings, name) {

                    var attributes = self.extraAttributes(name);

                    if (!_.isEmpty(attributes)) {

                        settings.attributes = _.extend(settings.attributes, attributes);
                    }

                    return settings;
                }
            );

        },

        registerSharedFields: function () {

            wp.hooks.addFilter('editor.BlockEdit', 'betterstudio/shared_settings', wp.compose.createHigherOrderComponent(function (BlockEdit) {

                return function (props) {

                    if(props.isSelected) {
                        activeProps = props;
                    }

                    var generator = new bfGutenbergBlock(props);

                    var validFields = BF_Gutenberg.stickyFields.filter(function (field) {

                        if (field.exclude_blocks && field.exclude_blocks.indexOf(props.name) > -1) {
                            return false;
                        }

                        if (field.include_blocks) {

                            return field.include_blocks.indexOf(props.name) > -1;
                        }

                        return true;
                    });

                    if (!validFields) {

                        return generator.element.createElement(
                            BlockEdit,
                            props
                        );
                    }

                    var hookedElements = generator.buildElement(validFields, {
                            id: 'inspector',
                            component: 'InspectorControls',
                            args: {key: 'inspector'}
                        }
                    );

                    return generator.element.createElement(
                        generator.getComponent('Fragment'),
                        {
                            key: 'E1'
                        },
                        hookedElements,

                        generator.element.createElement(
                            BlockEdit,
                            props
                        )
                    );
                };
            }));
        }
    };

    gutenbergCompatibility.init();

    return {

        activeBlock: function () {

            return activeBlockID;
        },
        blockValues: function (blockID) {

            blockID = blockID || this.activeBlock();

            if (blockID && valuesStack[blockID]) {

                return JSON.parse(JSON.stringify(valuesStack[blockID]));
            }
        },
        blockInstance: function (blockID) {

            blockID = blockID || this.activeBlock();

            if (blockID && propsStack[blockID]) {

                return propsStack[blockID];
            }
        },
        blocksInstances: function(){

            return propsStack;
        }
    };
})();
