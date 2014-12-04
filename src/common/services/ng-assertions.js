// Assertions

angular.module('ngAssertions', [])
.factory('ngAssertions', ['$filter', function($filter) {

    function sources() {
        return [
            {
                origin: 'response',
                label: 'JSON Body',
                group: 'Request Body',
                compares: ['primitive', 'object', 'number', 'array', 'beoolean', 'string'],
                needsProperty: true
            }, {
                origin: 'response',
                label: 'XML Body',
                group: 'Request Body',
                compares: ['primitive', 'object', 'number', 'array', 'beoolean', 'string'],
                needsProperty: true
            }, {
                origin: 'response',
                label: 'Text Body',
                group: 'Request Body',
                compares: ['string'],
                needsProperty: false
            }, {
                origin: 'status',
                label: 'Status Code',
                group: 'Status',
                compares: ['number'],
                needsProperty: false
            }, {
                origin: 'headers',
                label: 'Request Headers',
                group: 'Headers',
                compares: ['number', 'beoolean', 'string'],
                needsProperty: true
            }, {
                origin: 'headers',
                label: 'Response Headers',
                group: 'Headers',
                compares: ['number', 'beoolean', 'string'],
                needsProperty: true
            }, {
                origin: 'time',
                label: 'Response Time (ms)',
                group: 'Timing',
                compares: ['number'],
                needsProperty: false
            }, {
                origin: 'size',
                label: 'Response Size (bytes)',
                group: 'Size',
                compares: ['number'],
                needsProperty: false
            }, {
                origin: 'size',
                label: 'Request Size (bytes)',
                group: 'Size',
                compares: ['number'],
                needsProperty: false
            }
        ];
    }
    function assertions() {
        return [
            ///////////////////////////////////////////////////////////////////
            /* Primitives */
            ///////////////////////////////////////////////////////////////////
            {
                label: 'is an object',
                assert: 'is.a.Object',
                group: 'Primitive',
                sourceTypes: [0, 1],
                needsValue: false
            }, {
                label: 'is a number',
                assert: 'is.a.Number',
                group: 'Primitive',
                sourceTypes: [0, 1, 4, 5],
                needsValue: false
            }, {
                label: 'is an array',
                assert: 'is.a.Array',
                group: 'Primitive',
                sourceTypes: [0, 1],
                needsValue: false
            }, {
                label: 'is a boolean',
                assert: 'is.a.Boolean',
                group: 'Primitive',
                sourceTypes: [0, 1, 4, 5],
                needsValue: false
            }, {
                label: 'is a string',
                assert: 'is.a.String',
                group: 'Primitive',
                sourceTypes: [0, 1, 4, 5],
                needsValue: false
            },
            ///////////////////////////////////////////////////////////////////
            /* Objects */
            ///////////////////////////////////////////////////////////////////
            {
                label: 'equals',
                assert: 'eql',
                group: 'Object',
                sourceTypes: [0, 1],
                needsValue: true
            }, {
                label: 'does not equal',
                assert: 'not.eql',
                group: 'Object',
                sourceTypes: [0, 1],
                needsValue: true
            }, {
                label: 'is empty',
                assert: 'empty',
                group: 'Object',
                sourceTypes: [0, 1],
                needsValue: false
            }, {
                label: 'is not empty',
                assert: 'not.empty',
                group: 'Object',
                sourceTypes: [0, 1],
                needsValue: false
            }, {
                label: 'contains',
                assert: 'containDeep',
                group: 'Object',
                sourceTypes: [0, 1],
                needsValue: true
            }, {
                label: 'does not contains',
                assert: 'not.containDeep',
                group: 'Object',
                sourceTypes: [0, 1],
                needsValue: true
            }, {
                label: 'has properties',
                assert: 'have.properties',
                group: 'Object',
                sourceTypes: [0, 1],
                needsValue: true
            }, {
                label: 'has keys',
                assert: 'have.keys',
                group: 'Object',
                sourceTypes: [0, 1],
                needsValue: true
            },
            ///////////////////////////////////////////////////////////////////
            /* Numbers */
            ///////////////////////////////////////////////////////////////////
            {
                label: 'equals',
                assert: 'equal',
                group: 'Number',
                sourceTypes: [0, 1, 3, 4, 5, 6, 7, 8],
                needsValue: true
            }, {
                label: 'not equals',
                assert: 'not.equal',
                group: 'Number',
                sourceTypes: [0, 1, 3, 4, 5, 6, 7, 8],
                needsValue: true
            }, {
                label: 'less than',
                assert: 'lessThan',
                group: 'Number',
                sourceTypes: [0, 1, 3, 4, 5, 6, 7, 8],
                needsValue: true
            }, {
                label: 'greater than',
                assert: 'greaterThan',
                group: 'Number',
                sourceTypes: [0, 1, 3, 4, 5, 6, 7, 8],
                needsValue: true
            }, {
                label: 'is within',
                assert: 'within',
                group: 'Number',
                sourceTypes: [0, 1, 3, 4, 5, 6, 7, 8],
                needsValue: true
            }, {
                label: 'approximately',
                assert: 'approximately',
                group: 'Number',
                sourceTypes: [0, 1, 3, 4, 5, 6, 7, 8],
                needsValue: true
            },
            ///////////////////////////////////////////////////////////////////
            /* Booleans */
            ///////////////////////////////////////////////////////////////////
            {
                label: 'true',
                assert: 'true',
                group: 'Boolean',
                sourceTypes: [0, 1, 4, 5],
                needsValue: false
            }, {
                label: 'false',
                assert: 'false',
                group: 'Boolean',
                sourceTypes: [0, 1, 4, 5],
                needsValue: false
            },
            ///////////////////////////////////////////////////////////////////
            /* Strings */
            ///////////////////////////////////////////////////////////////////
            {
                label: 'equals',
                assert: 'equal',
                group: 'String',
                sourceTypes: [0, 1, 2, 4, 5],
                needsValue: true
            }, {
                label: 'does not equal',
                assert: 'not.equal',
                group: 'String',
                sourceTypes: [0, 1, 2, 4, 5],
                needsValue: true
            }, {
                label: 'is empty',
                assert: 'emptry',
                group: 'String',
                sourceTypes: [0, 1, 2, 4, 5],
                needsValue: false
            }, {
                label: 'is not empty',
                assert: 'not.emptry',
                group: 'String',
                sourceTypes: [0, 1, 2, 4, 5],
                needsValue: false
            }, {
                label: 'length',
                assert: 'have.lengthOf',
                group: 'String',
                sourceTypes: [0, 1, 2, 4, 5],
                needsValue: true
            }, {
                label: 'contains',
                assert: 'containDeep',
                group: 'String',
                sourceTypes: [0, 1, 2, 4, 5],
                needsValue: true
            }, {
                label: 'does not contains',
                assert: 'not.containDeep',
                group: 'String',
                sourceTypes: [0, 1, 2, 4, 5],
                needsValue: true
            }, {
                label: 'match',
                assert: 'match',
                group: 'String',
                sourceTypes: [0, 1, 2, 4, 5],
                needsValue: true
            }, {
                label: 'does not match',
                assert: 'not.match',
                group: 'String',
                sourceTypes: [0, 1, 2, 4, 5],
                needsValue: true
            }
        ];
    }
    return {
        getAssertions: function() {
            var asserts = assertions();
            asserts.forEach(function(assertion, index){
                  assertion.id = index;
            });
            return asserts;
        },
        getSources: function() {
            var assertionSources = sources();
            assertionSources.forEach(function(source, index){
                  source.id = index;
            });
            return assertionSources;
        }
    };
}]);
