'use strict';

var mongoose = require('../../index')(require('mongoose'));
var Schema = mongoose.Schema;
var validate = require('jsonschema').validate;
var assert = require('assert');

var models = require('../models');

describe('schema.jsonSchema', function() {

  it ('should corretly translate all supported types', function () {

    var mSchema = new Schema({
      n: Number,
      s: String,
      d: Date,
      b: Boolean,
      u: Schema.Types.ObjectId,
      r: {type: Schema.Types.ObjectId, ref: 'Book'},
      nestedDoc: {
        n: Number,
        s: String
      },
      an: [Number],
      as: [String],
      ad: [Date],
      ab: [Boolean],
      au: [Schema.Types.ObjectId],
      ar: [{type: Schema.Types.ObjectId, ref: 'Book'}],
      aNestedDoc: [{
        n: Number,
        s: String
      }],
      rn: {type: Number, required: true},
      rs: {type: String, required: true},
      rd: {type: Date, required: true},
      rb: {type: Boolean, required: true},
      ru: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      rr: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Book'
      },
      rNestedDoc: {
        type: {
          n: Number,
          s: String
        },
        required: true
      },
      rar: {
        type: [{type: Schema.Types.ObjectId, ref: 'Book'}],
        required: true
      },
      described: {
        type: String,
        description: 'Described field',
        required: true
      }
    });

    var jsonSchema = mSchema.jsonSchema('Sample');

    assert.deepEqual(jsonSchema, {
      title: 'Sample',
      type: 'object',
      properties: {
        n: { type: 'number' },
        s: { type: 'string' },
        d: { type: 'string', format: 'date-time' },
        b: { type: 'boolean' },
        u: { type: 'string', format: 'uuid', pattern: '[0-9a-fA-F]{24}' },
        r: {
          type: 'string',
          format: 'uuid',
          pattern: '[0-9a-fA-F]{24}',
          'x-ref': 'Book',
          'description': 'Refers to Book'
        },
        nestedDoc: {
          title: 'nestedDoc',
          type: 'object',
          properties: {
            n: { type: 'number' },
            s: { type: 'string' }
          }
        },
        an: { type: 'array', items: { type: 'number' } },
        as: { type: 'array', items: { type: 'string' } },
        ad: {
          type: 'array',
          items: { type: 'string', format: 'date-time' }
        },
        ab: { type: 'array', items: { type: 'boolean' } },
        au: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid',
            pattern: '[0-9a-fA-F]{24}'
          }
        },
        ar: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid',
            pattern: '[0-9a-fA-F]{24}',
            'x-ref': 'Book',
            description: 'Refers to Book'
          }
        },
        aNestedDoc: {
          type: 'array',
          items: {
            title: 'itemOf_aNestedDoc',
            type: 'object',
            properties: {
              s: { type: 'string' },
              n: { type: 'number' }
            }
          }
        },
        rn: { type: 'number' },
        rs: { type: 'string' },
        rd: { type: 'string', format: 'date-time' },
        rb: { type: 'boolean' },
        ru: { type: 'string', format: 'uuid', pattern: '[0-9a-fA-F]{24}' },
        rr: {
          type: 'string',
          format: 'uuid',
          pattern: '[0-9a-fA-F]{24}',
          'x-ref': 'Book',
          description: 'Refers to Book'
        },
        rNestedDoc: {
          title: 'rNestedDoc',
          type: 'object',
          properties: {
            n: { type: 'number' },
            s: { type: 'string' }
          }
        },
        rar: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid',
            pattern: '[0-9a-fA-F]{24}',
            'x-ref': 'Book',
            description: 'Refers to Book'
          }
        },
        described: {
          type: 'string',
          description: 'Described field'
        },
        _id: { type: 'string', format: 'uuid', pattern: '[0-9a-fA-F]{24}' },
        id: {}
      },
      required: [
        'rn', 'rs', 'rd', 'rb', 'ru', 'rr', 'rNestedDoc', 'rar', 'described'
      ]
    });

  });

  it ('should correctly translate nested schemas', function() {
    var mSchema1 = new Schema({
      k: String,
      v: Number
    }, {id: false, _id: false});
    var mSchema2 = new Schema({
      t: {type: String, required: true},
      nD: mSchema1,
      rND: {
        type: mSchema1,
        required: true
      },
      aND: [mSchema1],
      rAND: {
        type: [mSchema1],
        required: true
      }
    });

    var jsonSchema = mSchema2.jsonSchema();

    assert.deepEqual(jsonSchema, {
      type: 'object',
      properties: {
        t: {type: 'string'},
        nD: {
          type: 'object',
          title: 'nD',
          properties: {
            k: {type: 'string'},
            v: {type: 'number'}
          }
        },
        rND: {
          title: 'rND',
          type: 'object',
          properties: {
            k: {type: 'string'},
            v: {type: 'number'}
          }
        },
        aND: {
          type: 'array',
          items: {
            title: 'itemOf_aND',
            type: 'object',
            properties: {
              k: {type: 'string'},
              v: {type: 'number'}
            }
          }
        },
        rAND: {
          type: 'array',
          items: {
            title: 'itemOf_rAND',
            type: 'object',
            properties: {
              k: {type: 'string'},
              v: {type: 'number'}
            }
          }
        },
        _id: {type: 'string', format: 'uuid', pattern: '[0-9a-fA-F]{24}'},
        id: {}
      },
      required: ['t', 'rND', 'rAND']
    })
  });

  it ('should correctly translate many levels of nested Schemas', function () {

    var mSchema1 = new Schema({x: Number}, {id: false, _id: false});
    var mSchema2 = new Schema({y: Number, x: mSchema1}, {id: false, _id: false});
    var mSchema3 = new Schema({z: Number, y: mSchema2}, {id: false, _id: false});
    var mSchema4 = new Schema({
      t: Number,
      xyz: {
        type: {
          x: [{
            type: mSchema1,
            required: true
          }],
          y: {type: mSchema2, required: true},
          z: {type: [mSchema3]}
        },
        required: true
      }
    });

    var jsonSchema = mSchema4.jsonSchema('Sample');

    assert.deepEqual(jsonSchema, {
      title: 'Sample',
      type: 'object',
      properties: {
        t: {type: 'number'},
        xyz: {
          title: 'xyz',
          type: 'object',
          properties: {
            x: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                title: 'itemOf_x',
                properties: {
                  x: {type: 'number'}
                }
              }
            },
            y: {
              type: 'object',
              title: 'y',
              properties: {
                y: {type: 'number'},
                x: {
                  type: 'object',
                  title: 'x',
                  properties: {
                    x: {type: 'number'}
                  }
                }
              }
            },
            z: {
              type: 'array',
              items: {
                type: 'object',
                title: 'itemOf_z',
                properties: {
                  z: {type: 'number'},
                  y: {
                    type: 'object',
                    title: 'y',
                    properties: {
                      y: {type: 'number'},
                      x: {
                        type: 'object',
                        title: 'x',
                        properties: {
                          x: {type: 'number'}
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          required: ['y']
        },
        _id: {type: 'string', format: 'uuid', pattern: '[0-9a-fA-F]{24}'},
        id: {},
      },
      required: ['xyz']
    });

  });

  it ('should correctly translate number value constaints', function () {

    var mSchema = new Schema({
      value: {type: Number, min: -5, max: 50, required: true}
    }, {id: false, _id: false});

    var jsonSchema = mSchema.jsonSchema('Sample');

    assert.deepEqual(jsonSchema, {
      title: 'Sample',
      type: 'object',
      properties: {
        value: {
          type: 'number',
          minimun: -5,
          maximum: 50
        }
      },
      required: ['value']
    });

  });

  it ('should correctly translate string value constaints', function () {

    var mSchema = new Schema({
      valueFromList: {
        type: String,
        enum: ['red', 'green', 'yellow'],
        required: true
      },
      value20_30: {
        type: String,
        minLength: 20,
        maxLength: 30
      },
      value: {type: String, match: /^(?:H|h)ello, .+$/}
    }, {id: false, _id: false});

    var jsonSchema = mSchema.jsonSchema('Sample');

    assert.deepEqual(jsonSchema, {
      title: 'Sample',
      type: 'object',
      properties: {
        valueFromList: {
          type: 'string',
          enum: ['red', 'green', 'yellow']
        },
        value20_30: {
          type: 'string',
          minLength: 20,
          maxLength: 30
        },
        value: {
          type: 'string',
          pattern: '/^(?:H|h)ello, .+$/'
        }
      },
      required: ['valueFromList']
    });

  });

});

describe('model.jsonSchema', function() {

  it ('should process flat schema and -- validate correct entity', function () {
    var jsonSchema = models.Person.jsonSchema();

    var validPerson = {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@mail.net'
    };
    var aPerson = new models.Person(validPerson);
    assert.ok(!aPerson.validateSync());
    assert.equal(validate(validPerson, jsonSchema).errors.length, 0);

  });

  it ('should process flat schema and -- mark invalid entity', function () {
    var jsonSchema = models.Person.jsonSchema();

    var invalidPerson = {
      firstName: 'John',
      lastName: 'Smith',
      email: 12
    };
    var aPerson = new models.Person(invalidPerson);
    assert.ok(aPerson.validateSync());
    assert.equal(validate(invalidPerson, jsonSchema).errors.length, 1);

  });


});
