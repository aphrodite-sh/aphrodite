import { InboundEdgesAst, SchemaFile, SchemaFileAst } from '@aphro/schema-api';

export const contents = `
engine: sqlite
db: test
complex: {
  a: b
  c: d
}

Person as Node {
  id: ID<Person>
  name: NaturalLanguage
  walletId: ID<Wallet>
  thing1: string
  thing2: string
} & OutboundEdges {
  wallet: Edge<Person.walletId>
  friends: Edge<Person>
  cars: Edge<Car.ownerId>
  follows: FollowEdge
  followedBy: FollowerEdge
} & InboundEdges {
  fromWallet: Edge<Person.walletId>
} & Index {
  walletId: unique(walletId)
  compound: thing1, thing2
  thing2
}

FollowEdge as Edge<Person, Person> {
  when: Timestamp
} & Invert as FollowerEdge

Wallet as Node {
  id: ID<Wallet>
  balance: float32
  status: Enumeration<Active | Locked>
  alias: NaturalLanguage
}

Transaction as Node {
  id: ID<Transaction>
  time: Timestamp
  blob: Map<string, string>
  blobOfBlob: Map<string, Map<string, string>>
  list: Array<string>
}

Pig as Node {
  optional: string | null
}
`;

export const ast: SchemaFileAst = {
  preamble: {
    engine: 'sqlite',
    db: 'test',
    complex: {
      a: 'b',
      c: 'd',
    },
  },
  entities: [
    {
      type: 'node',
      name: 'Person',
      fields: [
        {
          type: 'id',
          name: 'id',
          of: 'Person',
        },
        {
          name: 'name',
          type: 'naturalLanguage',
        },
        {
          name: 'walletId',
          type: 'id',
          of: 'Wallet',
        },
        {
          name: 'thing1',
          type: 'primitive',
          subtype: 'string',
        },
        {
          name: 'thing2',
          type: 'primitive',
          subtype: 'string',
        },
      ],
      extensions: [
        {
          name: 'outboundEdges',
          declarations: [
            {
              name: 'wallet',
              type: 'edge',
              throughOrTo: {
                type: 'Person',
                column: 'walletId',
              },
            },
            {
              name: 'friends',
              type: 'edge',
              throughOrTo: {
                type: 'Person',
              },
            },
            {
              name: 'cars',
              type: 'edge',
              throughOrTo: {
                type: 'Car',
                column: 'ownerId',
              },
            },
            {
              name: 'follows',
              type: 'edgeReference',
              reference: 'FollowEdge',
            },
            {
              name: 'followedBy',
              type: 'edgeReference',
              reference: 'FollowerEdge',
            },
          ],
        },
        {
          name: 'inboundEdges',
          declarations: [
            {
              name: 'fromWallet',
              type: 'edge',
              throughOrTo: {
                type: 'Person',
                column: 'walletId',
              },
            },
          ],
        } as InboundEdgesAst,
        {
          name: 'index',
          declarations: [
            {
              name: 'walletId',
              type: 'unique',
              columns: ['walletId'],
            },
            {
              name: 'compound',
              type: 'nonUnique',
              columns: ['thing1', 'thing2'],
            },
            {
              name: 'thing2',
              type: 'nonUnique',
              columns: ['thing2'],
            },
          ],
        },
      ],
    },
    {
      type: 'edge',
      src: {
        type: 'Person',
      },
      dest: {
        type: 'Person',
      },
      name: 'FollowEdge',
      fields: [
        {
          type: 'timestamp',
          name: 'when',
        },
      ],
      extensions: [
        {
          name: 'invert',
          as: 'FollowerEdge',
        },
      ],
    },
    {
      type: 'node',
      name: 'Wallet',
      fields: [
        {
          name: 'id',
          type: 'id',
          of: 'Wallet',
        },
        {
          name: 'balance',
          type: 'primitive',
          subtype: 'float32',
        },
        {
          name: 'status',
          type: 'enumeration',
          keys: ['Active', 'Locked'],
        },
        {
          name: 'alias',
          type: 'naturalLanguage',
        },
      ],
      extensions: [],
    },
    {
      type: 'node',
      name: 'Transaction',
      fields: [
        {
          name: 'id',
          type: 'id',
          of: 'Transaction',
        },
        {
          name: 'time',
          type: 'timestamp',
        },
        {
          name: 'blob',
          type: 'map',
          keys: {
            type: 'primitive',
            subtype: 'string',
          },
          values: {
            type: 'primitive',
            subtype: 'string',
          },
        },
        {
          name: 'blobOfBlob',
          type: 'map',
          keys: {
            type: 'primitive',
            subtype: 'string',
          },
          values: {
            type: 'map',
            keys: {
              type: 'primitive',
              subtype: 'string',
            },
            values: {
              type: 'primitive',
              subtype: 'string',
            },
          },
        },
        {
          name: 'list',
          type: 'array',
          values: {
            type: 'primitive',
            subtype: 'string',
          },
        },
      ],
      extensions: [],
    },
    {
      type: 'node',
      name: 'Pig',
      fields: [
        {
          name: 'optional',
          type: 'primitive',
          subtype: 'string',
          nullable: true,
        },
      ],
      extensions: [],
    },
  ],
};

export const schemaFile: SchemaFile = {
  nodes: {
    Person: {
      type: 'node',
      name: 'Person',
      primaryKey: 'id',
      fields: {
        id: {
          type: 'id',
          name: 'id',
          of: 'Person',
        },
        name: {
          name: 'name',
          type: 'naturalLanguage',
        },
        walletId: {
          name: 'walletId',
          type: 'id',
          of: 'Wallet',
        },
        thing1: {
          name: 'thing1',
          type: 'primitive',
          subtype: 'string',
        },
        thing2: {
          name: 'thing2',
          type: 'primitive',
          subtype: 'string',
        },
      },
      extensions: {
        outboundEdges: {
          name: 'outboundEdges',
          edges: {
            wallet: {
              name: 'wallet',
              type: 'edge',
              throughOrTo: {
                type: 'Person',
                column: 'walletId',
              },
            },
            friends: {
              name: 'friends',
              type: 'edge',
              throughOrTo: {
                type: 'Person',
              },
            },
            cars: {
              name: 'cars',
              type: 'edge',
              throughOrTo: {
                type: 'Car',
                column: 'ownerId',
              },
            },
            follows: {
              name: 'follows',
              type: 'edgeReference',
              reference: 'FollowEdge',
            },
            followedBy: {
              name: 'followedBy',
              type: 'edgeReference',
              reference: 'FollowerEdge',
            },
          },
        },
        inboundEdges: {
          name: 'inboundEdges',
          edges: {
            fromWallet: {
              name: 'fromWallet',
              type: 'edge',
              throughOrTo: {
                type: 'Person',
                column: 'walletId',
              },
            },
          },
        },
        index: {
          name: 'index',
          declarations: [
            {
              name: 'walletId',
              type: 'unique',
              columns: ['walletId'],
            },
            {
              name: 'compound',
              type: 'nonUnique',
              columns: ['thing1', 'thing2'],
            },
            {
              name: 'thing2',
              type: 'nonUnique',
              columns: ['thing2'],
            },
          ],
        },
      },
      storage: {
        name: 'storage',
        type: 'sql',
        engine: 'sqlite',
        db: 'test',
        tablish: 'person',
      },
    },
    Wallet: {
      type: 'node',
      name: 'Wallet',
      primaryKey: 'id',
      fields: {
        id: {
          name: 'id',
          type: 'id',
          of: 'Wallet',
        },
        balance: {
          name: 'balance',
          type: 'primitive',
          subtype: 'float32',
        },
        status: {
          name: 'status',
          type: 'enumeration',
          keys: ['Active', 'Locked'],
        },
        alias: {
          name: 'alias',
          type: 'naturalLanguage',
        },
      },
      extensions: {},
      storage: {
        name: 'storage',
        type: 'sql',
        engine: 'sqlite',
        db: 'test',
        tablish: 'wallet',
      },
    },
    Transaction: {
      type: 'node',
      name: 'Transaction',
      primaryKey: 'id',
      fields: {
        id: {
          name: 'id',
          type: 'id',
          of: 'Transaction',
        },
        time: {
          name: 'time',
          type: 'timestamp',
        },
        blob: {
          name: 'blob',
          type: 'map',
          keys: {
            type: 'primitive',
            subtype: 'string',
          },
          values: {
            type: 'primitive',
            subtype: 'string',
          },
        },
        blobOfBlob: {
          name: 'blobOfBlob',
          type: 'map',
          keys: {
            type: 'primitive',
            subtype: 'string',
          },
          values: {
            type: 'map',
            keys: {
              type: 'primitive',
              subtype: 'string',
            },
            values: {
              type: 'primitive',
              subtype: 'string',
            },
          },
        },
        list: {
          name: 'list',
          type: 'array',
          values: {
            type: 'primitive',
            subtype: 'string',
          },
        },
      },
      extensions: {},
      storage: {
        name: 'storage',
        type: 'sql',
        engine: 'sqlite',
        db: 'test',
        tablish: 'transaction',
      },
    },
    Pig: {
      type: 'node',
      name: 'Pig',
      primaryKey: 'id',
      fields: {
        optional: {
          name: 'optional',
          nullable: true,
          subtype: 'string',
          type: 'primitive',
        },
      },
      extensions: {},
      storage: {
        name: 'storage',
        type: 'sql',
        engine: 'sqlite',
        db: 'test',
        tablish: 'pig',
      },
    },
  },
  edges: {
    FollowEdge: {
      type: 'standaloneEdge',
      name: 'FollowEdge',
      src: {
        type: 'Person',
      },
      dest: {
        type: 'Person',
      },
      fields: {
        when: {
          type: 'timestamp',
          name: 'when',
        },
      },
      extensions: {
        invert: {
          name: 'invert',
          as: 'FollowerEdge',
        },
      },
      storage: {
        name: 'storage',
        type: 'sql',
        engine: 'sqlite',
        db: 'test',
        tablish: 'followedge',
      },
    },
  },
};
