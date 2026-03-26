(function () {

    var catExistsCache = {};

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

                if(! classes) {

                    return '';
                }

                return classes.replace(
                    new RegExp('\\b' + remove + '\\b', 'g'),
                    ''
                ).trim();
            },

            add: function (classes, add) {

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
        this.props = {};
        this.attributes = {};
        //
        this.blockFields = {};
        this.shortcode = {};
        this.liveTemplate = {};
        this.liveTemplateAttributes = {};

        this.props = props;
        this.attributes = props && props.attributes || {};

    }

    bfGutenbergBlock.prototype.registerBlockType = function (shortcode, blockFields, liveTemplate, liveTemplateAttributes) {

        this.shortcode = shortcode;
        this.blockFields = blockFields;
        this.liveTemplate = liveTemplate;
        this.liveTemplateAttributes = liveTemplateAttributes;

        var blockID = this.shortcode.block_id || this.shortcode.id.replace(/_/g, '-');
        var category = this.shortcode.category || 'betterstudio';

        if (this.bfGutenbergCatExists(category)) {

            this.blocks.registerBlockType(this.prefix + blockID, {
                title: this.shortcode.name || this.shortcode.id,
                icon: this.blockIcon(),
                category: category,
                edit: this.editBlock.bind(this),
                save: this.saveBlock.bind(this),

                attributes: this.blockAttributes(this.shortcode.id)
            });
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

        if (this.liveTemplateAttributes) {

            attributes = Object.assign(attributes, this.liveTemplateAttributes);
        }

        return attributes;
    };

    bfGutenbergBlock.prototype.editBlock = function (props) {

        var id = props.name.replace(this.prefix, '');

        if (!id || id === props.name) {
            return [];
        }

        if (props.isSelected || !this.props.name) {
            this.props = props;
        }

        var edit = [
            this.buildBlockFields()
        ];

        if (!this.liveTemplate) {

            var isBlockDisabled = !this.shortcode.click_able,
                previewElement = this.element.createElement(
                    this.getComponent('ServerSideRender'),
                    {
                        block: props.name,
                        attributes: props.attributes,
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
        }

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

            var attributeKey, attributeValue;

            if (isChangeClass) {

                var currentClasses = self.props.attributes.className;

                if (field.attribute && field.attribute.enum) {

                    attributeValue = utils.className.removeAll(currentClasses, field.attribute.enum);
                    attributeValue = utils.className.add(attributeValue, value);

                } else if(value === 0 || value === 1) { /// add or remove class

                    var className = field.id;

                    attributeValue = utils.className[
                        value === 1 ? 'add' : 'remove'
                        ](currentClasses, className);
                }

                attributeKey = 'className';

            } else {

                attributeKey = field.id;
                attributeValue = value;
            }

            self.props.attributes[attributeKey] = attributeValue;
            self.props.setAttributes({[attributeKey]: attributeValue});

            return false;
        };


        //// Setup initial value
        var value = '';

        if (isChangeClass) {

            if (field.attribute && this.props.attributes.className) {

                value = _.intersection(
                    field.attribute.enum || [field.id],
                    this.props.attributes.className.split(' ')
                ).shift();
            }
        } else {

            value = this.props.attributes[field.id];
        }

        args.value = value || field.std;

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

        if (this.liveTemplate) {
            elements.push(this.liveTemplate);
        }

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

        return this.shortcode.icon || '';
    };


    var gutenbergCompatibility = {

        init: function () {

            if (!wp.hooks || !wp.hooks.addFilter) {
                return;
            }

            if (!wp.compose || !wp.compose.createHigherOrderComponent) {
                return;
            }

            if (!BF_Gutenberg.stickyFields) {
                return;
            }

            this.registerBlocks();
            this.registerSharedFields();
            this.registerSharedAttributes();
        },

        registerBlocks: function () {

            if (!BF_Gutenberg || !BF_Gutenberg.blocks) {
                return;
            }

            var generator;

            for (var id in BF_Gutenberg.blocks) {

                generator = new bfGutenbergBlock();
                generator.registerBlockType(
                    BF_Gutenberg.blocks[id],
                    BF_Gutenberg.blockFields[id],
                    BF_Gutenberg.liveEdit[id] && BF_Gutenberg.liveEdit[id]['template'],
                    BF_Gutenberg.liveEdit[id] && BF_Gutenberg.liveEdit[id]['attributes']
                );
            }
        },


        extraAttributes(blockName) {

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
})();